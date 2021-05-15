import {
    SAVE_PIN_HASH, REMOVE_PIN_HASH, TOGGLE_BIOMETRIC_AUTH,
    TOGGLE_WALLET_LOCK, WALLET_SAVED, TOGGLE_WALLET_BACKED
} from '../actions/auth'

const initialState = {
    pin: '',
    biometric_auth: false,
    wallet_lock: false,
    wallet_saved: false,
    wallet_backed: false
}

export default function auth(state = initialState, action) {
    switch (action.type) {
        case SAVE_PIN_HASH:
            return {
                ...state,
                pin: action.pinHash
            }
        case REMOVE_PIN_HASH:
            return {
                ...state,
                pin: ''
            }
        case TOGGLE_BIOMETRIC_AUTH:
            return {
                ...state,
                biometric_auth: action.value
            }
        case TOGGLE_WALLET_LOCK:
            return {
                ...state,
                wallet_lock: action.value
            }
        case WALLET_SAVED:
            return {
                ...state,
                wallet_saved: action.value
            }
        case TOGGLE_WALLET_BACKED:
            return {
                ...state,
                wallet_backed: action.value
            }
        default:
            return state
    }
}