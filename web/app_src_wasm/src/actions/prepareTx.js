export const SAVE_PREPARE_TX = 'SAVE_PREPARE_TX'
export const REMOVE_PREPARE_TX = 'REMOVE_PREPARE_TX'

export function savePrepareTx(tx) {
    return {
        type: SAVE_PREPARE_TX,
        tx
    }
}

export function removePrepareTx() {
    return {
        type: REMOVE_PREPARE_TX
    }
}