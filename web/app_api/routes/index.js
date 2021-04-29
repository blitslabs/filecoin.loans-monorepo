const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')

// Controllers
const loanAsset = require('../controllers/loanAsset')
const protocolContract = require('../controllers/protocolContract')
const ERC20CollateralLock = require('../controllers/ERC20CollateralLock')
const filLoans = require('../controllers/filLoans')
const filPayback = require('../controllers/filPayback')
const ERC20Loans = require('../controllers/ERC20Loans')
const filCollateral = require('../controllers/filCollateral')
const emailNotification = require('../controllers/emailNotification')
const accountLoans = require('../controllers/accountLoans')
const loanEvent = require('../controllers/loanEvent')
// const test = require('../controllers/test')

router.get('/loanAssets/:networkId', loanAsset.getLoanAssets)
router.get('/protocolContracts/', protocolContract.getProtocolContracts)

// Orders
router.get('/orders/borrow/:state', ERC20CollateralLock.getBorrowRequestsByState)
router.get('/orders/lend/:state', ERC20Loans.getLoanOffersByState)

// CollateralLock
router.post('/operation/lock/ERC20/confirm', ERC20CollateralLock.confirmCollateralLockOperation)

// FIL => ERC20
router.post('/operation/lend/FIL/confirm', filLoans.confirmLendOperation)
router.post('/operation/lend/FIL/signWithdrawVoucher/confirm', filLoans.confirmSignWithdrawVoucherOperation)
router.post('/operation/lend/FIL/redeemWithdrawVoucher/confirm', filLoans.confirmRedeemWithdrawVoucher)
router.post('/operation/lend/FIL/settleWithdraw/confirm', filLoans.confirmSettleWithdraw)
router.post('/operation/lend/FIL/collectWithdraw/confirm', filLoans.confirmCollectWithdraw)

router.post('/operation/lend/FIL/paybackPaymentChannel/confirm', filPayback.confirmPaybackPaymentChannel)
router.post('/operation/lend/FIL/signPaybackVoucher/confirm', filPayback.confirmPaybackVoucher)
router.post('/operation/lend/FIL/redeemPaybackVoucher/confirm', filPayback.confirmRedeemPayback)
router.post('/operation/lend/FIL/settlePayback/confirm', filPayback.confirmSettlePayback)
router.post('/operation/lend/FIL/collectPayback/confirm', filPayback.confirmCollectPayback)

// ERC20 => FIL
router.post('/operation/lend/ERC20/confirm', ERC20Loans.confirmLoanOperation)
router.post('/operation/lend/ERC20/lockCollateral/confirm', filCollateral.confirmCollateralPayCh)
router.post('/operation/lend/ERC20/signSeizeCollateralVoucher/confirm', filCollateral.confirmCollateralVoucher)
router.post('/operation/lend/ERC20/signUnlockVoucher/confirm', filCollateral.confirmSignUnlockCollateralVoucher)
router.post('/operation/lend/ERC20/redeemUnlockCollateralVoucher/confirm', filCollateral.confirmRedeemUnlockCollateralVoucher)
router.post('/operation/lend/ERC20/settleUnlockCollateral/confirm', filCollateral.confirmSettleUnlockCollateral)
router.post('/operation/lend/ERC20/collectUnlockCollateral/confirm', filCollateral.confirmCollectUnlockCollateral)
router.post('/operation/lend/ERC20/redeemSeizeCollateralVoucher/confirm', filCollateral.confirmRedeemSeizeCollateralVoucher)
router.post('/operation/lend/ERC20/settleSeizeCollateral/confirm', filCollateral.confirmSettleSeizeCollateral)
router.post('/operation/lend/ERC20/collectSeizeCollateral/confirm', filCollateral.confirmCollectSeizeCollateral)

// Loan Details
router.get('/loan/FIL/:loanId', ERC20CollateralLock.getFILLoanDetails)
router.get('/loan/ERC20/:loanId', ERC20Loans.getERC20LoanDetails)

// Account Loans
router.get('/loans/account/:account', accountLoans.getAccountLoans)

// Email Notification
router.post('/notification/email', emailNotification.saveEmailNotificationAccount)

// Activity
router.get('/activity/history/:page?', loanEvent.getActivityHistory)

// Test
// router.get('/test/email', emailNotification.test)
// router.get('/test/sendemail', test.emailTest)

module.exports = router