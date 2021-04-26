import {
    SAVE_PREPARE_TX, REMOVE_PREPARE_TX
} from '../actions/prepareTx'

export default function prepareTx(state = {}, action) {

    switch (action.type) {

        case SAVE_PREPARE_TX:
            return {
                ...action.tx
            }
        
        case REMOVE_PREPARE_TX:
            return {}

        default:
            return state
    }
}