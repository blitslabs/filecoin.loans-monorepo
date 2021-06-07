import {
    SAVE_ENDPOINTS, REMOVE_ENDPOINTS
} from '../actions/endpoints'

export default function endpoints(state = {}, action) {
    switch(action.type) {
        case SAVE_ENDPOINTS:
            return {
                ...state,
                ...action.endpoints
            }
        case REMOVE_ENDPOINTS:
            return {}
        default:
            return state
    }
}