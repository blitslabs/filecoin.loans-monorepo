import {
    SAVE_LOAN_DETAILS,
} from '../actions/loanDetails'

const initialState = {
    FIL: {},
    ERC20: {}
}

export default function loanDetails(state = initialState, action) {
    switch (action.type) {
        case SAVE_LOAN_DETAILS:
            return {
                ...state,
                [action.loanData.type]: {
                    ...state[action.loanData.type],
                    [action.loanData.loanDetails.collateralLock.id]: {
                        ...action.loanData.loanDetails
                    }
                }
            }

        default:
            return state
    }
}