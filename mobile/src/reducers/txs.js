import { SAVE_TX, REMOVE_TXS } from '../actions/txs'

const initialState = {
    
}

export default function txs(state = initialState, action) {
    switch (action.type) {
        case SAVE_TX:
            return {
                ...state,
                [action.tx.address]: {
                    ...state[action.tx.address],
                    [action.tx.txHash]: {
                        ...action.tx
                    }
                }
            }
        case REMOVE_TXS:
            return {
                
            }
        default:
            return state
    }
}