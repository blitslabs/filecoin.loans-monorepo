import { combineReducers } from 'redux'
import txs from './txs'
import auth from './auth'
import wallet from './wallet'
import shared from './shared'
import balances from './balances'
import prices from './prices'
import tokens from './tokens'
import prepareTx from './prepareTx'
import endpoints from './endpoints'
import contacts from './contacts'
import filecoinLoans from './filecoinLoans'

export default combineReducers({
    endpoints,
    auth,
    txs,
    wallet,
    shared,    
    balances,
    prices,
    tokens,
    prepareTx,
    contacts,
    filecoinLoans
})
