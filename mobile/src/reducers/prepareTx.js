import { UPDATE_PRE_TX_DATA, PREPARE_TX_DATA } from '../actions/prepareTx'

export default function prepareTx(state = {}, action) {
    switch (action.type) {
        case PREPARE_TX_DATA:
            return {
                ...action.data
            }
        case UPDATE_PRE_TX_DATA:
            return {
                ...state,
                ...action.data,
            }
        default:
            return state
    }
}