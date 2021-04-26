export const SAVE_HASHED_PASSWORD = 'SAVE_HASHED_PASSWORD'
export const SAVE_TEMP_PASSWORD = 'SAVE_TEMP_PASSWORD'
export const SAVE_TEMP_MNEMONIC = 'SAVE_TEMP_MNEMONIC'
export const SAVE_ENCRYPTED_WALLET = 'SAVE_ENCRYPTED_WALLET'
export const SAVE_PUBLIC_KEY = 'SAVE_PUBLIC_KEY'
export const REMOVE_TEMP_PASSWORD = 'REMOVE_TEMP_PASSWORD'
export const REMOVE_TEMP_MNEMONIC = 'REMOVE_TEMP_MNEMONIC'
export const REMOVE_FIL_WALLET = 'REMOVE_FIL_WALLET'
export const SAVE_FIL_BALANCE = 'SAVE_FIL_BALANCE'
export const SAVE_FIL_TXS = 'SAVE_FIL_TXS'
export const SAVE_PENDING_TX = 'SAVE_PENDING_TX'
export const REMOVE_PENDING_TX = 'REMOVE_PENDING_TX'
export const REMOVE_ALL_PENDING_TXS = 'REMOVE_ALL_PENDING_TXS'

export function saveHashedPassword(password) {
    return {
        type: SAVE_HASHED_PASSWORD,
        password
    }
}

export function saveTempPassword(password) {
    return {
        type: SAVE_TEMP_PASSWORD,
        password
    }
}

export function saveTempMnemonic(mnemonic) {
    return {
        type: SAVE_TEMP_MNEMONIC,
        mnemonic
    }
}

export function saveEncryptedWallet(encryptedWallet) {
    return {
        type: SAVE_ENCRYPTED_WALLET,
        encryptedWallet
    }
}

export function savePublicKey(publicKey) {
    return {
        type: SAVE_PUBLIC_KEY,
        publicKey
    }
}

export function removeTempPassword() {
    return {
        type: REMOVE_TEMP_PASSWORD,
    }
}

export function removeTempMnemonic() {
    return {
        type: REMOVE_TEMP_MNEMONIC
    }
}

export function removeFilWallet() {
    return {
        type: REMOVE_FIL_WALLET
    }
}

export function saveFilBalance(balanceData) {
    return {
        type: SAVE_FIL_BALANCE,
        balanceData
    }
}

export function saveFilTxs(txData) {
    return {
        type: SAVE_FIL_TXS,
        txData
    }
}

export function savePendingTx(txData) {
    return { 
        type: SAVE_PENDING_TX,
        txData
    }
}

export function removePendingTx(txData) {
    return {
        type: REMOVE_PENDING_TX,
        txData
    }
}

export function removeAllPendingTxs() {
    return {
        type: REMOVE_ALL_PENDING_TXS
    }
}