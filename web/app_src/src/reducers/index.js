import { combineReducers } from 'redux'
import storage from 'redux-persist/lib/storage'
import filecoin_wallet from './filecoin_wallet'
import shared from './shared'
import prepareTx from './prepareTx'
import prices from './prices'
import balances from './balances'
import loanAssets from './loanAssets'
import protocolContracts from './protocolContracts'
import txs from './txs'
import loanbook from './loanbook'
import loanDetails from './loanDetails'

const appReducer = combineReducers({    
    filecoin_wallet,    
    shared,
    prepareTx,
    prices,
    balances,
    loanAssets,
    protocolContracts,
    txs,
    loanbook,
    loanDetails
})

const rootReducer = (state, action) => {
    if (action.type == 'USER_LOGOUT') {
        storage.removeItem('persist:root')
        state = undefined
    }
    return appReducer(state, action)
}

export default rootReducer