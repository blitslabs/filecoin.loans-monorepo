const { sendJSONresponse, pad } = require('../utils')
const {
    Endpoint, ProtocolContract, LoanEvent,
    Loan, LoanAsset, CollateralLock,
    sequelize
} = require('../models/sequelize')
const { ABI } = require('../config/ABI')
const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const { Op } = require('sequelize')
const emailNotification = require('./emailNotification')
const { Harmony } = require('@harmony-js/core')
const { ChainType, ChainID } = require('@harmony-js/utils')

module.exports.confirmLoanOperations_ETH = async (req, res) => {

    const blockchain = 'ETH'
    const { network } = req.params

    if (!blockchain || !network) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required parameters' })
        return
    }

    const endpoint = await Endpoint.findOne({
        where: {
            endpointType: 'WS',
            blockchain,
            network
        }
    })

    if (!endpoint) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Endpoint not found' })
        return
    }

    const protocolContract = await ProtocolContract.findOne({
        where: {
            name: 'CrosschainLoans',
            blockchain,
            network
        }
    })

    if (!protocolContract) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Protocol Contract not found' })
        return
    }

    const provider = new Web3.providers.WebsocketProvider(endpoint.endpoint)
    const web3 = new Web3(provider)
    const contract = new web3.eth.Contract(ABI.CrosschainLoans.abi, protocolContract.address)
    const latestBlock = await web3.eth.getBlock('latest')
    const fromBlock = parseInt(latestBlock.number) - 999

    const events = await contract.getPastEvents('allEvents', {
        fromBlock: fromBlock, toBlock: 'latest',
    })

    for (let e of events) {

        const loanId = e.returnValues.loanId
        const txHash = e.transactionHash

        const [loanEvent, created] = await LoanEvent.findOrCreate({
            where: {
                txHash
            },
            defaults: {
                txHash,
                event: e.event,
                loanId,
                blockchain,
                network,
                contractAddress: protocolContract.address
            },
        })

        // Continue if loanEvent is already saved
        if (!created) {
            continue
        }

        // Fetch Loan from contract
        const loan = await contract.methods.fetchLoan(loanId).call()

        // Fetch
        if (e.event === 'LoanCreated') {

            // Get Asset
            const asset = await LoanAsset.findOne({
                where: {
                    contractAddress: loan.contractAddress
                },
            })

            // Save Loan
            const [dbLoan, loanCreated] = await Loan.findOrCreate({
                where: {
                    contractLoanId: loanId,
                    blockchain,
                    network,
                    loansContractAddress: protocolContract.address
                },
                defaults: {
                    contractLoanId: loanId,
                    borrower: loan.actors[0],
                    lender: loan.actors[1],
                    lenderAuto: loan.actors[2],
                    aCoinLenderAddress: loan.aCoinLenderAddress,
                    secretHashA1: loan.secretHashes[0],
                    secretHashB1: loan.secretHashes[1],
                    secretHashAutoB1: loan.secretHashes[2],
                    secretA1: loan.secrets[0],
                    secretB1: loan.secrets[1],
                    secretAutoB1: loan.secrets[2],
                    loanExpiration: loan.expirations[0],
                    acceptExpiration: loan.expirations[1],
                    principal: BigNumber(loan.details[0]).dividedBy(pad(1, asset.decimals)).toString(), // convert
                    interest: BigNumber(loan.details[1]).dividedBy(pad(1, asset.decimals)).toString(), // convert
                    tokenContractAddress: loan.contractAddress,
                    tokenName: asset.name,
                    tokenSymbol: asset.symbol,
                    status: loan.state,
                    blockchain,
                    network,
                    loansContractAddress: protocolContract.address
                }
            })

            // Send Email Notification
            try {
                emailNotification.sendLoanCreatedEmailNotification(dbLoan.id)
            } catch (e) {
                console.error(e)
            }

        } else if (
            e.event === 'LoanAssignedAndApproved' ||
            e.event === 'LoanPrincipalWithdrawn' ||
            e.event === 'LoanRepaymentAccepted' ||
            e.event === 'Payback' ||
            e.event === 'RefundPayback' ||
            e.event === 'CancelLoan'
        ) {
            const dbLoan = await Loan.findOne({
                where: {
                    contractLoanId: loanId,
                    blockchain,
                    network,
                    loansContractAddress: protocolContract.address
                }
            })

            if (!dbLoan) {
                sendJSONresponse(res, 404, { status: 'ERROR', message: 'Loan not found' })
                return
            }

            if (e.event === 'LoanAssignedAndApproved') {
                dbLoan.secretHashA1 = loan.secretHashes[0]
                dbLoan.borrower = loan.actors[0]
                dbLoan.loanExpiration = loan.expirations[0]
                dbLoan.acceptExpiration = loan.expirations[1]
            }

            dbLoan.secretA1 = loan.secrets[0]
            dbLoan.secretB1 = loan.secrets[1]
            dbLoan.status = loan.state
            await dbLoan.save()

            if (e.event === 'LoanAssignedAndApproved') {
                try {
                    emailNotification.sendLoanApproved(dbLoan.id)
                } catch (e) {
                    console.error(e)
                }
            } else if (e.event === 'CancelLoan') {
                // Send Email Notification
                try {
                    emailNotification.sendLoanCanceled(dbLoan.id)
                        .then(res => console.log(res))
                } catch (e) {
                    console.error(e)
                }
            } else if (e.event === 'LoanPrincipalWithdrawn') {
                try {
                    emailNotification.sendPrincipalWithdrawn(dbLoan.id)
                } catch (e) {
                    console.error(e)
                }
            } else if (e.event === 'Payback') {
                try {
                    emailNotification.sendPayback(dbLoan.id)
                } catch (e) {
                    console.error(e)
                }
            } else if (e.event === 'LoanRepaymentAccepted') {
                try {
                    emailNotification.sendPaybackAccepted(dbLoan.id)
                } catch (e) {
                    console.error(e)
                }
            } else if (e.event === 'RefundPayback') {
                try {
                    emailNotification.sendPaybackRefunded(dbLoan.id)
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }

    sendJSONresponse(res, 200, { status: 'OK', message: 'Loan Operations Confirmed' })
    return
}

module.exports.confirmCollateralLockOperations_ONE = async (req, res) => {

    const blockchain = 'ONE'
    const { network } = req.params

    if (!blockchain || !network) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required parameters' })
        return
    }

    const endpoint = await Endpoint.findOne({
        where: {
            endpointType: 'HTTP',
            blockchain,
            network
        }
    })

    if (!endpoint) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Endpoint not found' })
        return
    }

    const protocolContract = await ProtocolContract.findOne({
        where: {
            name: 'CollateralLockV2_ONE',
            blockchain,
            network
        }
    })

    if (!protocolContract) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Protocol Contract not found' })
        return
    }

    let hmy, contract
    try {
        hmy = new Harmony(endpoint.endpoint, { chainType: ChainType.Harmony, chainId: network === 'mainnet' ? ChainID.HmyMainnet : ChainID.HmyTestnet })
        contract = hmy.contracts.createContract(ABI.CollateralLockV2.abi, protocolContract.address)
    } catch (e) {
        console.log(e)
    }
    
    // Get contract loanCounter
    const loanIdCounter = await contract.methods.loanIdCounter().call()
    console.log(loanIdCounter)

    sendJSONresponse(res, 200, { status: 'OK', message: 'Loan Operations Confirmed' })
    return
}