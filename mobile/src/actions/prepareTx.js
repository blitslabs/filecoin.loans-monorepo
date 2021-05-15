export const UPDATE_PRE_TX_DATA = 'UPDATE_PRE_TX_DATA'
export const PREPARE_TX_DATA = 'PREPARE_TX_DATA'

export function updatePreTxData(data) {
    return {
        type: UPDATE_PRE_TX_DATA,
        data,
    }
}

export function prepareTxData(data) {
    return {
        type: PREPARE_TX_DATA,
        data
    }
}