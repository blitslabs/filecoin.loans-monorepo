export const SAVE_NETWORK = 'SAVE_NETWORK'
export const SAVE_ACCOUNT = 'SAVE_ACCOUNT'
export const SAVE_NATIVE_TOKEN = 'SAVE_NATIVE_TOKEN'
export const SAVE_CURRENT_MODAL = 'SAVE_CURRENT_MODAL'
export const SAVE_FIL_NETWORK = 'SAVE_FIL_NETWORK'
export const SAVE_FIL_ENDPOINT = 'SAVE_FIL_ENDPOINT'
export const SAVE_FIL_TOKEN = 'SAVE_FIL_TOKEN'
export const SAVE_NOTIFICATION_EMAIL = 'SAVE_NOTIFICATION_EMAIL'

export function saveNetwork(networkId) {
    return {
        type: SAVE_NETWORK,
        networkId
    }
}

export function saveAccount(account) {
    return {
        type: SAVE_ACCOUNT,
        account
    }
}

export function saveNativeToken(tokenSymbol) {
    return {
        type: SAVE_NATIVE_TOKEN,
        tokenSymbol
    }
}

export function saveCurrentModal(modalName) {
    return {
        type: SAVE_CURRENT_MODAL,
        modalName
    }
}

export function saveFilNetwork(filNetwork) {
    return {
        type: SAVE_FIL_NETWORK,
        filNetwork
    }
}

export function saveFilEndpoint(endpoint) {
    return {
        type: SAVE_FIL_ENDPOINT,
        endpoint
    }
}

export function saveFilToken(token) {
    return {
        type: SAVE_FIL_TOKEN,
        token
    }
}

export function saveNotificationEmail(emailData) {
    return {
        type: SAVE_NOTIFICATION_EMAIL,
        emailData
    }
}