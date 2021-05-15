import ETH from './ETH'


const Blits = {
    createMulticoinWallet: (mnemonic, i) => {        
        const ETH = Blits.ETH.createWallet(mnemonic, i)        
        const master = {  ETH,  }
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
        } 
    }
}

export default Blits