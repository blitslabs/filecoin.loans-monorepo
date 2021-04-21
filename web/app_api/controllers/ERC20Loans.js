const { sendJSONresponse } = require('../utils')
const {
    ERC20Loan,
    Endpoint, ProtocolContract, LoanEvent, LogTopic, sequelize
} = require('../models/sequelize')
const Web3 = require('web3')
const { ABI } = require('../config/ABI')
const BigNumber = require('bignumber.js')
BigNumber.set({ EXPONENTIAL_AT: 25 })

const EVENTS = [
    'CreateLoanOffer', 'AcceptOffer', 'Withdraw',
    'Payback', 'AcceptRepayment', 'RefundPayback',
    'CancelLoan'
]

module.exports.confirmLoanOperation = async (req, res) => {

    const { networkId, operation, txHash } = req.body

    if (!networkId || !operation || !txHash) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required arguments' })
        return
    }

    // Check if operation exists
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
            loanType: 'ERC20FIL'
        },
    })

    // Instantiate Contract
    const contract = new web3.eth.Contract(ABI[protocolContract.name].abi, protocolContract.address)

    /// Fetch ERC20Loan Details
    const loan = await contract.methods.fetchLoan(loanId).call()

    // Save ERC20Loan Details
    const [dbERC20Loan, created] = await ERC20Loan.findOrCreate({
        where: {
            contractLoanId: loanId,
            blockchain: protocolContract.blockchain,
            networkId: protocolContract.networkId
        },
        defaults: {
            contractLoanId: loanId,
            borrower: loan.actors[0],
            lender: loan.actors[1],
            filBorrower: loan.filAddresses[0],
            filLender: loan.filAddresses[1],
            secretHashA1: loan.secretHashes[0],
            secretHashB1: loan.secretHashes[1],
            secretA1: loan.secrets[0],
            secretB1: loan.secrets[1],
            loanExpiration: loan.expirations[0].toString(),
            acceptExpiration: loan.expirations[1].toString(),
            loanExpirationPeriod: loan.expirations[2].toString(),
            principalAmount: (new BigNumber(loan.details[0]).dividedBy(1e18)).toString(),
            interestAmount: (new BigNumber(loan.details[1]).dividedBy(1e18)).toString(),
            collateralAmount: (new BigNumber(loan.details[2]).dividedBy(1e18)).toString(),
            paymentChannelId: loan.filDetails[0],
            unlockCollateralMessage: loan.filDetails[1],
            multisigLender: loan.actors[2],
            state: loan.state,
            blockchain: protocolContract.blockchain,
            networkId: protocolContract.networkId,
            erc20LoansContract: protocolContract.address,
            token: loan.token
        }
    })

    if(created && loan.state == 0) {
        // send email notification
    } else {

        if(!dbERC20Loan) {
            sendJSONresponse(res, 404, { status: 'ERROR', message: 'ERC20 Loan not found' })
            return
        }

        // Update Data
        if(operation === 'AcceptOffer') {
            dbERC20Loan.borrower = loan.actors[0]
            dbERC20Loan.filBorrower = loan.filAddresses[0]
            dbERC20Loan.secretHashA1 = loan.secretHashes[0]
            dbERC20Loan.paymentChannelId = loan.filDetails[0]
            dbERC20Loan.unlockCollateralMessage = loan.filDetails[1]
            dbERC20Loan.multisigLender = loan.actors[2]
            dbERC20Loan.loanExpiration = loan.expirations[0]
            dbERC20Loan.acceptExpiration = loan.expirations[1]
            dbERC20Loan.collateralAmount = loan.details[2]
        }

        dbERC20Loan.secretA1 = loan.secrets[0]
        dbERC20Loan.secretB1 = loan.secrets[1]
        dbERC20Loan.state = loan.state
        await dbERC20Loan.save()
    }

    sendJSONresponse(res, 200, { status: 'OK', message: 'ERC20 Loan Operation Confirmed' })
    return
}

module.exports.getLoanOffersByState = async(req, res) => {

    let { state } = req.params

    if(!state) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required parameters' })
        return
    }

    if(state === 'available') state = '0'
    else if (state === 'closed') state == '5'

    const erc20Loans = await ERC20Loan.findAll({
        where: {
            state
        }
    })

    sendJSONresponse(res, 200, { status: 'OK', payload: erc20Loans })
    return
}