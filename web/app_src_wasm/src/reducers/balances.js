import { 
    SAVE_ASSET_BALANCE, REMOVE_ASSET_BALANCES
 } from '../actions/balances'

export default function balances(state = {}, action) {
    
    switch(action.type) {
        case SAVE_ASSET_BALANCE:
            return {
                ...state,
                [action.asset.contractAddress]: action.asset.balance
            }

        case REMOVE_ASSET_BALANCES:
            return {}

        default:
            return state
    }
}