import {
    SET_SELECTED_ASSET, SET_CARDSTACK_KEY, SET_SELECTED_TOKEN,
    SET_SELECTED_LOAN, SET_LOAN_DETAILS_OP,
    SET_SELECTED_COLLECTIBLE, SET_SELECTED_CURRENCY,
 
} from '../actions/shared'

const initialState = {
    selectedAsset: 'ONE',
    currency: 'USD'
}

export default function shared(state = initialState, action) {
    switch (action.type) {
        case SET_SELECTED_ASSET:
            return {
                ...state,
                selectedAsset: action.assetSymbol
            }
        case SET_CARDSTACK_KEY:
            return {
                ...state,
                cardStackKey: action.key
            }
        case SET_SELECTED_TOKEN:
            return {
                ...state,
                selectedToken: action.contractAddress
            }
        case SET_SELECTED_LOAN:
            return {
                ...state,
                selectedLoan: action.loanId
            }
        case SET_LOAN_DETAILS_OP:
            return {
                ...state,
                loanDetailsOp: action.operation
            }
        case SET_SELECTED_COLLECTIBLE:
            return {
                ...state,
                selectedCollectible: action.tokenId
            }
        case SET_SELECTED_CURRENCY:
            return {
                ...state,
                currency: action.currency
            }
        
        default:
            return state
    }
}