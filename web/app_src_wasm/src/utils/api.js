const API_HOST = process.env.REACT_APP_API_HOST
const API_PRICES = process.env.REACT_APP_API_PRICES

// FILECOIN LOANS API

export function getLoanAssets(params) {
    return fetch(API_HOST + `loanAssets/${params?.networkId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getProtocolContracts() {
    return fetch(API_HOST + `protocolContracts`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function confirmLoanOperation(params) {
    return fetch(API_HOST + `loan/operation/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmERC20CollateralLockOperation(params) {
    return fetch(API_HOST + `operation/lock/ERC20/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmLendOperation(params) {
    return fetch(API_HOST + `operation/lend/${params?.assetType}/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function confirmSignedVoucher(params) {
    return fetch(API_HOST + `operation/lend/FIL/signWithdrawVoucher/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
}

export function getBorrowRequests(params) {
    return fetch(API_HOST + 'orders/borrow/available', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getAvailableLoans(params) {
    return fetch(API_HOST + 'loans/available/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getPrices() {
    return fetch(API_PRICES + 'assetPrices', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getLoanDetails(params) {
    return fetch(API_HOST + 'loan/' + params.loanType + '/' + params.loanId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getActivityHistory(params) {
    return fetch(API_HOST + 'activity/history/' + params.page, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getAccountLoans(params) {
    return fetch(API_HOST + 'loans/account/' + params.account, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function saveEmailNotification(params) {
    return fetch(API_HOST + 'notification/email', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getNotificationEmail(params) {
    return fetch(API_HOST + `notification/email/${params.account}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getLockedCollateral(params) {
    return fetch(API_HOST + 'lockedCollateral/' + params.account, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getLoansHistory() {
    return fetch(API_HOST + 'loans/history', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
