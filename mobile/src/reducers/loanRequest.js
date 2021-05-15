import { SAVE_LOAN_REQUEST } from '../actions/loanRequest'

export default function auth(state = {}, action) {    
    switch(action.type) {
        case SAVE_LOAN_REQUEST:
            return {
                ...state,
                ...action.loanRequest
            }
        default:
            return state
    }
}