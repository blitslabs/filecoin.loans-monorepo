import Web3 from 'web3'
import ENS, { getEnsAddress } from '@ensdomains/ensjs'
import { ASSETS } from './index'
import { NETWORK } from "@env"
const HTTP_PROVIDER = NETWORK === 'mainnet' ? ASSETS.ETH.mainnet_endpoints.http : ASSETS.ETH.testnet_endpoints.http

const Lookup = {
    getAddress: async (domain) => {
        const provider = new Web3.providers.HttpProvider(HTTP_PROVIDER)
        const ens = new ENS({ provider, ensAddress: getEnsAddress('1') })
        return ens.name(domain).getAddress()
    }
}

export default Lookup