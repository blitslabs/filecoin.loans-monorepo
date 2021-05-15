export const SAVE_TX = 'SAVE_TX'
export const REMOVE_TXS = 'REMOVE_TXS'

export function saveTx(tx) {
    return {
        type: SAVE_TX,
        tx
    }
}

export function removeTxs() {
    return {
        type: REMOVE_TXS,        
    }
}

