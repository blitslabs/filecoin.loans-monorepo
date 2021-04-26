import {
    SAVE_TX, REMOVE_ALL_TXS
} from '../actions/txs'

export default function txs(state = {}, action) {
    switch (action.type) {

        case SAVE_TX:
            return {
                ...state,
                [action.tx.txHash]: {
                    ...action.tx
                }
            }

        case REMOVE_ALL_TXS:
            return {}

        default:
            return state
    }
}