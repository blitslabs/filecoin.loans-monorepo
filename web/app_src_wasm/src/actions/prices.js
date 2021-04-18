export const SAVE_PRICES = 'SAVE_PRICES'

export function savePrices(prices) {
    return {
        type: SAVE_PRICES,
        prices,
    }
}