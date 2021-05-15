import {
    SAVE_TOKEN,
    UPDATE_TOKEN_DATA,
    UPDATE_TOKEN_BALANCE,
    REMOVE_ALL_TOKENS
} from '../actions/tokens'

const initialState = {}

export default function tokens(state = initialState, action) {
    switch (action.type) {
        case SAVE_TOKEN:
            return {
                ...state,
                [action.token.contractAddress]: action.token
            }
        case UPDATE_TOKEN_DATA:
            return {
                ...state,
                [action.token.contractAddress]: {
                    ...state[action.token.contractAddress],
                    ...action.token
                }
            }
        case UPDATE_TOKEN_BALANCE:
            return {
                ...state,
                [action.token.contractAddress]: {
                    ...state[action.token.contractAddress],
                    balance: action.token.balance,
                }
            }
        case REMOVE_ALL_TOKENS:
            return {}
        default:
            return state
    }
}