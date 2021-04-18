export const SAVE_TX = 'SAVE_TX'
export const REMOVE_ALL_TXS = 'REMOVE_ALL_TXS'

export function saveTx(tx) {
    return {
        type: SAVE_TX,
        tx
    }
}

export function removeAllTxs() {
    return {
        type: REMOVE_ALL_TXS
    }
}