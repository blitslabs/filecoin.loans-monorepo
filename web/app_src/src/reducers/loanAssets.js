import { SAVE_LOAN_ASSETS } from '../actions/loanAssets'

export default function loanAssets(state = {}, action) {
    switch (action.type) {
        case SAVE_LOAN_ASSETS:
            return {
                ...action.assets,
            }
        default:
            return state
    }
}