const { sendJSONresponse } = require('../utils')
const { EmailNotification, SystemSettings, Loan, CollateralLock } = require('../models/sequelize')
const nodemailer = require('nodemailer')
const moment = require('moment')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const currencyFormatter = require('currency-formatter')
const BigNumber = require('bignumber.js')

module.exports.test = async (req, res) => {
    const templatePath = APP_ROOT + '/app_api/email_templates/lender_approve_loan.ejs'

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

    if(!emailNotification) {
        sendJSONresponse(res, 404, { status: 'ERROR', message: 'Notification email not found'})
        return
    }

    sendJSONresponse(res, 200, { status: 'OK', payload: emailNotification })
    return
}


module.exports.sendLoanCreatedEmailNotification = async (loanId) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const loan = await Loan.findOne({ where: { id: loanId } })

    if (!loan) return { status: 'ERROR', message: 'Loan not found' }

    const notificationEmail = await EmailNotification.findOne({
        where: {
            account: loan.lender
        }
    })

    if (!notificationEmail) return { status: 'ERROR', message: 'Account does not have notification email' }

    const transporter = nodemailer.createTransport({
        host: settings.SMTP_HOST,
        port: settings.SMTP_PORT,
        secure: true,
        auth: {
            user: settings.SMTP_USER,
            pass: settings.SMTP_PASSWORD
        }
    })

    const subject = 'New Loan Created | Cross-chain Loans'
    // const msg = `You created a new loan offer: \n \n Account: ${loan.lender} \n Duration: 30 days \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

    const templatePath = APP_ROOT + '/app_api/email_templates/loan_created.ejs'

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        duration: '30d',
        principal: currencyFormatter.format(loan.principal, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interest, { code: 'USD', symbol: '' }),
        tokenSymbol: loan.tokenSymbol,
        apy: parseFloat(BigNumber(loan.interest).dividedBy(loan.principal).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.loansContractAddress.substring(0, 8)}...${loan.loansContractAddress.substring(loan.loansContractAddress.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        allowedCollateral: 'ONE | BNB',
        loanId: loan.id
    }

    try {

        ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
            await transporter.verify()
            await transporter.sendMail({
                from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                to: notificationEmail.email,
                subject,
                html: result
            })
            return { status: 'OK', message: 'Email notification sent' }
        })

    } catch (e) {
        console.error(e)
        return { status: 'ERROR', message: 'Error sending email' }
    }
}

module.exports.sendLoanCanceled = async (loanId) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const loan = await Loan.findOne({ where: { id: loanId } })

    if (!loan) return { status: 'ERROR', message: 'Loan not found' }

    const notificationEmail = await EmailNotification.findOne({
        where: {
            account: loan.lender
        }
    })

    if (!notificationEmail) return { status: 'ERROR', message: 'Account does not have notification email' }

    const transporter = nodemailer.createTransport({
        host: settings.SMTP_HOST,
        port: settings.SMTP_PORT,
        secure: true,
        auth: {
            user: settings.SMTP_USER,
            pass: settings.SMTP_PASSWORD
        }
    })

    const subject = 'Loan Canceled | Cross-chain Loans'
    // const msg = `You canceled a loan offer: \n \n Account: ${loan.lender} \n Duration: 30 days \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

    const templatePath = APP_ROOT + '/app_api/email_templates/loan_canceled.ejs'

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        duration: '30d',
        principal: currencyFormatter.format(loan.principal, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interest, { code: 'USD', symbol: '' }),
        tokenSymbol: loan.tokenSymbol,
        apy: parseFloat(BigNumber(loan.interest).dividedBy(loan.principal).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.loansContractAddress.substring(0, 8)}...${loan.loansContractAddress.substring(loan.loansContractAddress.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        allowedCollateral: 'ONE | BNB',
        loanId: loan.id
    }

    try {
        ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
            await transporter.verify()
            await transporter.sendMail({
                from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                to: notificationEmail.email,
                subject,
                html: result
            })
            return { status: 'OK', message: 'Email notification sent' }
        })

    } catch (e) {
        console.error(e)
        return { status: 'ERROR', message: 'Error sending email' }
    }
}

module.exports.sendCollateralLocked = async (collateralLockId) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const collateralLock = await CollateralLock.findOne({ where: { id: collateralLockId } })

    if (!collateralLock) return { status: 'ERROR', message: 'Collareal Lock not found' }

    const borrowerNotificationEmail = await EmailNotification.findOne({
        where: {
            account: collateralLock.bCoinBorrowerAddress
        }
    })

    // Get Lender's bCoin account with his aCoin account
    // 1. Get Loan
    const loan = await Loan.findOne({
        where: {
            contractLoanId: collateralLock.bCoinContractLoanId,
            loansContractAddress: collateralLock.loansContractAddress,
            status: 1.5
        }
    })

    // 2. Get Lender's email
    const lenderNotificationEmail = await EmailNotification.findOne({
        where: {
            account: loan.lender
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

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        duration: '30d',
        principal: currencyFormatter.format(loan.principal, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interest, { code: 'USD', symbol: '' }),
        tokenSymbol: loan.tokenSymbol,
        apy: parseFloat(BigNumber(loan.interest).dividedBy(loan.principal).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.loansContractAddress.substring(0, 8)}...${loan.loansContractAddress.substring(loan.loansContractAddress.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        allowedCollateral: 'ONE | BNB',
        loanId: loan.id,
        collateral: {
            secretHashA1: collateralLock.secretHashA1,
            secretHashB1: collateralLock.secretHashB1,
            blockchain: collateralLock.blockchain,
            contractLoanId: collateralLock.contractLoanId,
            lender: collateralLock.lender,
            borrower: collateralLock.borrower,
            bCoinBorrowerAddress: collateralLock.bCoinBorrowerAddress,
            lockExpiration: `${moment.unix(collateralLock.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
            collateral: collateralLock.collateral,
            collateralValue: currencyFormatter.format(collateralLock.collateralValue, { code: 'USD', symbol: '$' }),
            collateralizationRate: '150%',
            networkId: collateralLock.networkId,
            collateralLockContractAddress: `${collateralLock.collateralLockContractAddress.substring(0, 4)}...${collateralLock.collateralLockContractAddress.substring(collateralLock.collateralLockContractAddress.length - 4)}`,
        }
    }

    if (borrowerNotificationEmail) {

        const templatePath = APP_ROOT + '/app_api/email_templates/collateral_locked.ejs'
        const subject = 'Collateral Locked | Cross-chain Loans'
        // const msg = `You locked the required collateral for a loan offer: \n\n Collateral Details \n Collateral: ${collateralLock.collateral} \n Blockchain: ${collateralLock.blockchain} \n\n Loan Details \n Duration: 30 days \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loan.id} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: borrowerNotificationEmail.email,
                    subject,
                    html: result
                })
                
                console.log({ status: 'OK', message: 'Email notification sent' })
            })
        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }

    await sleep(2000)

    if (lenderNotificationEmail) {
        const templatePath = APP_ROOT + '/app_api/email_templates/lender_approve_loan.ejs'
        const subject = 'Action Required: Approve Loan | Cross-chain Loans'
        // const msg = `The collateral required for your loan offer was locked by a borrower: \n \n Collateral Details \n Account (Borrower): ${collateralLock.bCoinBorrowerAddress} \n Collateral: ${collateralLock.collateral} \n Blockchain: ${collateralLock.blockchain} \n SecretHashA1: ${collateralLock.secretHashA1} \n\n Loan Details \n Account (Lender): ${loan.lender} \n Duration: 30 days \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loan.id} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: lenderNotificationEmail.email,
                    subject,
                    html: result
                })                
                console.log({ status: 'OK', message: 'Email notification sent' })
            })            

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }
}

module.exports.sendLoanApproved = async (loanId) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const loan = await Loan.findOne({ where: { id: loanId } })

    if (!loan) return { status: 'ERROR', message: 'Loan not found' }

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

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        loanExpiration: `${moment.unix(loan.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
        principal: currencyFormatter.format(loan.principal, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interest, { code: 'USD', symbol: '' }),
        tokenSymbol: loan.tokenSymbol,
        apy: parseFloat(BigNumber(loan.interest).dividedBy(loan.principal).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.loansContractAddress.substring(0, 8)}...${loan.loansContractAddress.substring(loan.loansContractAddress.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        allowedCollateral: 'ONE | BNB',
        loanId: loan.id
    }

    if (lenderNotificationEmail) {

        const templatePath = APP_ROOT + '/app_api/email_templates/lender_loan_approved.ejs'
        const subject = 'You have approved a loan | Cross-chain Loans'
        // const msg = `The principal of your loan was withdrawn by the borrower: \n \n Account (Borrower): ${loan.borrower} \n Loan Expiration: ${moment.unix(loan.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {            
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: lenderNotificationEmail.email,
                    subject,
                    html: result
                })
                
                console.log({ status: 'OK', message: 'Email notification sent' })
            })
            
            console.log({ status: 'OK', message: 'Email notification sent' })

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }   

    if (borrowerNotificationEmail) {
        
        const templatePath = APP_ROOT + '/app_api/email_templates/borrower_loan_approved.ejs'
        const subject = 'Loan Approved | Cross-chain Loans'
        // const msg = `Your loan request was approved and you can now withdraw the loan's principal. \n \n Account (Borrower): ${loan.borrower} \n Loan Expiration: ${moment.unix(loan.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: borrowerNotificationEmail.email,
                    subject,
                    html: result
                })
                
                console.log({ status: 'OK', message: 'Email notification sent' })
            })
        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }
}

module.exports.sendPrincipalWithdrawn = async (loanId) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const loan = await Loan.findOne({ where: { id: loanId } })

    if (!loan) return { status: 'ERROR', message: 'Loan not found' }

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

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        loanExpiration: `${moment.unix(loan.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
        principal: currencyFormatter.format(loan.principal, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interest, { code: 'USD', symbol: '' }),
        tokenSymbol: loan.tokenSymbol,
        apy: parseFloat(BigNumber(loan.interest).dividedBy(loan.principal).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.loansContractAddress.substring(0, 8)}...${loan.loansContractAddress.substring(loan.loansContractAddress.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        allowedCollateral: 'ONE | BNB',
        loanId: loan.id
    }

    if (lenderNotificationEmail) {
        
        const templatePath = APP_ROOT + '/app_api/email_templates/lender_loan_withdrawn.ejs'
        const subject = 'Loan Principal Withdrawn | Cross-chain Loans'
        // const msg = `The principal of your loan was withdrawn by the borrower: \n \n Account (Borrower): ${loan.borrower} \n Loan Expiration: ${moment.unix(loan.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: lenderNotificationEmail.email,
                    subject,
                    html: result
                })
                
                console.log({ status: 'OK', message: 'Email notification sent' })
            })
            console.log({ status: 'OK', message: 'Email notification sent' })

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }
    
    if (borrowerNotificationEmail) {

        const templatePath = APP_ROOT + '/app_api/email_templates/borrower_loan_withdrawn.ejs'
        const subject = 'Loan Principal Withdrawn | Cross-chain Loans'
        // const msg = `You withdrew the principal of a loan: \n \n Account (Borrower): ${loan.borrower} \n Loan Expiration: ${moment.unix(loan.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: borrowerNotificationEmail.email,
                    subject,
                    html: result
                })
                
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }
}

module.exports.sendPayback = async (loanId) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const loan = await Loan.findOne({ where: { id: loanId } })

    if (!loan) return { status: 'ERROR', message: 'Loan not found' }

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

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        loanExpiration: `${moment.unix(loan.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
        acceptExpiration: `${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
        principal: currencyFormatter.format(loan.principal, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interest, { code: 'USD', symbol: '' }),
        tokenSymbol: loan.tokenSymbol,
        apy: parseFloat(BigNumber(loan.interest).dividedBy(loan.principal).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.loansContractAddress.substring(0, 8)}...${loan.loansContractAddress.substring(loan.loansContractAddress.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        allowedCollateral: 'ONE | BNB',
        loanId: loan.id
    }

    if (lenderNotificationEmail) {

        const templatePath = APP_ROOT + '/app_api/email_templates/lender_payback.ejs'
        const subject = 'Action Required: Accept Loan Payback | Cross-chain Loans'
        // const msg = `Your loan was repaid by the borrower. Please Accept the Borrower's Payback before ${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC to complete the loan. \n \n Account (Borrower): ${loan.borrower} \n Accept Payback Expiration: ${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: lenderNotificationEmail.email,
                    subject,
                    html: result
                })
                
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }

    if (borrowerNotificationEmail) {

        const templatePath = APP_ROOT + '/app_api/email_templates/borrower_payback.ejs'
        const subject = 'Loan Repaid | Cross-chain Loans'
        // const msg = `Your loan was repaid successfully. You will be able to unlock your collateral once the Lender accepts the Payback (before ${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC). If the Lender fails to accept the payback before this date, you'll be able to unlock a part of your collateral and refund your payback. \n \n Account (Borrower): ${loan.borrower} \n Accept Payback Expiration: ${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: borrowerNotificationEmail.email,
                    subject,
                    html: result
                })
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }
}

module.exports.sendPaybackAccepted = async (loanId) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const loan = await Loan.findOne({ where: { id: loanId } })

    if (!loan) return { status: 'ERROR', message: 'Loan not found' }

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

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        loanExpiration: `${moment.unix(loan.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
        acceptExpiration: `${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
        principal: currencyFormatter.format(loan.principal, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interest, { code: 'USD', symbol: '' }),
        tokenSymbol: loan.tokenSymbol,
        apy: parseFloat(BigNumber(loan.interest).dividedBy(loan.principal).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.loansContractAddress.substring(0, 8)}...${loan.loansContractAddress.substring(loan.loansContractAddress.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        allowedCollateral: 'ONE | BNB',
        loanId: loan.id
    }

    if (lenderNotificationEmail) {

        const templatePath = APP_ROOT + '/app_api/email_templates/lender_payback_accepted.ejs'
        const subject = 'Payback Accepted | Cross-chain Loans'
        // const msg = `You accepted the payback made by the borrower of your loan. \n\n Account (Borrower): ${loan.borrower} \n Accept Payback Expiration: ${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: lenderNotificationEmail.email,
                    subject,
                    html: result
                })
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }

    if (borrowerNotificationEmail) {

        const templatePath = APP_ROOT + '/app_api/email_templates/borrower_payback_accepted.ejs'
        const subject = 'Action Required: Unlock Your Collateral | Cross-chain Loans'
        // const msg = `The Lender accepted the payback you made and you are now able to unlock your collateral. \n\n Account (Borrower): ${loan.borrower} \n Accept Payback Expiration: ${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: borrowerNotificationEmail.email,
                    subject,
                    html: result
                })
                
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }
}

module.exports.sendPaybackRefunded = async (loanId) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const loan = await Loan.findOne({ where: { id: loanId } })

    if (!loan) return { status: 'ERROR', message: 'Loan not found' }

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

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        loanExpiration: `${moment.unix(loan.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
        acceptExpiration: `${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
        principal: currencyFormatter.format(loan.principal, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interest, { code: 'USD', symbol: '' }),
        tokenSymbol: loan.tokenSymbol,
        apy: parseFloat(BigNumber(loan.interest).dividedBy(loan.principal).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.loansContractAddress.substring(0, 8)}...${loan.loansContractAddress.substring(loan.loansContractAddress.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        allowedCollateral: 'ONE | BNB',
        loanId: loan.id
    }

    if (lenderNotificationEmail) {
        
        const templatePath = APP_ROOT + '/app_api/email_templates/lender_payback_refunded.ejs'
        const subject = 'Payback Refunded | Cross-chain Loans'
        // const msg = `You failed to accept the borrower's payback so it was refunded. You are able to seize part of the borrower's collateral to close the loan. \n\n Account (Borrower): ${loan.borrower} \n Accept Payback Expiration: ${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: lenderNotificationEmail.email,
                    subject,
                    html: result
                })
                
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }

    if (borrowerNotificationEmail) {

        const templatePath = APP_ROOT + '/app_api/email_templates/borrower_payback_refunded.ejs'
        const subject = 'Payback Refunded | Cross-chain Loans'
        // const msg = `You refunded your payback. You are able to unlock part of your collateral to close the loan. \n\n Account (Borrower): ${loan.borrower} \n Accept Payback Expiration: ${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: borrowerNotificationEmail.email,
                    subject,
                    html: result
                })
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }
}

module.exports.sendCollateralSeized = async (collateralLockId) => {

    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const collateralLock = await CollateralLock.findOne({ where: { id: collateralLockId } })

    if (!collateralLock) return { status: 'ERROR', message: 'Collareal Lock not found' }
       
    const loan = await Loan.findOne({
        where: {
            contractLoanId: collateralLock.bCoinContractLoanId,
            loansContractAddress: collateralLock.loansContractAddress,           
        }
    })

    if (!loan) return { status: 'ERROR', message: 'Loan not found' }

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

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        loanExpiration: `${moment.unix(loan.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
        acceptExpiration: `${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
        principal: currencyFormatter.format(loan.principal, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interest, { code: 'USD', symbol: '' }),
        tokenSymbol: loan.tokenSymbol,
        apy: parseFloat(BigNumber(loan.interest).dividedBy(loan.principal).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.loansContractAddress.substring(0, 8)}...${loan.loansContractAddress.substring(loan.loansContractAddress.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        allowedCollateral: 'ONE | BNB',
        loanId: loan.id
    }

    if (lenderNotificationEmail) {

        const templatePath = APP_ROOT + '/app_api/email_templates/lender_collateral_seized.ejs'
        const subject = 'Collateral Seized | Cross-chain Loans'
        // const msg = `You seized part of the borrower's collateral. \n\n Account (Borrower): ${loan.borrower} \n Accept Payback Expiration: ${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: lenderNotificationEmail.email,
                    subject,
                    html: result
                })
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }

    if (borrowerNotificationEmail) {

        const templatePath = APP_ROOT + '/app_api/email_templates/borrower_collateral_seized.ejs'
        const subject = 'Refundable Collateral Unlocked | Cross-chain Loans'
        // const msg = `Part of your locked collateral was unlocked. \n\n Account (Borrower): ${loan.borrower} \n Accept Payback Expiration: ${moment.unix(loan.acceptExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

        try {
            ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
                await transporter.verify()
                await transporter.sendMail({
                    from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                    to: borrowerNotificationEmail.email,
                    subject,
                    html: result
                })
                console.log({ status: 'OK', message: 'Email notification sent' })
            })

        } catch (e) {
            console.error(e)
            // return { status: 'ERROR', message: 'Error sending email' }
        }
    }
}

module.exports.sendCollateralUnlocked = async (collateralLockId) => {
    const settings = await SystemSettings.findOne({ where: { id: 1 } })

    if (!settings) return { status: 'ERROR', message: 'Error sending email' }

    const collateralLock = await CollateralLock.findOne({ where: { id: collateralLockId } })

    if (!collateralLock) return { status: 'ERROR', message: 'Collareal Lock not found' }
       
    const loan = await Loan.findOne({
        where: {
            contractLoanId: collateralLock.bCoinContractLoanId,
            loansContractAddress: collateralLock.loansContractAddress,           
        }
    })

    const notificationEmail = await EmailNotification.findOne({
        where: {
            account: loan.borrower
        }
    })

    if (!notificationEmail) return { status: 'ERROR', message: 'Account does not have notification email' }

    const transporter = nodemailer.createTransport({
        host: settings.SMTP_HOST,
        port: settings.SMTP_PORT,
        secure: true,
        auth: {
            user: settings.SMTP_USER,
            pass: settings.SMTP_PASSWORD
        }
    })

    const data = {
        host: process.env.SERVER_HOST,
        currentDate: moment().format("DD/MM/YYYY"),
        contractLoanId: loan.contractLoanId,
        lender: `${loan.lender.substring(0, 8)}...${loan.lender.substring(loan.lender.length - 8)}`,
        secretHashB1: `${loan.secretHashB1.substring(0, 8)}...${loan.secretHashB1.substring(loan.secretHashB1.length - 8)}`,
        duration: '30d',
        principal: currencyFormatter.format(loan.principal, { code: 'USD', symbol: '' }),
        interest: currencyFormatter.format(loan.interest, { code: 'USD', symbol: '' }),
        tokenSymbol: loan.tokenSymbol,
        apy: parseFloat(BigNumber(loan.interest).dividedBy(loan.principal).multipliedBy(1200)).toFixed(2),
        loansContract: `${loan.loansContractAddress.substring(0, 8)}...${loan.loansContractAddress.substring(loan.loansContractAddress.length - 8)}`,
        blockchain: loan.blockchain,
        networkId: loan.networkId,
        allowedCollateral: 'ONE | BNB',
        loanId: loan.id,
        collateral: {
            secretHashA1: collateralLock.secretHashA1,
            secretHashB1: collateralLock.secretHashB1,
            blockchain: collateralLock.blockchain,
            contractLoanId: collateralLock.contractLoanId,
            lender: collateralLock.lender,
            borrower: collateralLock.borrower,
            bCoinBorrowerAddress: collateralLock.bCoinBorrowerAddress,
            lockExpiration: `${moment.unix(collateralLock.loanExpiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`,
            collateral: collateralLock.collateral,
            collateralValue: currencyFormatter.format(collateralLock.collateralValue, { code: 'USD', symbol: '$' }),
            collateralizationRate: '150%',
            networkId: collateralLock.networkId,
            collateralLockContractAddress: `${collateralLock.collateralLockContractAddress.substring(0, 8)}...${collateralLock.collateralLockContractAddress.substring(collateralLock.collateralLockContractAddress.length - 8)}`,
        }
    }

    const templatePath = APP_ROOT + '/app_api/email_templates/borrower_collateral_unlocked.ejs'
    const subject = 'Collateral Unlocked | Cross-chain Loans'
    // const msg = `You unlocked your collateral. \n\n Account: ${loan.borrower} \n Duration: 30 days \n Principal: ${loan.principal} \n Interest: ${loan.interest} \n Token: ${loan.tokenName} \n Blockchain: ${loan.blockchain} \n Network: ${loan.network} \n \n View Loan Details: \n ${process.env.SERVER_HOST}/app/loan/${loanId} \n \n - Crosschain Loans Protocol`

    try {
        ejs.renderFile(path.resolve(templatePath), { data: data }, async (err, result) => {
            await transporter.verify()
            await transporter.sendMail({
                from: `"Cross-chain Loans" ${settings.SMTP_USER}`,
                to: notificationEmail.email,
                subject,
                html: result
            })
            console.log({ status: 'OK', message: 'Email notification sent' })
        })
        

    } catch (e) {
        console.error(e)
        return { status: 'ERROR', message: 'Error sending email' }
    }
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}