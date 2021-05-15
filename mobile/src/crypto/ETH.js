const ethers = require('ethers')
const Web3 = require('web3')
const Tx = require('ethereumjs-tx').Transaction
const BigNumber = require('bignumber.js')
import Token from './Token'
import ABI from './ABI'
import { ASSETS } from './index'
import { NETWORK } from "@env"
const HTTP_PROVIDER = NETWORK === 'mainnet' ? ASSETS.ETH.mainnet_endpoints.http : ASSETS.ETH.testnet_endpoints.http
const CHAIN_ID = NETWORK === 'mainnet' ? 1 : 3
const CHAIN_NAME = NETWORK === 'mainnet' ? 'mainnet' : 'ropsten'

class ETH {

    API = 'https://api.etherscan.io/api?module='

    constructor(blockchain, network) {
        this.HTTP_PROVIDER = ASSETS[blockchain][network + '_endpoints'].http
        this.CHAIN_ID = ASSETS[blockchain].chainId
        this.CHAIN_NAME = ASSETS[blockchain].chainName
    }

    getGasData = async () => {
        try {
            const web3 = new Web3(new Web3.providers.HttpProvider(this.HTTP_PROVIDER))

            // Get Gas Price
            let gasPrice = await web3.eth.getGasPrice()
            gasPrice = BigNumber(gasPrice).div(1e9)

            // Get Gas Limit
            // let lastBlock = await web3.eth.getBlock('latest')
            // let gasLimit = lastBlock.gasLimit
            const gasLimit = BigNumber('21000')

            return {
                gasPrice: gasPrice.toString(),
                gasLimit: gasLimit.toString(),
                gas: gasPrice.times(gasLimit.div(1000000000)).toString()
            }

        } catch (e) {
            console.log(e)
            return { gasPrice: '1', gasLimit: '21000' }
        }
    }


    getBalance = async (account) => {
        try {
            const web3 = new Web3(new Web3.providers.HttpProvider(this.HTTP_PROVIDER))
            let balance = await web3.eth.getBalance(account)
            balance = web3.utils.fromWei(balance)
            return balance
        } catch (e) {
            console.log(e)
            return 0
        }
    }

    static createWallet = (mnemonic, i) => {
        const ethWallet = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0'/${i}'`)
        const keys = {
            publicKey: ethWallet.address,
            privateKey: ethWallet.privateKey
        }
        return keys
    }

    send = async (toAddress, sendAmount, keys) => {

        // Connect to HTTP Provider
        const web3 = new Web3(new Web3.providers.HttpProvider(this.HTTP_PROVIDER))

        // Check if toAddress is valid
        if (!web3.utils.isAddress(toAddress)) {
            return { status: 'ERROR', message: 'Enter a valid ETH address' }
        }

        // Check amount to send
        if (!sendAmount || isNaN(sendAmount) || sendAmount <= 0) {
            return { status: 'ERROR', message: 'Enter a valid amount' }
        }

        // Convert amount to BG
        let amount = new BigNumber(sendAmount)

        // Determine the tx nonce
        const nonce = await web3.eth.getTransactionCount(keys.publicKey)

        // Get Balance
        let balance = await web3.eth.getBalance(keys.publicKey)

        // Convert balance to ETH       
        balance = await web3.utils.fromWei(balance)

        // Convert to BN
        balance = new BigNumber(balance)

        // Check balance
        if (balance.lt(amount)) {
            return { status: 'ERROR', message: 'You do not have enough balance' }
        }

        // Convert ETH amount to wei
        let amountToSend = web3.utils.toWei(amount.toString(), 'ether')

        // Convert amount to hex
        amountToSend = await web3.utils.toHex(amountToSend)

        // Get Gas Price
        let gasPrice = await web3.eth.getGasPrice()

        // Convert Gas Price to Hex
        gasPrice = await web3.utils.toHex(gasPrice)

        // Get Gas Limit
        // let lastBlock = await web3.eth.getBlock('latest')
        // let gasLimit = lastBlock.gasLimit
        let gasLimit = '21000'

        // Convert Gas Limit to Hex
        gasLimit = await web3.utils.toHex(gasLimit)

        // Prepare raw tx
        const rawTx = {
            from: keys.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            to: toAddress,
            value: amountToSend,
            chainId: this.CHAIN_ID
        }

        // Load private key
        const privateKey = new Buffer.from(keys.privateKey.replace('0x', ''), 'hex')

        // Build Tx
        const tx = new Tx(rawTx, { chain: this.CHAIN_NAME })

        // Sign Tx
        tx.sign(privateKey)

        // Serialize Tx
        const serializedTx = tx.serialize()

        // Send Tx
        try {
            const txHash = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            return { status: 'OK', payload: txHash, message: 'Transaction sent' }
        } catch (e) {
            return { status: 'ERROR', message: 'message' in e ? e.message : 'Error sending transaction' }
        }
    }

    sendToken = async (toAddress, sendAmount, contractAddress, gasLimit, gasPrice, keys) => {

        // Connect to HTTP Provider
        const web3 = new Web3(new Web3.providers.HttpProvider(this.HTTP_PROVIDER))

        // Instantiate Contract
        let contract
        try {
            contract = new web3.eth.Contract(Token.ERC20.abi, contractAddress, { from: keys.publicKey })
        } catch (e) {
            return { status: 'ERROR', message: 'Error instantiating contract' }
        }

        // Check if toAddress is valid
        if (!web3.utils.isAddress(toAddress)) {
            return { status: 'ERROR', message: 'Enter a valid ETH address' }
        }

        // Check amount to send
        if (!sendAmount || isNaN(sendAmount) || sendAmount <= 0) {
            return { status: 'ERROR', message: 'Enter a valid amount' }
        }

        // Determine the tx nonce
        const nonce = await web3.eth.getTransactionCount(keys.publicKey)

        // Get Token Decimals
        const decimals = await contract.methods.decimals().call()

        // Convert amount to wei
        let amountToSend = ETH.pad(sendAmount, decimals)

        // Convert Gas Price & Gas Limit to Hex
        gasLimit = web3.utils.toHex(gasLimit)
        gasPrice = web3.utils.toHex((new BigNumber(gasPrice).multipliedBy(1000000000)).toString())

        // Prepare raw tx
        const rawTx = {
            from: keys.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit: gasLimit,
            gasPrice: gasPrice,
            to: contractAddress,
            value: '0x0',
            chainId: this.CHAIN_ID,
            data: contract.methods.transfer(toAddress, amountToSend).encodeABI()
        }

        // Create Tx
        const tx = new Tx(rawTx, { chain: this.CHAIN_NAME })

        // Load private key
        const privateKey = new Buffer.from(keys.privateKey.replace('0x', ''), 'hex')

        // Sign 'Tx'
        tx.sign(privateKey)

        // Serialize Tx
        const serializedTx = tx.serialize()

        // Send Tx
        try {
            const txHash = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            return { status: 'OK', payload: txHash, message: 'Transaction sent' }
        } catch (e) {
            return { status: 'ERROR', message: 'message' in e ? e.message : 'Error sending transaction' }
        }

    }

    getERC20Data = async (contractAddress, publicKey) => {

        const web3 = new Web3(new Web3.providers.HttpProvider(this.HTTP_PROVIDER))

        // instantiate contract
        let contract
        try {
            contract = new web3.eth.Contract(Token.ERC20.abi, contractAddress)
        } catch (e) {
            return { status: 'ERROR', message: 'Error instantiating contract' }
        }

        const name = await contract.methods.name().call()
        const symbol = await contract.methods.symbol().call()
        const decimals = await contract.methods.decimals().call()
        const totalSupply = BigNumber(await contract.methods.totalSupply().call()).div(ETH.pad(1, decimals)).toString()
        const rawBalance = await contract.methods.balanceOf(publicKey).call()
        const balance = BigNumber(rawBalance).div(ETH.pad(1, decimals)).toString()

        const data = { name, symbol, balance, totalSupply, contractAddress, decimals }
        return data
    }

    getAllowance = async (spender, tokenContractAddress, keys) => {
        console.log(tokenContractAddress)
        if (!spender || !tokenContractAddress || !keys) {
            return { status: 'ERROR', message: 'Enter all required arguments' }
        }

        // Connect to HTTP Proviveder
        const web3 = new Web3(new Web3.providers.HttpProvider(this.HTTP_PROVIDER))

        // Instantiate token contract
        let token
        try {
            token = new web3.eth.Contract(Token.ERC20.abi, tokenContractAddress, { from: keys.publicKey })
        } catch (e) {
            return { status: 'ERROR', message: 'Error instantiating token contract' }
        }

        try {
            // Get Decimals
            const decimals = await token.methods.decimals().call()
            const allowance = await token.methods.allowance(keys.publicKey, spender).call()

            return { status: 'OK', payload: BigNumber(allowance).div(ETH.pad(1, decimals)).toString() }

        } catch (e) {
            return { status: 'ERROR', message: e ? e : 'Error getting allowance' }
        }
    }

    approveAllowance = async (spender, amount, tokenContractAddress, gasPrice, gasLimit, keys) => {
        // Connect to HTTP Proviveder
        const web3 = new Web3(new Web3.providers.HttpProvider(this.HTTP_PROVIDER))

        // Instantiate token contract
        let token
        try {
            token = new web3.eth.Contract(Token.ERC20.abi, tokenContractAddress, { from: keys.publicKey })
        } catch (e) {
            return { status: 'ERROR', message: 'Error instantiating token contract' }
        }

        // Get TX nonce
        const nonce = await web3.eth.getTransactionCount(keys.publicKey)

        // Get Token Decimals
        const decimals = await token.methods.decimals().call()

        // Format amount
        amount = ETH.pad(amount, decimals)

        // Encode TX data
        const txData = await token.methods.approve(
            spender, amount
        ).encodeABI()

        // Encode Gas
        gasLimit = web3.utils.toHex(gasLimit)
        gasPrice = web3.utils.toHex((new BigNumber(gasPrice).multipliedBy(1000000000)).toString())

        // Prepare TX
        const rawTx = {
            from: keys.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit: gasLimit,
            gasPrice: gasPrice,
            to: tokenContractAddress,
            value: '0x0',
            chainId: this.CHAIN_ID,
            data: txData
        }

        // Create TX
        const tx = new Tx(rawTx, { chain: this.CHAIN_NAME })

        // Load Private Key
        const privateKey = new Buffer.from(keys.privateKey.replace('0x', ''), 'hex')

        try {
            // Sign TX
            tx.sign(privateKey)
        } catch (e) {
            return { status: 'ERROR', message: 'Error signing transaction' }
        }

        // Serialize Tx
        let serializedTx
        try {
            serializedTx = tx.serialize()
        } catch (e) {
            return { status: 'ERROR', message: 'Error serializing transaction' }
        }

        // Send TX
        try {
            const response = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            return { status: 'OK', payload: response, message: 'Transaction sent' }
        } catch (e) {
            return { status: 'ERROR', message: 'message' in e ? e.message : 'Error sending transaction' }
        }
    }

    getTransactionsByAccount = async (account) => {
        // Connect to HTTP Proviveder
        const web3 = new Web3(new Web3.providers.HttpProvider(this.HTTP_PROVIDER))
        const currentBlock = await web3.eth.getBlockNumber()
        const n = await web3.eth.getTransactionCount(account, currentBlock)
        const bal = await web3.eth.getBalance(account, currentBlock);

        for (let i = currentBlock; i >= 0 && (n > 0 || bal > 0); --i) {

            try {
                let block = web3.eth.getBlock(i, true)
                if (block && block.transactions) {
                    block.transactions.forEach((e) => {
                        if (account == e.from) {
                            if (e.from != e.to)
                                bal = bal.plus(e.value)
                            console.log(i, e.from, e.to, e.value.toString(10));
                            --n
                        }

                        if (account == e.to) {
                            if (e.from != e.to)
                                bal = bal.minus(e.value)
                            console.log(i, e.from, e.to, e.value.toString(10))
                        }
                    })
                }

            } catch (e) {
                console.log(e)
            }
        }
    }

    static signMessage = async (msg, keys) => {
        const web3 = new Web3()
        const response = await web3.eth.accounts.sign(msg, keys.privateKey)
        return response
    }

    static getKeysFromPrivateKey = (privateKey) => {
        try {
            const wallet = new ethers.Wallet(privateKey)
            const keys = {
                publicKey: wallet.address,
                privateKey,
            }
            return keys
        } catch (e) {
            return false
        }
    }

    static isAddressValid = (address) => {
        try {
            if (address === '0x0000000000000000000000000000000000000000') return false
            const web3 = new Web3(new Web3.providers.HttpProvider(this.HTTP_PROVIDER))
            return web3.utils.isAddress(address)
        } catch (e) {
            return false
        }
    }

    static pad = (num, size) => {
        let decimals = '1'
        while (decimals.length <= parseInt(size)) decimals = decimals + '0'
        return Number(BigNumber(num).multipliedBy(decimals).toString()).toLocaleString('fullwide', { useGrouping: false })
    }

    // API
    getAccountTxs = async (account, blockchain) => {
        const URL = `${this.API}account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=dec&apikey=YourApiKeyToken`
        return fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(data => data.json())
            .then((res) => {

                if (res?.status === '1' || res?.message === 'OK') {
                    const payload = []

                    for (let tx of res.result) {
                        tx = {
                            id: tx.hash,
                            address: account,
                            txHash: tx.hash,
                            from: tx.from,
                            to: tx.to,
                            fee: (new BigNumber(tx.gasUsed).multipliedBy(tx.gasPrice).dividedBy(1e18)).toString(),
                            date: tx.timeStamp,
                            block: tx.blockNumber,
                            status: tx.txreceipt_status == 1 ? 'completed' : tx.txreceipt_status,
                            type: 'transfer',
                            direction: tx.from.toUpperCase() == account.toUpperCase() ? 'outgoing' : 'incoming',
                            metadata: {
                                value: BigNumber(tx.value).dividedBy(1e18).toString(),
                                symbol: blockchain,
                                decimals: 18
                            }
                        }
                        payload.push(tx)
                    }

                    return { status: 'OK', payload }
                }
            })
    }

    getAccountTokenTxs = async (account) => {
        const URL = `${this.API}account&action=tokentx&address=${account}&startblock=0&endblock=99999999&sort=dec&apikey=YourApiKeyToken`
        return fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(data => data.json())
            .then((res) => {
                
                if (res?.status === '1' || res?.message === 'OK') {
                    const payload = []

                    for (let tx of res.result) {
                        tx = {
                            id: tx.hash,
                            address: account,
                            txHash: tx.hash,
                            from: tx.from,
                            to: tx.to,
                            fee: (new BigNumber(tx.gasUsed).multipliedBy(tx.gasPrice).dividedBy(1e18)).toString(),
                            date: tx.timeStamp,
                            block: tx.blockNumber,
                            status: 'completed',
                            type: 'token_transfer',
                            direction: tx.from.toUpperCase() == account.toUpperCase() ? 'outgoing' : 'incoming',
                            metadata: {
                                value: BigNumber(tx.value).dividedBy(1e18).toString(),
                                name: tx?.tokenName,
                                symbol: tx?.tokenSymbol,
                                token_id: tx?.contractAddress,
                                decimals: tx?.tokenDecimal,
                                to: tx?.to,
                                from: tx?.from
                            }
                        }
                        payload.push(tx)
                    }

                    return { status: 'OK', payload }
                }
            })
    }
}

export default ETH


