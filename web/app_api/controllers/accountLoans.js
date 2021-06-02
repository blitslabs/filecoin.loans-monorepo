const { sendJSONresponse, pad } = require('../utils')
const {
    ERC20CollateralLock, FILCollateral, ERC20Loan,
    FILLoan, FILPayback, LoanEvent, sequelize
} = require('../models/sequelize')

const { Op } = require('sequelize')

module.exports.getAccountLoans = async (req, res) => {

    const { account } = req.params

    if (!account) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required parameter' })
        return
    }

    const filLoansPayload = []

    const erc20CollateralLocks = await ERC20CollateralLock.findAll({
        where: {
            [Op.or]: [{ borrower: account }, { lender: account }],
        },
        raw: true
    })

    for (let collateralLock of erc20CollateralLocks) {
        const filLoan = await FILLoan.findOne({
            where: {
                collateralLockContractId: collateralLock.contractLoanId,
                collateralLockContractAddress: collateralLock.collateralLockContractAddress,
                collateralLockNetworkId: collateralLock.networkId
            },
            raw: true
        })

        const filPayback = await FILPayback.findOne({
            where: {
                collateralLockContractId: collateralLock.contractLoanId,
                collateralLockContractAddress: collateralLock.collateralLockContractAddress,
                collateralLockNetworkId: collateralLock.networkId
            },
            raw: true
        })

        filLoansPayload.push({
            collateralLock: { ...collateralLock },
            filLoan: { ...filLoan },
            filPayback: { ...filPayback },
        })
    }

    const erc20Loans = await ERC20Loan.findAll({
        where: {
            [Op.or]: [{ lender: account }, { borrower: account }]
        },
        raw: true
    })

    const erc20LoansPayload = []

    for (let l of erc20Loans) {
        const collateralLock = await FILCollateral.findOne({
            where: {
                erc20LoanContractId: l.contractLoanId,
                erc20LoansContract: l.erc20LoansContract
            },
            raw: true
        })
        erc20LoansPayload.push({
            ...l,
            collateralLock: {
                ...collateralLock
            }
        })
    }

    const payload = {
        filLoans: filLoansPayload,
        erc20Loans: erc20LoansPayload
    }

    sendJSONresponse(res, 200, { status: 'OK', payload: payload })
    return
}

