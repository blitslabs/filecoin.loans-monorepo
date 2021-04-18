export const SAVE_LOAN_ASSETS = 'SAVE_LOAN_ASSETS'

export function saveLoanAssets(assets) {
    return {
        type: SAVE_LOAN_ASSETS,
        assets,
    }
}