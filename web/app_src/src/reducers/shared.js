import {
    SAVE_NETWORK,
    SAVE_ACCOUNT,
    SAVE_NATIVE_TOKEN,
    SAVE_CURRENT_MODAL,
    SAVE_FIL_NETWORK,
    SAVE_FIL_ENDPOINT,
    SAVE_FIL_TOKEN
} from '../actions/shared'

const initialState = {
    networkId: '',
    account: '',
    currentModal: '',
    filNetwork: 'testnet'
}

export default function shared(state = initialState, action) {
    switch (action.type) {

        case SAVE_NETWORK:
            return {
                ...state,
                networkId: action.networkId
            }

        case SAVE_ACCOUNT:
            return {
                ...state,
                account: action.account
            }

        case SAVE_NATIVE_TOKEN:
            return {
                ...state,
                nativeToken: action.tokenSymbol
            }

        case SAVE_CURRENT_MODAL:
            return {
                ...state,
                currentModal: action.modalName
            }

        case SAVE_FIL_NETWORK:
            return {
                ...state,
                filNetwork: action.filNetwork
            }

        case SAVE_FIL_ENDPOINT:
            return {
                ...state,
                filEndpoint: action.endpoint
            }

        case SAVE_FIL_TOKEN:
            return {
                ...state,
                filToken: action.token
            }

        default:
            return state
    }
}