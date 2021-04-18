import {
    SAVE_HASHED_PASSWORD,
    SAVE_TEMP_PASSWORD, SAVE_TEMP_MNEMONIC,
    SAVE_ENCRYPTED_WALLET, SAVE_PUBLIC_KEY,
    REMOVE_TEMP_PASSWORD, REMOVE_TEMP_MNEMONIC,
    REMOVE_FIL_WALLET, SAVE_FIL_BALANCE,
    SAVE_FIL_TXS, SAVE_PENDING_TX,
    REMOVE_PENDING_TX, REMOVE_ALL_PENDING_TXS
} from '../actions/filecoin_wallet'

const initialState = {
    hashed_password: '',
    txs: {
        mainnet: {},
        testnet: {}
    },
    pending_txs: {
        mainnet: {},
        testnet: {}
    }
}

export default function filecoin_wallet(state = initialState, action) {

    switch (action.type) {
        case SAVE_HASHED_PASSWORD:
            return {
                ...state,
                hashed_password: action.password
            }

        case SAVE_TEMP_PASSWORD:
            return {
                ...state,
                temp_password: action.password
            }

        case SAVE_TEMP_MNEMONIC:
            return {
                ...state,
                temp_mnemonic: action.mnemonic
            }

        case SAVE_ENCRYPTED_WALLET:
            return {
                ...state,
                encrypted_wallet: action.encryptedWallet
            }

        case SAVE_PUBLIC_KEY:
            return {
                ...state,
                public_key: action.publicKey
            }

        case REMOVE_TEMP_PASSWORD:
            return {
                ...state,
                temp_password: ''
            }

        case REMOVE_TEMP_MNEMONIC:
            return {
                ...state,
                temp_mnemonic: ''
            }

        case REMOVE_FIL_WALLET:
            return {}

        case SAVE_FIL_BALANCE:
            return {
                ...state,
                balance: {
                    ...state.balance,
                    [action.balanceData.network]: action.balanceData.balance
                }
            }

        case SAVE_FIL_TXS:
            return {
                ...state,
                txs: {
                    ...state.txs,
                    [action.txData.network]: {
                        ...action.txData.txs
                    }
                }
            }

        case SAVE_PENDING_TX:
            return {
                ...state,
                pending_txs: {
                    ...state.pending_txs,
                    [action.txData.network]: {
                        ...state?.pending_txs?.[action.txData.network],
                        ...action.txData.tx
                    }
                }
            }

        case REMOVE_PENDING_TX:
            return {
                ...state,
                pending_txs: {
                    ...state.pending_txs,
                    [action.txData.network]: {
                        ...Object.fromEntries(
                            Object.values(state.pending_txs[action.txData.network])
                                .filter(tx => tx.CID['/'] !== action.txData.txId)
                                .map(tx => [tx.CID['/'], tx])
                        )
                    }
                }
            }

        case REMOVE_ALL_PENDING_TXS:
            return {
                ...state,
                pending_txs: {
                    mainnet: {},
                    testnet: {}
                }
            }

        default:
            return state
    }
}