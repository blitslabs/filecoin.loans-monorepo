const { sendJSONresponse } = require('../utils')
const {
    ERC20CollateralLock, Endpoint, ProtocolContract, sequelize,
    CollateralEvent, LoanEvent, Loan, LogTopic, FILLoan
} = require('../models/sequelize')
const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const { ABI } = require('../config/ABI')

const EVENTS = [
    'CreateBorrowRequest', 'CancelBorrowRequest',
    'AcceptOffer', 'UnlockCollateral',
    'SeizeCollateral', 'UnlockRefundableCollateral'
]

BigNumber.set({ EXPONENTIAL_AT: 25 })

module.exports.confirmCollateralLockOperation = async (req, res) => {

    const { networkId, operation, txHash } = req.body

    if (!networkId || !operation || !txHash) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing arguments' })
        return
    }

    if (!EVENTS.includes(operation)) {
        sendJSONresponse(res, 404, { status: 'ERROR', message: 'ERC20 Collatera Lock Operation not found' })
        return
    }

    // Check if event (operation) exists
    const dbLoanEvent = await LoanEvent.findOne({
        where: {
            txHash
        }
    })

    if (dbLoanEvent) {
        sendJSONresponse(res, 200, { status: 'OK', message: 'Loan Event alaready saved' })
        return
    }

    // Get Endpoint for Network
    const endpoint = await Endpoint.findOne({
        where: {
            endpointType: 'HTTP',
            networkId
        }
    })

    if (!endpoint) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Endpoint not found' })
        return
    }

    // Connect Provider
    const provider = new Web3.providers.HttpProvider(endpoint.endpoint)
    const web3 = new Web3(provider)

    // Get Tx Receipt
    const receipt = await web3.eth.getTransactionReceipt(txHash)

    // Check Tx Status
    if (receipt.status != true) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid transaction hash' })
        return
    }

    // Get Protocol Contract
    const protocolContract = await ProtocolContract.findOne({
        where: {
            address: receipt.to,
            networkId
        }
    })

    if (!protocolContract) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Protocol Contract not found' })
        return
    }

    // Get LogTopic
    const logTopic = await LogTopic.findOne({
        where: {
            operation,
            contractName: protocolContract.name,
            status: 'ACTIVE'
        }
    })

    if (!logTopic) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Log Topic Not Found' })
        return
    }

    // Get Event ABI
    const eventInputs = ABI[protocolContract.name].abi.filter((e) => e.name === operation)

    // Check Logs
    // Get Encoded Data and Topics
    let data, topics
    for (let log of receipt.logs) {
        for (let topic of log.topics) {
            if (topic === logTopic.topic) {
                data = log.data
                topics = log.topics
                break
            }
        }
    }

    // Decode Log
    const logs = await web3.eth.abi.decodeLog(eventInputs[0].inputs, data, topics)

    // Get LoanId
    const { loanId } = logs

    // Save Loan Event
    const [loanEvent, loanEventCreated] = await LoanEvent.findOrCreate({
        where: {
            txHash
        },
        defaults: {
            txHash,
            event: operation,
            loanId: loanId,
            blockchain: protocolContract.blockchain,
            networkId: protocolContract.networkId,
            contractAddress: protocolContract.address,
            loanType: 'FILERC20'
        },
    })

    // Instantiate Contract
    const contract = new web3.eth.Contract(ABI[protocolContract.name].abi, protocolContract.address)

    /// Fetch ERC20CollateralLock Details
    const lock = await contract.methods.fetchLoan(loanId).call()

    // Save ERC20CollateralLock Details
    const [dbCollateralLock, created] = await ERC20CollateralLock.findOrCreate({
        where: {
            contractLoanId: loanId,
            blockchain: protocolContract.blockchain,
            networkId: protocolContract.networkId
        },
        defaults: {
            contractLoanId: loanId,
            paymentChannelId: lock.paymentChannelId,
            borrower: lock.actors[0],
            lender: lock.actors[1],
            filBorrower: lock.filAddresses[0],
            filLender: lock.filAddresses[1],
            secretHashA1: lock.secretHashes[0],
            secretHashB1: lock.secretHashes[1],
            secretA1: lock.secrets[0],
            secretB1: lock.secrets[1],
            loanExpiration: lock.expirations[0].toString(),
            loanExpirationPeriod: lock.expirations[2].toString(),
            collateralAmount: (new BigNumber(lock.details[0]).dividedBy(1e18)).toString(),
            principalAmount: (new BigNumber(lock.details[1]).dividedBy(1e18)).toString(),
            interestRate: (BigNumber(lock.details[4]).dividedBy(1e18)).toString(),
            lockPrice: (new BigNumber(lock.details[2]).dividedBy(1e18)).toString(),
            liquidationPrice: (new BigNumber(lock.details[3]).dividedBy(1e18)).toString(),
            state: lock.state,
            blockchain: protocolContract.blockchain,
            networkId: protocolContract.networkId,
            collateralLockContractAddress: protocolContract.address,
            token: lock.token,
        }
    })

    if (created && lock.state == 0) {
        // send email notification
    } else {

        if (!dbCollateralLock) {
            sendJSONresponse(res, 404, { status: 'ERROR', message: 'Collateral Lock not found' })
            return
        }

        // Update data
        if (operation === 'AcceptOffer') {
            dbCollateralLock.lender = lock.actors[1]
            dbCollateralLock.filLender = lock.filAddresses[1]
            dbCollateralLock.secretHashB1 = lock.secretHashes[1]
            dbCollateralLock.paymentChannelId = lock.paymentChannelId
            dbCollateralLock.principalAmount = BigNumber(lock.details[1]).dividedBy(1e18).toString()
            dbCollateralLock.loanExpiration = lock.expirations[0]
        }

        dbCollateralLock.secretA1 = lock.secrets[0]
        dbCollateralLock.secretB1 = lock.secrets[1]
        dbCollateralLock.state = lock.state
        await dbCollateralLock.save()
    }

    sendJSONresponse(res, 200, { status: 'OK', message: 'FIL Loan Operation Confirmed' })
    return
}

module.exports.getBorrowRequestsByState = async (req, res) => {

    let { state } = req.params

    if (!state) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required parameters' })
        return
    }

    if (state === 'available') state = '0'
    else if (state == 'closed') state = '3'

    const collateralLocks = await ERC20CollateralLock.findAll({
        where: {
            state
        }
    })

    sendJSONresponse(res, 200, { status: 'OK', payload: collateralLocks })
    return
}

module.exports.getFILLoanDetails = async (req, res) => {

    const { loanId } = req.params

    if (!loanId) {
        sendJSONresponse(res, 404, { status: 'ERROR', message: 'Loan not found' })
        return
    }

    const collateralLock = await ERC20CollateralLock.findOne({
        where: {
            id: loanId,
        },
        raw: true
    })

    const filLoan = await FILLoan.findOne({
        where: {
            collateralLockContractId: collateralLock.contractLoanId,
            collateralLockContractAddress: collateralLock.collateralLockContractAddress,
            collateralLockNetworkId: collateralLock.networkId
        },
        raw: true
    })

    const loanEvents = await LoanEvent.findAll({
        where: {
            loanId,
            loanType: 'FILERC20'
        },
        raw: true
    })

    const payload = {
        collateralLock: {
            ...collateralLock
        },
        filLoan: {
            ...filLoan
        },
        loanEvents: [
            ...loanEvents
        ]
    }

    sendJSONresponse(res, 200, { status: 'OK', payload: payload })
    return
}