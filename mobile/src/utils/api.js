import { API, ATLAS_API } from '@env'

export function getEndpoints(params) {
    return fetch(API + `/endpoints/${params.network}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getAssets(params) {
    return fetch(API + `/assets/${params.network}/${params.assetType}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getNFTCollections(params) {
    return fetch(API + '/nftCollections', {
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

export function getHorizonTokens() {
    return fetch(API + '/horizon/tokens', {
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

export function getAccountTxsByXPUB(params) {
    return fetch(`${ATLAS_API}/v2/${params.blockchain}/transactions/xpub/${params.account}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getAccountColletion(params) {
    return fetch(`${ATLAS_API}/v4/${params.blockchain}/collections/${params.account}/collection/${params.collectionId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getAccountCollectiblesV1(params) {
    return fetch(`${ATLAS_API}/v4/collectibles/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
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

// Harmony Staking
export function getONEStakingValidator() {
    return fetch(`https://api.stake.hmny.io/networks/mainnet/validators`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getONEValidatorDetails(params) {
    return fetch(`https://api.stake.hmny.io/networks/mainnet/validators/${params.validatorAddress}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function getONEAccountDelegations(params) {
    return fetch(`https://api.stake.hmny.io/networks/mainnet/delegations/${params.account}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}