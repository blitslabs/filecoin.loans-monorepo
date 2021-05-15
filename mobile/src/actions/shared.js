export const SET_SELECTED_ASSET = 'SET_SELECTED_ASSET'
export const SET_CARDSTACK_KEY = 'SET_CARDSTACK_ID'
export const SET_SELECTED_TOKEN = 'SET_SELECTED_TOKEN'
export const SET_SELECTED_LOAN = 'SET_SELECTED_LOAN'
export const SET_LOAN_DETAILS_OP = 'SET_LOAN_DETAILS_OP'
export const SET_SELECTED_COLLECTIBLE = 'SET_SELECTED_COLLECTIBLE'
export const SET_SELECTED_CURRENCY = 'SET_SELECTED_CURRENCY'

export function setSelectedAsset(assetSymbol) {
    return {
        type: SET_SELECTED_ASSET,
        assetSymbol,
    }
}

export function setCardStackKey(key) {
    return {
        type: SET_CARDSTACK_KEY,
        key,
    }
}

export function setSelectedToken(contractAddress) {
    return {
        type: SET_SELECTED_TOKEN,
        contractAddress
    }
}

export function setSelectedLoan(loanId) {
    return {
        type: SET_SELECTED_LOAN,
        loanId
    }
}

export function setLoanDetailsOp(operation) {
    return {
        type: SET_LOAN_DETAILS_OP,
        operation
    }
}

export function setSelectedCollectible(tokenId) {
    return {
        type: SET_SELECTED_COLLECTIBLE,
        tokenId
    }
}

export function setSelectedCurrency(currency) {
    return {
        type: SET_SELECTED_CURRENCY,
        currency
    }
}
