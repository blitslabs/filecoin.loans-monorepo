import Web3 from 'web3'
import { sha256 } from '@liquality-dev/crypto'
import ABI from './ABI'
import BigNumber from 'bignumber.js'
import blake2b from 'blake2b'

const ETH = {

    isAddressValid: async (address) => {
        try {
            if (address === '0x0000000000000000000000000000000000000000') return false
            const web3 = new Web3()
            return web3.utils.isAddress(address)
        } catch (e) {
            return false
        }
    },

    generateSecret: async (message) => {
        if (!window.ethereum) {
            return { status: 'ERROR', message: 'No web3 provider detected' }
        }

        // Connect to HTTP Provider
        const web3 = new Web3(window.ethereum)

        await window.ethereum.enable()

        const accounts = await web3.eth.getAccounts()
        const from = accounts[0]

        try {
            // Sign Message
            const signedMessage = await web3.eth.personal.sign(message, from)

            // Generate Secret
            let secret = Buffer.from(signedMessage)
            secret = blake2b(32).update(secret).digest('hex')

            // Generate Secret Hash
            let secretHash = Buffer.from(secret)
            secretHash = blake2b(32).update(secretHash).digest('hex')
            secretHash = `0x${secretHash}`

            return { status: 'OK', payload: { secret, secretHash } }

        } catch (e) {
            return { status: 'ERROR', message: 'Error signing message' }
        }
    },

    getBalance: async (account) => {
        try {
            const web3 = new Web3(window.ethereum)
            let balance = await web3.eth.getBalance(account)
            balance = BigNumber(balance).dividedBy(ETH.pad(1, 18)).toString()
            return balance
        } catch (e) {
            console.log(e)
            return -1
        }
    },

    getERC20Balance: async (account, tokenContractAddress) => {
        if (!window.ethereum) {
            return { status: 'ERROR', message: 'No web3 provider detected' }
        }

        if (!account) return { status: 'ERROR', message: 'Missing account' }
        if (!tokenContractAddress) return { status: 'ERROR', message: 'Missing token contract address' }

        await window.ethereum.enable()

        // Connect to HTTP Provider
        const web3 = new Web3(window.ethereum)

        // Instantiate Token
        let token
        try {
            token = new web3.eth.Contract(ABI.ERC20.abi, tokenContractAddress)
        } catch (e) {
            return { status: 'ERROR', message: 'Error instantiating token contract' }
        }

        try {
            const decimals = await token.methods.decimals().call()
            let balance = await token.methods.balanceOf(account).call()
            balance = BigNumber(balance).dividedBy(ETH.pad(1, decimals)).toString()
            return { status: 'OK', payload: balance }
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error getting token balance' }
        }
    },

    getAllowance: async (spender, tokenContractAddress) => {
        if (!window.ethereum) {
            return { status: 'ERROR', message: 'No web3 provider detected' }
        }

        if (!spender) return { status: 'ERROR', message: 'Missing spender' }
        if (!tokenContractAddress) return { status: 'ERROR', message: 'Missing token contract address' }

        await window.ethereum.enable()

        // Connect to HTTP Provider
        const web3 = new Web3(window.ethereum)

        // Instantiate token contract
        let token
        try {
            token = new web3.eth.Contract(ABI.ERC20.abi, tokenContractAddress)
        } catch (e) {
            return { status: 'ERROR', message: 'Error instantiating token contract' }
        }

        const accounts = await web3.eth.getAccounts()
        const account = accounts[0]

        try {
            const decimals = await token.methods.decimals().call()
            let allowance = await token.methods.allowance(account, spender).call()
            allowance = BigNumber(allowance).dividedBy(ETH.pad(1, decimals)).toString()
            return { status: 'OK', payload: allowance }

        } catch (e) {
            return { status: 'ERROR', message: 'Error getting allowance' }
        }
    },

    approveAllowance: async (spender, amount, tokenContractAddress) => {
        if (!window.ethereum) {
            return { status: 'ERROR', message: 'No web3 provider detected' }
        }

        if (!spender) return { status: 'ERROR', message: 'Missing spender' }
        if (!amount) return { status: 'ERROR', message: 'Missing amount' }
        if (!tokenContractAddress) return { status: 'ERROR', message: 'Missing token contract address' }

        // Connect to HTTP Provider
        const web3 = new Web3(window.ethereum)

        const accounts = await web3.eth.getAccounts()
        const account = accounts[0]

        // Instantiate token contract
        let token
        try {
            token = new web3.eth.Contract(ABI.ERC20.abi, tokenContractAddress)
        } catch (e) {
            return { status: 'ERROR', message: 'Error instantiating token contract' }
        }

        const decimals = await token.methods.decimals().call()
        amount = ETH.pad(amount, decimals)

        try {
            const receipt = await token.methods.approve(spender, amount).send({ from: account })
            console.log(receipt)
            return { status: 'OK', payload: receipt }

        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error approving allowance' }
        }
    },

    getAccount: async () => {
        if (!window.ethereum) {
            return { status: 'ERROR', message: 'No web3 provider detected' }
        }

        try {
            // Connect to HTTP Provider
            const web3 = new Web3(window.ethereum)
            const accounts = await web3.eth.getAccounts()
            const account = accounts[0]
            return { status: 'OK', payload: account }

        } catch (e) {
            return { status: 'ERROR', payload: 'Error loading ETH account' }
        }
    },

    pad: (num, size) => {
        let decimals = '1'
        while (decimals.length <= parseInt(size)) decimals = decimals + '0'
        return Number(BigNumber(num).multipliedBy(decimals).toString()).toLocaleString('fullwide', { useGrouping: false })
    }
}

export default ETH