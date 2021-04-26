const { sendJSONresponse } = require('../utils')
const {
    EmailNotification, SystemSettings, Loan, CollateralLock,
    ERC20CollateralLock, ERC20Loan, LoanAsset, FILCollateral, FILLoan
} = require('../models/sequelize')
const nodemailer = require('nodemailer')
const moment = require('moment')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const currencyFormatter = require('currency-formatter')
const BigNumber = require('bignumber.js')

module.exports.test = async (req, res) => {
    const templatePath = APP_ROOT + '/app_api/email_templates/fil_erc20/borrower_payback_accepted.ejs'

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: 'contractLoanId',
        lender: 'lender',
        borrower: 'borrower ETH',
        secretHashA1: 'secretHashA1',
        secretHashB1: 'secretHashB1',
        duration: 'duration',
        principal: 'principal',
        interest: 'interest',
        tokenSymbol: 'tokenSymbol',
        apy: 'apy',
        loansContract: 'loansContract',
        blockchain: 'ETH',
        network: 'network',
        allowedCollateral: 'allowedCollateral',
        loanId: 'loanId',
        collateral: {
            blockchain: 'ONE',
            contractLoanId: '1',
            lender: 'lender one',
            borrower: 'borrower one',
            lockExpiration: 'lockExpiration',
            collateral: '100',
            collateralValue: '$150',
            collateralizationRate: '150%'
        }
    }


    ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
        res.send(result)
    })
}

module.exports.saveEmailNotificationAccount = async (req, res) => {

    const { email, account } = req.body

    if (!email || !account) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required arguments' })
        return
    }

    await EmailNotification.findOrCreate({
        where: {
            email, account
        },
        defaults: {
            email, account
        }
    })

    sendJSONresponse(res, 200, { status: 'OK', message: 'Email Notification Account Saved' })
    return
}

module.exports.getEmailNotificationAccount = async (req, res) => {

    const { account } = req.params

    if (!account) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required parameters' })
        return
    }

    const emailNotification = await EmailNotification.findOne({
        where: {
            account
        }
    })

    if (!emailNotification) {
        sendJSONresponse(res, 404, { status: 'ERROR', message: 'Notification email not found' })
        return
    }

    sendJSONresponse(res, 200, { status: 'OK', payload: emailNotification })
    return
}


module.exports.sendERC20LoanNotification = async (loanId, operation) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 }, })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const loan = await ERC20Loan.findOne({ where: { id: loanId } })

    if (!loan) return { status: 'ERROR', message: 'Loan not found' }

    const loanAsset = await LoanAsset.findOne({ where: { contractAddress: loan.token }, })

    if (!loanAsset) return { status: 'ERROR', message: 'Loan Asset Not Found' }

    const lenderNotificationEmail = await EmailNotification.findOne({
        where: {
            account: loan.lender
        }
    })

    const borrowerNotificationEmail = await EmailNotification.findOne({
        where: {
            account: loan.borrower
        }
    })

    const transporter = nodemailer.createTransport({
        host: settings.SMTP_HOST,
        port: settings.SMTP_PORT,
        secure: true,
        auth: {
            user: settings.SMTP_USER,
            pass: settings.SMTP_PASSWORD
        }
    })

    let lenderSubject, lenderTemplateName, borrowerSubject, borrowerTemplateName, status

    if (operation === 'CreateLoanOffer') {
        lenderSubject = 'New Loan Offer Created | Filecoin Loans'
        lenderTemplateName = 'loan_created'
        status = 'FUNDED'
    }

    else if (operation === 'CancelLoan') {
        lenderSubject = 'Loan Canceled | Filecoin Loans'
        lenderTemplateName = 'loan_canceled'
        status = 'CANCELED'
    }

    else if (operation === 'ApproveRequest') {
        lenderSubject = 'You have approved a loan | Filecoin Loans'
        lenderTemplateName = 'lender_loan_approved'
        borrowerSubject = 'Loan Approved | Filecoin Loans'
        borrowerTemplateName = 'borrower_loan_approved'
        status = 'APPROVED'
    }

    else if (operation === 'Withdraw') {
        lenderSubject = 'Loan Principal Withdrawn | Filecoin Loans'
        lenderTemplateName = 'lender_loan_withdrawn'
        borrowerSubject = 'Loan Principal Withdrawn | Filecoin Loans'
        borrowerTemplateName = 'borrower_loan_withdrawn'
        status = 'WITHDRAWN'
    }

    else if (operation === 'Payback') {
        lenderSubject = 'Action Required: Accept Loan Payback | Filecoin Loans'
        lenderTemplateName = 'lender_payback'
        borrowerSubject = 'Loan Repaid | Filecoin Loans'
        borrowerTemplateName = 'borrower_payback'
        status = 'REPAID'
    }

    else if (operation === 'AcceptRepayment') {
        lenderSubject = 'Payback Accepted | Filecoin Loans'
        lenderTemplateName = 'lender_payback_accepted'
        borrowerSubject = 'Action Required: Unlock Your Collateral | Filecoin Loans'
        borrowerTemplateName = 'borrower_payback_accepted'
        status = 'PAYBACK ACCEPTED'
    }

    else if (operation === 'RefundPayback') {
        lenderSubject = 'Payback Refunded | Filecoin Loans'
        lenderTemplateName = 'lender_payback_refunded'
        borrowerSubject = 'Payback Refunded | Filecoin Loans'
        borrowerTemplateName = 'borrower_payback_refunded'
        status = 'PAYBACK REFUNDED'
    }

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        duration: `${parseInt(BigNumber(loan.loanExpirationPeriod).dividedBy(86400))}d`,
        principal: currencyFormatter.format(loan.principalAmount, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interestAmount, { code: 'USD', symbol: '' }),
        tokenSymbol: loanAsset.symbol,
        apy: parseFloat(BigNumber(loan.interestAmount).dividedBy(loan.principalAmount).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.erc20LoansContract.substring(0, 8)}...${loan.erc20LoansContract.substring(loan.erc20LoansContract.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        loanId: loan.id,
        status
    }

    if (lenderNotificationEmail && lenderSubject && lenderTemplateName) {

        const templatePath = APP_ROOT + '/app_api/email_templates/erc20_fil/' + lenderTemplateName + '.ejs'

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Filecoin Loans" ${settings.SMTP_USER}`,
                    to: lenderNotificationEmail.email,
                    subject: lenderSubject,
                    html: result
                })

                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
        }
    }

    if (borrowerNotificationEmail && borrowerSubject && borrowerTemplateName) {

        const templatePath = APP_ROOT + '/app_api/email_templates/erc20_fil/' + borrowerTemplateName + '.ejs'

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Filecoin Loans" ${settings.SMTP_USER}`,
                    to: borrowerNotificationEmail.email,
                    subject: borrowerSubject,
                    html: result
                })

                console.log({ status: 'OK', message: 'Email notification sent' })
            })
        } catch (e) {
            console.error(e)
        }
    }
}

module.exports.sendFILCollateralNotification = async (collateralLockId, operation) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const collateralLock = await FILCollateral.findOne({ where: { id: collateralLockId } })

    if (!collateralLock) return { status: 'ERROR', message: 'Collareal Lock not found' }

    const loan = await ERC20Loan.findOne({
        where: {
            contractLoanId: collateralLock.erc20LoanContractId,
            erc20LoansContract: collateralLock.erc20LoansContract,
        }
    })

    const loanAsset = await LoanAsset.findOne({ where: { contractAddress: loan.token }, })

    if (!loanAsset) return { status: 'ERROR', message: 'Loan Asset Not Found' }

    const lenderNotificationEmail = await EmailNotification.findOne({
        where: {
            account: collateralLock.ethLender
        }
    })

    const borrowerNotificationEmail = await EmailNotification.findOne({
        where: {
            account: collateralLock.ethBorrower
        }
    })

    const transporter = nodemailer.createTransport({
        host: settings.SMTP_HOST,
        port: settings.SMTP_PORT,
        secure: true,
        auth: {
            user: settings.SMTP_USER,
            pass: settings.SMTP_PASSWORD
        }
    })

    let lenderSubject, lenderTemplateName, borrowerSubject, borrowerTemplateName, status

    if (operation === 'CollateralLocked') {
        lenderSubject = 'Action Required: Approve Loan | Filecoin Loans'
        lenderTemplateName = 'lender_approve_loan'
        borrowerSubject = 'Collateral Locked'
        borrowerTemplateName = 'collateral_locked'
        status = 'COLLATERAL LOCKED'
    }

    else if (operation === 'CollateralSeized') {
        lenderSubject = 'Collateral Seized | Filecoin Loans'
        lenderTemplateName = 'lender_collateral_seized'
        borrowerSubject = 'Refundable Collateral Unlocked'
        borrowerTemplateName = 'borrower_collateral_seized'
        status = 'COLLATERAL SEIZED'
    }

    else if (operation === 'CollateralUnlocked') {
        borrowerSubject = 'Collateral Unlocked'
        borrowerTemplateName = 'borrower_collateral_unlocked'
        status = 'COLLATERAL UNLOCKED'
    }

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        duration: `${parseInt(BigNumber(loan.loanExpirationPeriod).dividedBy(86400))}d`,
        principal: currencyFormatter.format(loan.principalAmount, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interestAmount, { code: 'USD', symbol: '' }),
        tokenSymbol: loanAsset.symbol,
        apy: parseFloat(BigNumber(loan.interestAmount).dividedBy(loan.principalAmount).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.erc20LoansContract.substring(0, 8)}...${loan.erc20LoansContract.substring(loan.erc20LoansContract.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        loanId: loan.id,
        status
    }

    if (lenderNotificationEmail && lenderSubject && lenderTemplateName) {
        const templatePath = APP_ROOT + '/app_api/email_templates/erc20_fil/' + lenderTemplateName + '.ejs'

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Filecoin Loans" ${settings.SMTP_USER}`,
                    to: lenderNotificationEmail.email,
                    subject: lenderSubject,
                    html: result
                })
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
        }
    }

    await sleep(2000)

    if (borrowerNotificationEmail && borrowerSubject && borrowerTemplateName) {

        const templatePath = APP_ROOT + '/app_api/email_templates/erc20_fil/' + borrowerTemplateName + '.ejs'

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Filecoin Loans" ${settings.SMTP_USER}`,
                    to: borrowerNotificationEmail.email,
                    subject: borrowerSubject,
                    html: result
                })

                console.log({ status: 'OK', message: 'Email notification sent' })
            })
        } catch (e) {
            console.error(e)
        }
    }

}

// FIL => ERC20 
module.exports.sendERC20CollateralNotification = async (collateralLockId, operation) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const collateralLock = await ERC20CollateralLock.findOne({ where: { id: collateralLockId } })

    if (!collateralLock) return { status: 'ERROR', message: 'Collareal Lock not found' }

    const loan = await FILLoan.findOne({
        where: {
            collateralLockContractId: collateralLock.contractLoanId,
            collateralLockContractAddress: collateralLock.collateralLockContractAddress,
        }
    })

    const loanAsset = await LoanAsset.findOne({ where: { contractAddress: collateralLock.token }, })

    if (!loanAsset) return { status: 'ERROR', message: 'Loan Asset Not Found' }

    const lenderNotificationEmail = await EmailNotification.findOne({
        where: {
            account: collateralLock.lender
        }
    })

    const borrowerNotificationEmail = await EmailNotification.findOne({
        where: {
            account: collateralLock.borrower
        }
    })

    const transporter = nodemailer.createTransport({
        host: settings.SMTP_HOST,
        port: settings.SMTP_PORT,
        secure: true,
        auth: {
            user: settings.SMTP_USER,
            pass: settings.SMTP_PASSWORD
        }
    })

    let lenderSubject, lenderTemplateName, borrowerSubject, borrowerTemplateName, status

    if (operation === 'CreateBorrowRequest') {
        borrowerSubject = 'FIL Borrow Request Created'
        borrowerTemplateName = 'borrower_collateral_locked'
        status = 'COLLATERAL LOCKED'
    }

    else if (operation === 'CancelBorrowRequest') {
        borrowerSubject = 'Borrow Request Canceled'
        borrowerTemplateName = 'borrower_collateral_seized'
        status = 'COLLATERAL SEIZED'
    }

    else if (operation === 'AcceptOffer') {
        lenderSubject = 'Action Required: Sign Withdraw Voucher | Filecoin Loans'
        lenderTemplateName = 'lender_loan_approved'
        borrowerSubject = 'Loan Offer Approved | Filecoin Loans'
        borrowerTemplateName = 'borrower_loan_approved'
        status = 'LOAN OFFER APPROVED'
    }

    else if (operation === 'UnlockCollateral') {
        borrowerSubject = 'Collateral Unlocked | Filecoin Loans'
        borrowerTemplateName = 'borrower_collateral_unlocked'
        status = 'COLLATERAL UNLOCKED'
    }

    else if (operation === 'SeizeCollateral') {
        lenderSubject = 'Collateral Seized | Filecoin Loans'
        lenderTemplateName = 'lender_collateral_seized'
        borrowerSubject = 'Refundable Collateral Unlocked | Filecoin Loans'
        borrowerTemplateName = 'borrower_collateral_seized'
        status = 'COLLATERAL SEIZED'
    }

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: collateralLock.contractLoanId,
        borrower: `${collateralLock.borrower.substring(0, 8)}...${collateralLock.borrower.substring(collateralLock.borrower.length - 8)}`,
        secretHashA1: `${collateralLock.secretHashA1.substring(0, 8)}...${collateralLock.secretHashA1.substring(collateralLock.secretHashA1.length - 8)}`,
        duration: `${parseInt(BigNumber(collateralLock.loanExpirationPeriod).dividedBy(86400))}d`,
        principal: currencyFormatter.format(collateralLock.principalAmount, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(parseFloat(BigNumber(collateralLock.interestRate).multipliedBy(collateralLock.principalAmount)), { code: 'USD', symbol: '' }),
        tokenSymbol: loanAsset.symbol,
        apy: parseFloat(BigNumber(collateralLock.interestRate).multipliedBy(100)).toFixed(2),
        collateralLockContractAddress: `${collateralLock.collateralLockContractAddress.substring(0, 8)}...${collateralLock.collateralLockContractAddress.substring(collateralLock.collateralLockContractAddress.length - 8)}`,
        blockchain: collateralLock.blockchain,
        networkId: collateralLock.networkId,
        loanId: collateralLock.id,
        status
    }

    if (lenderNotificationEmail && lenderSubject && lenderTemplateName) {
        const templatePath = APP_ROOT + '/app_api/email_templates/fil_erc20/' + lenderTemplateName + '.ejs'

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Filecoin Loans" ${settings.SMTP_USER}`,
                    to: lenderNotificationEmail.email,
                    subject: lenderSubject,
                    html: result
                })
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
        }
    }

    await sleep(2000)

    if (borrowerNotificationEmail && borrowerSubject && borrowerTemplateName) {

        const templatePath = APP_ROOT + '/app_api/email_templates/fil_erc20/' + borrowerTemplateName + '.ejs'

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Filecoin Loans" ${settings.SMTP_USER}`,
                    to: borrowerNotificationEmail.email,
                    subject: borrowerSubject,
                    html: result
                })

                console.log({ status: 'OK', message: 'Email notification sent' })
            })
        } catch (e) {
            console.error(e)
        }
    }

}

module.exports.sendFILLoanNotification = async (loanId, operation) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const loan = await FILLoan.findOne({ where: { id: loanId } })

    if (!loan) return { status: 'ERROR', message: 'Loan not found' }

    const collateralLock = await ERC20CollateralLock.findOne({
        where: {
            contractLoanId: loan.collateralLockContractId,
            collateralLockContractAddress: loan.collateralLockContractAddress
        }
    })

    if (!collateralLock) return { status: 'ERROR', message: 'Collareal Lock not found' }

    const loanAsset = await LoanAsset.findOne({ where: { contractAddress: collateralLock.token }, })

    if (!loanAsset) return { status: 'ERROR', message: 'Loan Asset Not Found' }

    const lenderNotificationEmail = await EmailNotification.findOne({
        where: {
            account: collateralLock.lender
        }
    })

    const borrowerNotificationEmail = await EmailNotification.findOne({
        where: {
            account: collateralLock.borrower
        }
    })

    const transporter = nodemailer.createTransport({
        host: settings.SMTP_HOST,
        port: settings.SMTP_PORT,
        secure: true,
        auth: {
            user: settings.SMTP_USER,
            pass: settings.SMTP_PASSWORD
        }
    })

    let lenderSubject, lenderTemplateName, borrowerSubject, borrowerTemplateName, status

    if (operation === 'LoanRequestFunded') {
        lenderSubject = 'FIL Loan Request Funded | Filecoin Loans'
        lenderTemplateName = 'lender_loan_funded'
        borrowerSubject = 'Action Required: Accept Offer | Filecoin Loans'
        borrowerTemplateName = 'borrower_loan_funded'        
        status = 'LOAN FUNDED'
    }

    else if (operation === 'WithdrawVoucherSigned') {
        lenderSubject = 'Withdraw Voucher Signed | Filecoin Loans'
        lenderTemplateName = 'lender_withdraw_voucher_signed'
        borrowerSubject = 'Action Required: Withdraw Principal | Filecoin Loans'
        borrowerTemplateName = 'borrower_withdraw_voucher_signed'        
        status = 'WITHDRAW AVAILABLE'
    }

    else if (operation === 'PrincipalWithdrawn') {
        lenderSubject = 'Principal Withdrawn | Filecoin Loans'
        lenderTemplateName = 'lender_loan_withdrawn'
        borrowerSubject = 'Principal Withdrawn | Filecoin Loans'
        borrowerTemplateName = 'borrower_loan_withdrawn'
        status = 'PRINCIPAL WITHDRAWN'
    }

    else if (operation === 'Payback') {
        lenderSubject = 'Action Required: Accept Loan Payback | Filecoin Loans'
        lenderTemplateName = 'lender_payback'
        borrowerSubject = 'Loan Repaid | Filecoin Loans'
        borrowerTemplateName = 'borrower_payback'
        status = 'LOAN REPAID'
    }

    else if (operation === 'AcceptRepayment') {
        lenderSubject = 'Payback Accepted | Filecoin Loans'
        lenderTemplateName = 'lender_payback_accepted'
        borrowerSubject = 'Action Required: Unlock Your Collateral | Filecoin Loans'
        borrowerTemplateName = 'borrower_payback_accepted'
        status = 'PAYBACK ACCEPTED'
    }

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: collateralLock.contractLoanId,
        borrower: `${collateralLock.borrower.substring(0, 8)}...${collateralLock.borrower.substring(collateralLock.borrower.length - 8)}`,
        secretHashA1: `${collateralLock.secretHashA1.substring(0, 8)}...${collateralLock.secretHashA1.substring(collateralLock.secretHashA1.length - 8)}`,
        duration: `${parseInt(BigNumber(collateralLock.loanExpirationPeriod).dividedBy(86400))}d`,
        principal: currencyFormatter.format(collateralLock.principalAmount, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(parseFloat(BigNumber(collateralLock.interestRate).multipliedBy(collateralLock.principalAmount)), { code: 'USD', symbol: '' }),
        tokenSymbol: loanAsset.symbol,
        apy: parseFloat(BigNumber(collateralLock.interestRate).multipliedBy(100)).toFixed(2),
        collateralLockContractAddress: `${collateralLock.collateralLockContractAddress.substring(0, 8)}...${collateralLock.collateralLockContractAddress.substring(collateralLock.collateralLockContractAddress.length - 8)}`,
        blockchain: collateralLock.blockchain,
        networkId: collateralLock.networkId,
        loanId: collateralLock.id,
        status
    }

    if (lenderNotificationEmail && lenderSubject && lenderTemplateName) {
        const templatePath = APP_ROOT + '/app_api/email_templates/fil_erc20/' + lenderTemplateName + '.ejs'

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Filecoin Loans" ${settings.SMTP_USER}`,
                    to: lenderNotificationEmail.email,
                    subject: lenderSubject,
                    html: result
                })
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
        }
    }

    await sleep(2000)

    if (borrowerNotificationEmail && borrowerSubject && borrowerTemplateName) {

        const templatePath = APP_ROOT + '/app_api/email_templates/fil_erc20/' + borrowerTemplateName + '.ejs'

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Filecoin Loans" ${settings.SMTP_USER}`,
                    to: borrowerNotificationEmail.email,
                    subject: borrowerSubject,
                    html: result
                })

                console.log({ status: 'OK', message: 'Email notification sent' })
            })
        } catch (e) {
            console.error(e)
        }
    }

}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}