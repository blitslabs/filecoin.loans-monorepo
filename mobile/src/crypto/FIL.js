import { FilecoinClient, FilecoinSigner } from '@blitslabs/filecoin-js-signer'
import BigNumber from 'bignumber.js'
import { HttpJsonRpcConnector, LotusClient } from 'filecoin.js'

class FIL {

    lotus
    client
    signer

    constructor(endpoint, token) {
        const connector = new HttpJsonRpcConnector({ url: endpoint, token })
        this.lotus = new LotusClient(connector)
        this.client = new FilecoinClient(endpoint, token)
        this.signer = new FilecoinSigner()
    }

    async getBalance(account) {
        const balance = await this.lotus.wallet.balance(account)
        return BigNumber(balance).dividedBy(1e18).toString()
    }

    static createWallet = (mnemonic, i, network = 'mainnet') => {
        const filecoin_signer = new FilecoinSigner()
        const wallet = filecoin_signer.wallet.keyDerive(mnemonic, `m/44'/461'/0'/0/${i}`, network)
        return {
            publicKey: wallet.address,
            privateKey: wallet.privateKey
        }
    }

    async send(to, amount, keys, network = 'mainnet') {
        if (!to) return { status: 'ERROR', message: 'Invalid `to` address' }
        if (!amount) return { status: 'ERROR', message: 'Enter a valid amount' }
        if (!keys) return { status: 'ERROR', message: 'Missing keys' }
        try {
            const receipt = await this.client.tx.send(to, BigNumber(amount).multipliedBy(1e18), 1000000, keys.privateKey, network, false)
            return { status: 'OK', message: 'Transaction sent', payload: receipt['/'] }
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: JSON.stringify(e) }
        }
    }

    static isValidAddress(address) {

        try {
            if (!address) throw Error('No bytes to validate.')
            if (address.length < 3) throw Error('Address is too short to validate.')
            if (address.substring(0, 1) !== 'f' && address.substring(0, 1) !== 't') {
                throw Error('Unknown address network.')
            }

            switch (address[1]) {
                case '0': {
                    if (address.length > 22) throw Error('Invalid ID address length.')
                    break
                }
                case '1': {
                    if (address.length !== 41)
                        throw Error('Invalid secp256k1 address length.')
                    break
                }
                case '2': {
                    if (address.length !== 41) throw Error('Invalid Actor address length.')
                    break
                }
                case '3': {
                    if (address.length !== 86) throw Error('Invalid BLS address length.')
                    break
                }
                default: {
                    throw new Error('Invalid address protocol.')
                }
            }

            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }
}

export default FIL