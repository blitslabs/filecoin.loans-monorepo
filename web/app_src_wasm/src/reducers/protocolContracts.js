import { SAVE_PROTOCOL_CONTRACTS } from '../actions/protocolContracts'

export default function protocolContracts(state = {}, action) {
    switch (action.type) {
        case SAVE_PROTOCOL_CONTRACTS:
            return {
                ...action.contracts,
            }
        default:
            return state
    }
}