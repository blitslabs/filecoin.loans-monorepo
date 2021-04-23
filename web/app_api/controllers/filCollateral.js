const { sendJSONresponse } = require('../utils')
const {
    ERC20Loan,
    Endpoint, ProtocolContract, LoanEvent, LogTopic, sequelize,
    FILCollateral
} = require('../models/sequelize')
const Web3 = require('web3')
const { ABI } = require('../config/ABI')
const BigNumber = require('bignumber.js')

const { HttpJsonRpcConnector, LotusClient } = require('filecoin.js')
const web3 = new Web3()
const { verifySignature, decodeVoucher } = require('../utils/filecoin')
const filecoin_signer = require('@zondax/filecoin-signing-tools')
BigNumber.set({ EXPONENTIAL_AT: 25 })

module.exports.confirmCollateralPayCh = async (req, res) => {

    let { message, signature } = req.body

    if (!message || !signature) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required arguments' })
        return
    }

    // Verify signature
    const signatureIsValid = verifySignature(signature, typeof message === 'object' ? JSON.stringify(message) : message)

    if (!signatureIsValid) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid signature' })
        return
    }

    // Parse message
    message = typeof message === 'object' ? message : JSON.parse(message)

    // Check Event already exists
    const loanEventExists = await LoanEvent.findOne({
        where: {
            txHash: message.CID['/']
        }
    })

    if (loanEventExists) {
        sendJSONresponse(res, 200, { status: 'OK', message: 'Operation already confirmed' })
        return
    }

    // Get FIL Endpoint
    const endpoint = await Endpoint.findOne({
        where: {
            endpointType: 'HTTP',
            networkId: message.network
        }
    })

    // Check Endpoint
    if (!endpoint) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Endpoint not found' })
        return
    }

    // Connect Provider
    const connector = new HttpJsonRpcConnector({ url: endpoint.endpoint, token: endpoint.authToken })
    const lotus = new LotusClient(connector)

    // Get Payment Channel State
    const paymentChannelState = await lotus.state.readState(message.paymentChannelId)

    // Convert addressId to robustAddress
    const from = await lotus.state.accountKey(paymentChannelState.State.From)
    const to = await lotus.state.accountKey(paymentChannelState.State.To)

    // Prepare payment channel data
    const balance = BigNumber(paymentChannelState.Balance).dividedBy(1e18).toString()
    const settlingAt = paymentChannelState.State.SettlingAt
    const minSettleHeight = paymentChannelState.State.MinSettleHeight

    // Check payment channel data
    if (from !== message.filBorrower || to !== message.filLender || balance !== message.lockAmount) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid payment channel' })
        return
    }

    // Check payment channel state
    if (settlingAt != 0 || minSettleHeight != 0) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid payment channel' })
        return
    }

    sequelize.transaction(async (t) => {

        // Find Loan Offer
        const erc20Loan = await ERC20Loan.findOne({
            where: {
                contractLoanId: message.contractLoanId,
                filLender: web3.utils.toHex(message.filLender),
                erc20LoansContract: message.erc20LoansContract,
                networkId: message.erc20LoansNetworkId,
                state: 0
            },
            transaction: t
        })

        if (!erc20Loan) {
            sendJSONresponse(res, 404, { status: 'ERROR', message: 'ERC20 Loan not found' })
            return
        }

        // Save FIL Collateral
        const [filCollateral, created] = await FILCollateral.findOrCreate({
            where: {
                paymentChannelId: message.paymentChannelId
            },
            defaults: {
                paymentChannelId: message.paymentChannelId,
                paymentChannelAddress: message.paymentChannelAddress,
                filBorrower: from,
                filLender: to,
                ethBorrower: message.ethBorrower,
                ethLender: message.ethLender,
                amount: balance,
                secretHashA1: message.secretHashA1,
                signature,
                message: JSON.stringify(message),
                txHash: message.CID['/'],
                network: message.network,
                erc20LoanId: erc20Loan.id,
                erc20LoanContractId: erc20Loan.contractLoanId,
                erc20LoansContract: erc20Loan.erc20LoansContract,
                erc20LoansNetworkId: erc20Loan.networkId
            },
            transaction: t
        })

        // Save Event
        const [loanEvent, loanEventCreated] = await LoanEvent.findOrCreate({
            where: {
                txHash: message.CID['/']
            },
            defaults: {
                txHash: message.CID['/'],
                event: 'LendERC20/LockCollateral',
                loanId: message.loanId,
                blockchain: 'FIL',
                networkId: message.network,
                loanType: 'ERC20FIL'
            },
            transaction: t
        })

        sendJSONresponse(res, 200, { status: 'OK', message: 'FIL Collateral Lock operation confirmed' })
        return
    })
        .catch((err) => {
            console.log(err)
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'An error occurred. Please try again' })
            return
        })
}

module.exports.confirmCollateralVoucher = async (req, res) => {

    const { signedVoucher, paymentChannelId } = req.body

    if (!signedVoucher || !paymentChannelId) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required arguments' })
        return
    }

    // Fetch FIL Collatera
    const filCollateral = await FILCollateral.findOne({
        where: {
            paymentChannelId
        }
    })

    if (!filCollateral) {
        sendJSONresponse(res, 404, { status: 'ERROR', message: 'Filecoin Collateral not found' })
        return
    }

    // Verify Voucher
    try {
        const voucherIsVerified = await filecoin_signer.verifyVoucherSignature(signedVoucher, filCollateral.filBorrower)
        if (!voucherIsVerified) {
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'Failed to verify signed voucher' })
            return
        }
    } catch (e) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Failed to verify signed voucher' })
        return
    }

    if (filCollateral.signedVoucher) {
        sendJSONresponse(res, 200, { status: 'OK', message: 'Signed voucher already saved' })
        return
    }

    sequelize.transaction(async (t) => {
        // Save signed voucher
        filCollateral.signedVoucher = signedVoucher
        filCollateral.state = '1'
        await filCollateral.save({ transaction: t })

        // Save Collateral Event
        const [loanEvent, loanEventCreated] = await LoanEvent.findOrCreate({
            where: {
                txHash: signedVoucher
            },
            defaults: {
                txHash: signedVoucher,
                event: 'LendERC20/SignCollateralVoucher',
                loanId: filCollateral.erc20LoanId,
                blockchain: 'FIL',
                networkId: filCollateral.network,
                loanType: 'FILERC20'
            },
            transaction: t 
        })

        sendJSONresponse(res, 200, { status: 'OK', message: 'Signed voucher saved' })
        return
    })
        .catch((err) => {
            console.log(err)
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'Failed to save signed voucher' })
            return
        })
}