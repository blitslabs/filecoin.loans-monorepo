import { API, ATLAS_API } from '@env'

export function getAssets(params) {
    return fetch(API + `/assets/${params.network}/${params.assetType}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function saveWallet(params) {
    return fetch(API + '/wallet', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json'
        },
    })
}

export function getLoansSettings(params) {
    return fetch(API + '/loans/settings/' + params.network, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getAccountLoans(params) {
    return fetch(API + '/loans/account/' + params.account, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getAvailableLoans() {
    return fetch(API + '/loans/available', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getLockedCollateral(params) {
    return fetch(API + '/lockedCollateral/' + params.account, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getPrices() {
    return fetch(API + '/assetPrices', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getPlatformVersion(params) {
    return fetch(API + '/platformVersion/' + params.platform, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

// ATLAS API

export function getAccountTokens(params) {
    return fetch(`${ATLAS_API}/v2/${params.blockchain}/tokens/${params.account}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getAccountTxs(params) {
    return fetch(`${ATLAS_API}/v2/${params.blockchain}/transactions/${params.account}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getEthAccountCollectibles(params) {
    return fetch(`https://api.opensea.io/api/v1/assets/?order_direction=desc&offset=0&limit=20&owner=${params.account}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
}
