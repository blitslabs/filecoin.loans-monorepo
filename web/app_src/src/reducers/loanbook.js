import {
    SAVE_OPEN_BORROW_REQUESTS, SAVE_OPEN_LOAN_OFFERS
} from '../actions/loanbook'

const initialState = {
    borrowRequests: {},
    loanOffers: {}
}

export default function loanbook(state = initialState, action) {
    switch (action.type) {
        case SAVE_OPEN_BORROW_REQUESTS:
            return {
                ...state,
                borrowRequests: [
                    ...action.borrowRequests,
                ]
            }

        case SAVE_OPEN_LOAN_OFFERS:
            return {
                ...state,
                loanOffers: [
                    ...action.loanOffers
                ]
            }

        default:
            return state
    }
}