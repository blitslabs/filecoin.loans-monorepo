const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')

// Controllers
const loanAsset = require('../controllers/loanAsset')
const protocolContract = require('../controllers/protocolContract')
const ERC20CollateralLock = require('../controllers/ERC20CollateralLock')
const filLoans = require('../controllers/filLoans')
const filPayback = require('../controllers/filPayback')

router.get('/loanAssets/:networkId', loanAsset.getLoanAssets)
router.get('/protocolContracts/', protocolContract.getProtocolContracts)

router.get('/orders/borrow/:state', ERC20CollateralLock.getBorrowRequestsByState)
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

// Loan Details
router.get('/loan/FIL/:loanId', ERC20CollateralLock.getFILLoanDetails)

module.exports = router