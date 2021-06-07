import ETH from './ETH'
import FIL from './FIL'



const Blits = {
    createMulticoinWallet: (mnemonic, i) => {
        const ETH = Blits.ETH.createWallet(mnemonic, i)
        const master = { ETH }
        return master
    },
    getKeysFromPrivateKey: (privateKey) => {

        const ETH = App.ETH.getKeysFromPrivateKey(privateKey)
        if (ETH) return { status: 'OK', payload: { ETH } }

        return { status: 'ERROR', message: 'Invalid private key' }
    },
    isAddressValid: (address, assetSymbol) => {
        if (assetSymbol === 'ETH' || assetSymbol === 'BNB') {
            return ETH.isAddressValid(address)
        } else if (assetSymbol === 'FIL') {
            return FIL.isValidAddress(address)
        }
    }
}

export default Blits