import {
    SAVE_PUBLIC_KEYS, SAVE_ENCRYPTED_WALLET, SAVE_WALLET, REMOVE_WALLET,
    SAVE_TEMP_MNEMONIC, REMOVE_TEMP_MNEMONIC, ADD_BLOCKCHAIN_WALLET,
    UPDATE_BLOCKCHAIN_WALLET
} from '../actions/wallet'

const initialState = {
    publicKeys: {},
    encryptedWallet: {},
    balances: {}
}

export default function wallet(state = initialState, action) {
    switch (action.type) {
        case SAVE_PUBLIC_KEYS:
            return {
                ...state,
                publicKeys: action.publicKeys
            }
        case SAVE_ENCRYPTED_WALLET:
            return {
                ...state,
                encryptedWallet: action.encryptedWallet
            }
        case SAVE_WALLET:
            return {
                ...state,
                wallet: action.wallet
            }
        case REMOVE_WALLET:
            return {}
        case SAVE_TEMP_MNEMONIC:
            return {
                ...state,
                temp_mnemonic: action.mnemonic
            }
        case REMOVE_TEMP_MNEMONIC:
            return {
                ...state,
                temp_mnemonic: ''
            }
        case ADD_BLOCKCHAIN_WALLET:
            return {
                ...state,
                wallet: {
                    ...state.wallet,
                    [action.wallet.symbol]: {
                        ...action.wallet.keys
                    }
                },
                publicKeys: {
                    ...state.publicKeys,
                    [action.wallet.symbol]: action.wallet.keys.publicKey
                }
            }

        case UPDATE_BLOCKCHAIN_WALLET:
            return {
                ...state,
                wallet: {
                    ...state.wallet,
                    [action.blockchain]: {
                        ...action.keys
                    }
                },
                publicKeys: {
                    ...state.publicKeys,
                    [action.blockchain]: action.keys.publicKey
                }
            }
        
        default:
            return state
    }
}