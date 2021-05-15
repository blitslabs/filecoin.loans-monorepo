export const SAVE_PIN_HASH = 'SAVE_PIN_HASH'
export const REMOVE_PIN_HASH = 'REMOVE_PIN_HASH'
export const TOGGLE_BIOMETRIC_AUTH = 'TOGGLE_BIOMETRIC_AUTH'
export const TOGGLE_WALLET_LOCK = 'TOGGLE_WALLET_LOCK'
export const WALLET_SAVED = 'WALLET_SAVED'
export const TOGGLE_WALLET_BACKED = 'TOGGLE_WALLET_BACKED'

export function savePinHash(pinHash) {
    return {
        type: SAVE_PIN_HASH,
        pinHash
    }
}

export function removePinHash() {
    return {
        type: REMOVE_PIN_HASH,
    }
}

export function toggleBiometricAuth(value) {
    return {
        type: TOGGLE_BIOMETRIC_AUTH,
        value,
    }
}

export function toggleWalletLock(value) {
    return {
        type: TOGGLE_WALLET_LOCK,
        value,
    }
}

export function walletSaved(value) {
    return {
        type: WALLET_SAVED,
        value,
    }
}

export function toggleWalletBacked(value) {
    return {
        type: TOGGLE_WALLET_BACKED,
        value,
    }
}