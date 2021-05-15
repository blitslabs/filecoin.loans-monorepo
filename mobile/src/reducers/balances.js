import { SAVE_BALANCES, REMOVE_BALANCES } from '../actions/balances'

const initialState = {

}

export default function txs(state = initialState, action) {
    switch (action.type) {
        case SAVE_BALANCES:
            return {
                ...state,
                ...action.balances,
            }
        case REMOVE_BALANCES:
            return {}
        default:
            return state
    }
}