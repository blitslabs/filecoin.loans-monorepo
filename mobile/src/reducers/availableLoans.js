import {
    SAVE_AVAILABLE_LOANS, REMOVE_AVAILABLE_LOANS
} from '../actions/availableLoans'

export default function availableLoans(state = {}, action) {
    switch (action.type) {
        case SAVE_AVAILABLE_LOANS:
            return {                
                ...action.loans,
            }
        case REMOVE_AVAILABLE_LOANS:
            return {}
        default:
            return state
    }
}