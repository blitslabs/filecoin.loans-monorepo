import {
    SAVE_LOANS, REMOVE_LOANS, LOADING_LOAN_STATUS
} from '../actions/loans'

export default function loans(state = {}, action) {
    switch (action.type) {
        case SAVE_LOANS:
            return {
                // ...state,
                ...action.loans,
            }
        case LOADING_LOAN_STATUS:
            return {
                ...state,
                [action.loanId]: {
                    ...state[action.loanId],
                    loadingStatus: 1
                }
            }
        case REMOVE_LOANS:
            return {}
        default:
            return state
    }
}