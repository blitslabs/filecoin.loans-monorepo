const { sendJSONresponse } = require('../utils')
const {
    ERC20CollateralLock, Endpoint, LoanEvent, FILPayback, FILLoan
} = require('../models/sequelize')
const { sequelize } = require('../models/sequelize')
const emailNotification = require('./emailNotification')
const BigNumber = require('bignumber.js')
const Web3 = require('web3')
const { HttpJsonRpcConnector, LotusClient } = require('filecoin.js')
const web3 = new Web3()
const { verifySignature, decodeVoucher } = require('../utils/filecoin')
const filecoin_signer = require('@zondax/filecoin-signing-tools')
BigNumber.set({ EXPONENTIAL_AT: 25 })

module.exports.confirmPaybackPaymentChannel = async (req, res) => {

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

    if (!BigNumber(balance).eq(message.repayAmount)) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid payment channel amount' })
        return
    }

    // Check payment channel data
    if (from !== message.filBorrower || to !== message.filLender) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid payment channel actors' })
        return
    }

    // Check payment channel state
    if (settlingAt != 0 || minSettleHeight != 0) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid payment channel settle height' })
        return
    }

    sequelize.transaction(async (t) => {

        // Find Borrow Request
        const erc20CollateralLock = await ERC20CollateralLock.findOne({
            where: {
                contractLoanId: message.contractLoanId,
                filBorrower: web3.utils.toHex(message.filBorrower),
                filLender: web3.utils.toHex(message.filLender),
                collateralLockContractAddress: message.erc20CollateralLock,
                networkId: message.collateralNetwork,
                state: 1
            },
            transaction: t
        })

        if (!erc20CollateralLock) {
            sendJSONresponse(res, 404, { status: 'ERROR', message: 'Collateral Lock not found' })
            return
        }

        // Save FIL Payback
        const [filPayback, created] = await FILPayback.findOrCreate({
            where: {
                paymentChannelId: message.paymentChannelId
            },
            defaults: {
                paymentChannelId: message.paymentChannelId,
                paymentChannelAddress: message.paymentChannelAddress,
                filLender: message.filLender,
                filBorrower: message.filBorrower,
                amount: message.repayAmount,
                secretHashB1: message.secretHashB1,
                signature,
                message: JSON.stringify(message),
                txHash: message.CID['/'],
                network: message.network,
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
                event: 'LendFIL/PaybackPaymentChannel',
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

module.exports.confirmPaybackVoucher = async (req, res) => {

    const { signedVoucher, paymentChannelId } = req.body

    if (!signedVoucher || !paymentChannelId) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required arguments' })
        return
    }

    // Fetch FIL Loan
    const filPayback = await FILPayback.findOne({
        where: {
            paymentChannelId,
        }
    })

    const collateralLock = await ERC20CollateralLock.findOne({
        where: {
            id: filPayback.collateralLockId
        }
    })
    console.log(signedVoucher)
    // Verify Voucher
    try {
        const voucherIsVerified = await filecoin_signer.verifyVoucherSignature(signedVoucher, filPayback.filLender)
        console.log(voucherIsVerified)
        if (!voucherIsVerified) {
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'Failed to verify signed voucher' })
            return
        }
    } catch (e) {
        console.log(e)
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Failed to verify signed voucher' })
        return
    }

    if (filPayback.signedVoucher) {
        sendJSONresponse(res, 200, { status: 'OK', message: 'Signed voucher already saved' })
        return
    }

    // Decode Voucher
    const { secretHash, timeLockMax, amount } = decodeVoucher(signedVoucher)

    // Check Voucher
    if (`0x${secretHash}` != collateralLock.secretHashB1 ||
        (parseInt(collateralLock.loanExpiration) - 259200) != timeLockMax ||
        !(BigNumber(amount).dividedBy(1e18).eq(filPayback.amount))
    ) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid voucher parameters' })
        return
    }

    sequelize.transaction(async (t) => {

        // Save Signed Voucher
        filPayback.signedVoucher = signedVoucher
        filPayback.state = '1'
        await filPayback.save({ transaction: t })

        // Save Loan Event
        const [loanEvent, loanEventCreated] = await LoanEvent.findOrCreate({
            where: {
                txHash: signedVoucher
            },
            defaults: {
                txHash: signedVoucher,
                event: 'LendFIL/SignPaybackVoucher',
                loanId: filPayback.collateralLockId,
                blockchain: 'FIL',
                networkId: filPayback.network,
                loanType: 'FILERC20'
            },
            transaction: t
        })

        const filLoan = await FILLoan.findOne({
            where: {
                collateralLockId: collateralLock.id
            },
            transaction: t
        })

        try {
            emailNotification.sendFILLoanNotification(filLoan.id, 'Payback')
        } catch (e) {
            console.log(e)
        }

        sendJSONresponse(res, 200, { status: 'OK', message: 'Signed voucher saved' })
        return
    })
        .catch((err) => {
            console.log(err)
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'Failed to save signed voucher' })
            return
        })
}

module.exports.confirmRedeemPayback = async (req, res) => {

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
    const params = filecoin_signer.deserializeParams(message.Params, "fil/4/paymentchannel", 2)

    if (!('secret' in params && params.secret)) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Secret not found message params' })
        return
    }

    // Deserialize secret from message params
    const secretB1 = String.fromCharCode.apply(null, params.secret)

    // Get Payment Channel State
    const paymentChannelState = await lotus.state.readState(message.To)
    // console.log(paymentChannelState)

    // Update FILPayback
    const filPayback = await FILPayback.findOne({
        where: {
            paymentChannelId: message.To,
            state: 1
        }
    })

    if (!filPayback) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'FIL payback payment channel not found' })
        return
    }

    sequelize.transaction(async (t) => {

        filPayback.secretB1 = secretB1
        filPayback.state = 2
        await filPayback.save({ transaction: t })

        // Save LoanEvent
        await LoanEvent.create({
            txHash: CID,
            event: 'LendFIL/RedeemPaybackVoucher',
            loanId: filPayback.collateralLockId,
            blockchain: 'FIL',
            networkId: network,
            loanType: 'FILERC20'
        }, { transaction: t })

        const collateralLock = await ERC20CollateralLock.findOne({
            where: {
                id: filPayback.collateralLockId
            }
        })

        const filLoan = await FILLoan.findOne({
            where: {
                collateralLockId: collateralLock.id
            },
            transaction: t
        })

        try {
            emailNotification.sendFILLoanNotification(filLoan.id, 'AcceptRepayment')
        } catch (e) {
            console.log(e)
        }

        sendJSONresponse(res, 200, { status: 'OK', message: 'FIL Payback updated successfully' })
        return
    })
        .catch((e) => {
            console.log(e)
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'Error updating FIL payback state' })
            return
        })
}

module.exports.confirmSettlePayback = async (req, res) => {

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

    // Update FILPayback
    const filPayback = await FILPayback.findOne({
        where: {
            paymentChannelId: message.To,
            state: 2
        }
    })

    if (!filPayback) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'FIL payback not found' })
        return
    }

    sequelize.transaction(async (t) => {
        filPayback.settlingAtHeight = settlingAtHeight.toString()
        filPayback.settlingAtEstTimestamp = settlingAtEstTimestamp.toString()
        filPayback.state = 3
        await filPayback.save({ transaction: t })

        // Save LoanEvent
        await LoanEvent.create({
            txHash: CID,
            event: 'LendFIL/SettlePayback',
            loanId: filPayback.collateralLockId,
            blockchain: 'FIL',
            networkId: network,
            loanType: 'FILERC20'
        }, { transaction: t })

        sendJSONresponse(res, 200, { status: 'OK', message: 'FIL Payback updated successfully' })
        return
    })
        .catch((e) => {
            console.log(e)
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'Error updating FIL payback state' })
            return
        })
}

module.exports.confirmCollectPayback = async (req, res) => {

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
    // const paymentChannelState = await lotus.state.readState(message.To)
    // console.log(paymentChannelState)

    if (message.Method != 4) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid method called' })
        return
    }

    // Update FIPayback
    const filPayback = await FILPayback.findOne({
        where: {
            paymentChannelId: message.To,
            state: 3
        }
    })

    if (!filPayback) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'FIL payback not found' })
        return
    }

    sequelize.transaction(async (t) => {
        filPayback.state = 4
        await filPayback.save({ transaction: t })

        // Save LoanEvent
        await LoanEvent.create({
            txHash: CID,
            event: 'LendFIL/CollectWithdraw',
            loanId: filPayback.collateralLockId,
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