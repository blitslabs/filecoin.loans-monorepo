export const SAVE_BALANCES = 'SAVE_BALANCES'
export const REMOVE_BALANCES = 'REMOVE_BALANCES'

export function saveBalances(balances) {
    return {
        type: SAVE_BALANCES,
        balances,
    }
}

export function removeBalances() {
    return {
        type: REMOVE_BALANCES,
    }
}