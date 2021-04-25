const { sendJSONresponse } = require('../utils')
const {
    ERC20CollateralLock, Endpoint, FILLoan, LoanEvent, Loan
} = require('../models/sequelize')
const { sequelize } = require('../models/sequelize')
const BigNumber = require('bignumber.js')
const Web3 = require('web3')
const { HttpJsonRpcConnector, LotusClient } = require('filecoin.js')
const web3 = new Web3()
const { verifySignature } = require('../utils/filecoin')
const filecoin_signer = require('@zondax/filecoin-signing-tools')
BigNumber.set({ EXPONENTIAL_AT: 25 })

module.exports.confirmLendOperation = async (req, res) => {

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

    // Fetch FIL endpoint
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

    // const receipt = await lotus.chain.getMessage(message.CID)

    const paymentChannelState = await lotus.state.readState(message.paymentChannelId)

    // Convert addressId to robustAddress
    const from = await lotus.state.accountKey(paymentChannelState.State.From)
    const to = await lotus.state.accountKey(paymentChannelState.State.To)

    // Prepare payment channel data
    const balance = BigNumber(paymentChannelState.Balance).dividedBy(1e18).toString()
    const settlingAt = paymentChannelState.State.SettlingAt
    const minSettleHeight = paymentChannelState.State.MinSettleHeight

    // Check payment channel data
    if (from !== message.filLender || to !== message.filBorrower || balance !== message.principalAmount) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid payment channel' })
        return
    }

    // Check payment channel state
    if (settlingAt != 0 || minSettleHeight != 0) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid payment channel' })
        return
    }

    sequelize.transaction(async (t) => {
        // Find Borrow Request
        const erc20CollateralLock = await ERC20CollateralLock.findOne({
            where: {
                contractLoanId: message.contractLoanId,
                borrower: message.ethBorrower,
                filBorrower: web3.utils.toHex(message.filBorrower),
                collateralLockContractAddress: message.erc20CollateralLock,
                principalAmount: message.principalAmount,
                networkId: message.collateralNetwork,
                state: 0
            },
            transaction: t
        })

        if (!erc20CollateralLock) {
            sendJSONresponse(res, 404, { status: 'ERROR', message: 'Collateral Lock not found' })
            return
        }

        // Update CollateralLockState
        erc20CollateralLock.state = 0.5
        await erc20CollateralLock.save({ transaction: t })

        // Save Fil Loan
        const [filLoan, created] = await FILLoan.findOrCreate({
            where: {
                paymentChannelId: message.paymentChannelId
            },
            defaults: {
                paymentChannelId: message.paymentChannelId,
                paymentChannelAddress: message.paymentChannelAddress,
                filLender: from,
                filBorrower: to,
                ethLender: message.ethLender,
                ethBorrower: message.ethBorrower,
                lockedAmount: balance,
                amountToSend: 0, // remove?
                network: message.network,
                secretHashB1: message.secretHashB1,
                principalAmount: message.principalAmount,
                signature,
                message: JSON.stringify(message),
                txHash: message.CID['/'],
                collateralLockId: erc20CollateralLock.id,
                collateralLockContractId: erc20CollateralLock.contractLoanId,
                collateralLockContractAddress: erc20CollateralLock.collateralLockContractAddress,
                collateralLockNetworkId: erc20CollateralLock.networkId
            },
            transaction: t
        })

        // Save Event/Tx
        const [loanEvent, loanEventCreated] = await LoanEvent.findOrCreate({
            where: {
                txHash: message.CID['/']
            },
            defaults: {
                txHash: message.CID['/'],
                event: 'LendFIL/CreatePaymentChannel',
                loanId: message.loanId,
                blockchain: 'FIL',
                networkId: message.network,
                loanType: 'FILERC20'
            },
            transaction: t
        })

        sendJSONresponse(res, 200, { status: 'OK', message: 'Lend FIL operation saved' })
        return
    })
        .catch((err) => {
            console.log(err)
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'An error occurred. Please try again' })
            return
        })
}

module.exports.confirmSignWithdrawVoucherOperation = async (req, res) => {

    const { signedVoucher, paymentChannelId } = req.body

    if (!signedVoucher || !paymentChannelId) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required arguments' })
        return
    }

    // Fetch FIL Loan
    const filLoan = await FILLoan.findOne({
        where: {
            paymentChannelId,
        }
    })

    // Verify Voucher
    try {
        const voucherIsVerified = await filecoin_signer.verifyVoucherSignature(signedVoucher, filLoan.filLender)
        if (!voucherIsVerified) {
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'Failed to verify signed voucher' })
            return
        }
    } catch (e) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Failed to verify signed voucher' })
        return
    }

    if (filLoan.signedVoucher) {
        sendJSONresponse(res, 200, { status: 'OK', message: 'Signed voucher already saved' })
        return
    }

    sequelize.transaction(async (t) => {
        // Save Signed Voucher
        filLoan.signedVoucher = signedVoucher
        filLoan.state = '1'
        await filLoan.save({ transaction: t })

        // Save Loan Event
        const [loanEvent, loanEventCreated] = await LoanEvent.findOrCreate({
            where: {
                txHash: signedVoucher
            },
            defaults: {
                txHash: signedVoucher,
                event: 'LendFIL/SignWithdrawVoucher',
                loanId: filLoan.collateralLockId,
                blockchain: 'FIL',
                networkId: filLoan.network,
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


module.exports.confirmRedeemWithdrawVoucher = async (req, res) => {

    const { CID, network } = req.body

    if (!CID || !network) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required arguments' })
        return
    }

    const loanEvent = await LoanEvent.findOne({
        where: {
            txHash: CID
        }
    })

    if (loanEvent) {
        sendJSONresponse(res, 200, { status: 'OK', message: 'Operation already confirmed' })
        return
    }

    // Fetch FIL endpoint
    const endpoint = await Endpoint.findOne({
        where: {

            endpointType: 'HTTP',
            networkId: network
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

    // Get Message
    const message = await lotus.chain.getMessage({ "/": CID })

    // Deserialize Params
    const params = filecoin_signer.deserializeParams(message.Params, "fil/2/paymentchannel", 2)

    if (!('secret' in params && params.secret)) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Secret not found message params' })
        return
    }

    // Deserialize secret from message params
    const secretA1 = String.fromCharCode.apply(null, params.secret)    

    // Get Payment Channel State
    const paymentChannelState = await lotus.state.readState(message.To)
    // console.log(paymentChannelState)

    // Update FILLoan
    const filLoan = await FILLoan.findOne({
        where: {
            paymentChannelId: message.To,
            state: 1
        }
    })

    if (!filLoan) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'FIL loan not found' })
        return
    }

    sequelize.transaction(async (t) => {

        filLoan.secretA1 = secretA1
        filLoan.state = 2
        await filLoan.save({ transaction: t })

        // Save LoanEvent
        await LoanEvent.create({
            txHash: CID,
            event: 'LendFIL/RedeemWithdrawVoucher',
            loanId: filLoan.collateralLockId,
            blockchain: 'FIL',
            networkId: network,
            loanType: 'FILERC20'
        }, { transaction: t })

        sendJSONresponse(res, 200, { status: 'OK', message: 'FIL Loan updated successfully' })
        return
    })
        .catch((e) => {
            console.log(e)
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'Error updating FIL loan state' })
            return
        })
}

module.exports.confirmSettleWithdraw = async (req, res) => {

    const { CID, network } = req.body

    if (!CID || !network) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required arguments' })
        return
    }

    const loanEvent = await LoanEvent.findOne({
        where: {
            txHash: CID
        }
    })

    if (loanEvent) {
        sendJSONresponse(res, 200, { status: 'OK', message: 'Operation already confirmed' })
        return
    }

    // Fetch FIL endpoint
    const endpoint = await Endpoint.findOne({
        where: {
            endpointType: 'HTTP',
            networkId: network
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

    // Get Message
    const message = await lotus.chain.getMessage({ "/": CID })

    // Get Payment Channel State
    const paymentChannelState = await lotus.state.readState(message.To)

    const settlingAtHeight = BigNumber(paymentChannelState.State.SettlingAt)
    const currentHeight = BigNumber((await lotus.chain.getHead()).Height)
    let remainingBlocks = 0

    if (currentHeight.lte(settlingAtHeight)) {
        remainingBlocks = settlingAtHeight.minus(currentHeight)
    }

    const estTimeRemaining = remainingBlocks.multipliedBy(30)
    const currentTimestamp = parseInt(Date.now() / 1000)
    const settlingAtEstTimestamp = estTimeRemaining.plus(currentTimestamp)

    // Update FILLoan
    const filLoan = await FILLoan.findOne({
        where: {
            paymentChannelId: message.To,
            state: 2
        }
    })

    if (!filLoan) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'FIL loan not found' })
        return
    }

    sequelize.transaction(async (t) => {
        filLoan.settlingAtHeight = settlingAtHeight.toString()
        filLoan.settlingAtEstTimestamp = settlingAtEstTimestamp.toString()
        filLoan.state = 3
        await filLoan.save({ transaction: t })

        // Save LoanEvent
        await LoanEvent.create({
            txHash: CID,
            event: 'LendFIL/SettleWithdraw',
            loanId: filLoan.collateralLockId,
            blockchain: 'FIL',
            networkId: network,
            loanType: 'FILERC20'
        }, { transaction: t })

        sendJSONresponse(res, 200, { status: 'OK', message: 'FIL Loan updated successfully' })
        return
    })
        .catch((e) => {
            console.log(e)
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'Error updating FIL loan state' })
            return
        })
}

module.exports.confirmCollectWithdraw = async (req, res) => {

    const { CID, network } = req.body

    if (!CID || !network) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required arguments' })
        return
    }

    const loanEvent = await LoanEvent.findOne({
        where: {
            txHash: CID
        }
    })

    if (loanEvent) {
        sendJSONresponse(res, 200, { status: 'OK', message: 'Operation already confirmed' })
        return
    }

    // Fetch FIL endpoint
    const endpoint = await Endpoint.findOne({
        where: {
            endpointType: 'HTTP',
            networkId: network
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

    // Get Message
    const message = await lotus.chain.getMessage({ "/": CID })
    console.log(message)
    // Get Payment Channel State
    // const paymentChannelState = await lotus.state.readState(message.To)
    // console.log(paymentChannelState)

    if (message.Method != 4) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid method called' })
        return
    }

    // Update FILLoan
    const filLoan = await FILLoan.findOne({
        where: {
            paymentChannelId: message.To,
            state: 3
        }
    })

    if (!filLoan) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'FIL loan not found' })
        return
    }

    sequelize.transaction(async (t) => {
        filLoan.state = 4
        await filLoan.save({ transaction: t })

        // Save LoanEvent
        await LoanEvent.create({
            txHash: CID,
            event: 'LendFIL/CollectWithdraw',
            loanId: filLoan.collateralLockId,
            blockchain: 'FIL',
            networkId: network,
            loanType: 'FILERC20'
        }, { transaction: t })

        sendJSONresponse(res, 200, { status: 'OK', message: 'FIL Loan updated successfully' })
        return
    })
        .catch((e) => {
            console.log(e)
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'Error updating FIL loan state' })
            return
        })
}