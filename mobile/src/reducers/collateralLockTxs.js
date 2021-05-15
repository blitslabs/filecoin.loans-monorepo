import {
    SAVE_COLLATERAL_LOCK_TXS, REMOVE_COLLATERAL_LOCK_TXS
} from '../actions/collateralLockTxs'

export default function collateralLockTxs(state = {}, action) {
    switch (action.type) {
        case SAVE_COLLATERAL_LOCK_TXS:
            return {                
                ...action.collateralLockTxs,
            }
        case REMOVE_COLLATERAL_LOCK_TXS:
            return {}
        default:
            return state
    }
}