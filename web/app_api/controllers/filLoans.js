const { sendJSONresponse } = require('../utils')
const {
    ERC20CollateralLock, Endpoint, FILLoan, LoanEvent
} = require('../models/sequelize')
const { sequelize } = require('../models/sequelize')
const BigNumber = require('bignumber.js')
const Web3 = require('web3')
const { HttpJsonRpcConnector, LotusClient } = require('filecoin.js')
const web3 = new Web3()
const { verifySignature } = require('../utils/filecoin')
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