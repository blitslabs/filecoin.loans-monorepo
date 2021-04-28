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

    const filLoans = await FILLoan.findAll({
        where: {
            [Op.or]: [{ ethLender: account }, { ethBorrower: account }],
        },
        raw: true
    })

    const filLoansPayload = []

    for (let l of filLoans) {
        const collateralLock = await ERC20CollateralLock.findOne({
            where: {
                contractLoanId: l.collateralLockContractId,
                collateralLockContractAddress: l.collateralLockContractAddress
            },
            raw: true
        })

        const filPayback = await FILPayback.findOne({
            where: {
                collateralLockContractId: l.collateralLockContractId,
                collateralLockContractAddress: l.collateralLockContractAddress
            },
            raw: true
        })

        filLoansPayload.push({
            ...l,
            collateralLock: {
                ...collateralLock
            },
            filPayback: {
                ...filPayback
            }
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

