import { SAVE_PRICES } from '../actions/prices'

export default function prices(state = {}, action) {
    switch (action.type) {
        case SAVE_PRICES:
            return {
                ...action.prices,
            }
        default:
            return state
    }
}