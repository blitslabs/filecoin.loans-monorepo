import {
    SAVE_FL_PROTOCOL_CONTRACTS, SAVE_FL_LOAN_ASSETS,
    SAVE_FL_TX, SAVE_OPEN_BORROW_REQUESTS, SAVE_OPEN_LOAN_OFFERS,
    SAVE_LOAN_DETAILS
} from '../actions/filecoinLoans'

const initialState = {
    contracts: {},
    loanAssets: {},
    loanDetails: {
        ERC20: {},
        FIL: {}
    },
    loanbook: {
        borrowRequests: [],
        loanOffers: []
    },
    txs: {}
}


export default function filecoinLoans(state = initialState, action) {

    switch (action.type) {
        case SAVE_FL_PROTOCOL_CONTRACTS:
            return {
                ...state,
                contracts: {
                    ...action.contracts
                }
            }

        case SAVE_FL_LOAN_ASSETS:
            return {
                ...state,
                loanAssets: {
                    ...action.assets
                }
            }

        case SAVE_FL_TX:
            return {
                ...state,
                txs: {
                    ...state.txs,
                    [action.tx.txHash]: {
                        ...action.tx
                    }
                }
            }

        case SAVE_OPEN_BORROW_REQUESTS:
            return {
                ...state,
                loanbook: {
                    ...state.loanbook,
                    borrowRequests: [...action.borrowRequests]
                }
            }

        case SAVE_OPEN_LOAN_OFFERS:
            return {
                ...state,
                loanbook: {
                    ...state.loanbook,
                    loanOffers: [...action.loanOffers]
                }
            }

        case SAVE_LOAN_DETAILS:
            return {
                ...state,
                loanDetails: {
                    ...state.loanDetails,
                    [action.loanData.type]: {
                        ...state.loanDetails[action.loanData.type],
                        [action.loanData.id]: {
                            ...action.loanData.loanDetails
                        }
                    }
                }
            }

        default:
            return state
    }
}