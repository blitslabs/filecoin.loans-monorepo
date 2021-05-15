export const SAVE_TOKEN = 'SAVE_TOKEN'
export const UPDATE_TOKEN_DATA = 'UPDATE_TOKEN_DATA'
export const UPDATE_TOKEN_BALANCE = 'UPDATE_TOKEN_BALANCE'
export const REMOVE_ALL_TOKENS = 'REMOVE_ALL_TOKENS'

export function saveToken(token) {
    return {
        type: SAVE_TOKEN,
        token
    }
}

export function updateTokenData(token) {
    return {
        type: UPDATE_TOKEN_DATA,
        token
    }
}

export function updateTokenBalance(token) {
    return {
        type: UPDATE_TOKEN_BALANCE,
        token
    }
}

export function removeAllTokens() {
    return {
        type: REMOVE_ALL_TOKENS,
    }
}