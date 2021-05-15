import { combineReducers } from 'redux'
import txs from './txs'
import auth from './auth'
import wallet from './wallet'
import shared from './shared'
import loanRequest from './loanRequest'
import balances from './balances'
import prices from './prices'
import tokens from './tokens'
import prepareTx from './prepareTx'
import loans from './loans'
import availableLoans from './availableLoans'
import collateralLockTxs from './collateralLockTxs'
import contacts from './contacts'

export default combineReducers({   
    auth,
    txs,
    wallet,
    shared,
    loanRequest,
    balances,
    prices,
    tokens,
    prepareTx,
    loans,
    availableLoans,
    collateralLockTxs,
    contacts,
})
