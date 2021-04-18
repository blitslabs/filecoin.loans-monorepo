export const SAVE_ASSET_BALANCE = 'SAVE_ASSET_BALANCE'
export const REMOVE_ASSET_BALANCES = 'REMOVE_ASSET_BALANCES'

export function saveAssetBalance(asset) {
    return {
        type: SAVE_ASSET_BALANCE,
        asset
    }
}

export function removeAssetBalances() {
    return {
        type: REMOVE_ASSET_BALANCES,
    }
}