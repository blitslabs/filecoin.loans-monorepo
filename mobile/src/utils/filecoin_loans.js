import { API_FILECOIN_LOANS } from '@env'

export function getLoanAssets(params) {
    return fetch(API_FILECOIN_LOANS + `loanAssets/${params?.networkId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getProtocolContracts() {
    return fetch(API_FILECOIN_LOANS + `protocolContracts`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getBorrowRequests(params) {
    return fetch(API_FILECOIN_LOANS + 'orders/borrow/available', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getLoanDetails(params) {
    return fetch(API_FILECOIN_LOANS + 'loan/' + params.loanType + '/' + params.loanId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

// Confirm FIL/ERC20 Operations

export function confirmLendOperation(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/${params?.assetType}/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmERC20CollateralLockOperation(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lock/ERC20/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmSignedVoucher(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/FIL/signWithdrawVoucher/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmRedeemWithdrawVoucher(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/FIL/redeemWithdrawVoucher/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmSettleWithdraw(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/FIL/settleWithdraw/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmCollectWithdraw(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/FIL/collectWithdraw/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    })
}

export function confirmPaybackPaymentChannel(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/FIL/paybackPaymentChannel/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    })
}

export function confirmPaybackVoucher(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/FIL/signPaybackVoucher/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmRedeemPaybackVoucher(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/FIL/redeemPaybackVoucher/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmSettlePayback(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/FIL/settlePayback/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmCollectPayback(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/FIL/collectPayback/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    })
}

// ERC20/FIL

export function confirmERC20LoanOperation(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/ERC20/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmFILCollateralLock(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/ERC20/lockCollateral/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmSignSeizeCollateralVoucher(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/ERC20/signSeizeCollateralVoucher/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmSignUnlockCollateralVoucher(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/ERC20/signUnlockVoucher/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    })
}

export function confirmRedeemUnlockCollateralVoucher(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/ERC20/redeemUnlockCollateralVoucher/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmSettleUnlockCollateral(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/ERC20/settleUnlockCollateral/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmCollectUnlockCollateral(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/ERC20/collectUnlockCollateral/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmRedeemSeizeCollateralVoucher(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/ERC20/redeemSeizeCollateralVoucher/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmSettleSeizeCollateral(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/ERC20/settleSeizeCollateral/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmCollectSeizeCollateral(params) {
    return fetch(API_FILECOIN_LOANS + `operation/lend/ERC20/collectSeizeCollateral/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

// My Loans
export function getAccountLoans(params) {
    return fetch(API_FILECOIN_LOANS + '/loans/account/' + params.account, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}