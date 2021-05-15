export const SAVE_COLLATERAL_LOCK_TXS = 'SAVE_COLLATERAL_LOCK_TXS'
export const REMOVE_COLLATERAL_LOCK_TXS = 'REMOVE_COLLATERAL_LOCK_TXS'

export function saveCollateralLockTxs(collateralLockTxs) {
    return {
        type: SAVE_COLLATERAL_LOCK_TXS,
        collateralLockTxs
    }
}


export function removeCollateralLockTxs() {
    return {
        type: REMOVE_COLLATERAL_LOCK_TXS,
    }
}