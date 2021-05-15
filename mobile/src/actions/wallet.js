export const SAVE_PUBLIC_KEYS = 'SAVE_PUBLIC_KEYS'
export const SAVE_ENCRYPTED_WALLET = 'SAVE_ENCRYPTED_WALLET'
export const SAVE_WALLET = 'SAVE_WALLET'
export const REMOVE_WALLET = 'REMOVE_WALLET'
export const SAVE_TEMP_MNEMONIC = 'SAVE_TEMP_MNEMONIC'
export const REMOVE_TEMP_MNEMONIC = 'REMOVE_TEMP_MNEMONIC'
export const ADD_BLOCKCHAIN_WALLET = 'ADD_BLOCKCHAIN_WALLET'

export function savePublicKeys(publicKeys) {
    return {
        type: SAVE_PUBLIC_KEYS,
        publicKeys
    }
}

export function saveEncryptedWallet(encryptedWallet) {
    return {
        type: SAVE_ENCRYPTED_WALLET,
        encryptedWallet,
    }
}

export function saveWallet(wallet) {
    return {
        type: SAVE_WALLET,
        wallet,
    }
}

export function removeWallet() {
    return {
        type: REMOVE_WALLET
    }
}

export function saveTempMnemonic(mnemonic) {
    return {
        type: SAVE_TEMP_MNEMONIC,
        mnemonic
    }
}

export function removeTempMnemonic() {
    return {
        type: REMOVE_TEMP_MNEMONIC,
    }
}

export function addBlocchainWallet(wallet) {
    return {
        type: ADD_BLOCKCHAIN_WALLET,
        wallet,
    }
}