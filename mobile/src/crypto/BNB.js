import BigNumber from 'bignumber.js'
import ethers from 'ethers'
import Web3 from 'web3'
import { ASSETS } from './index'
import { NETWORK } from "@env"
import Token from './Token'
import ETH from './ETH'
const { sign } = require('@warren-bank/ethereumjs-tx-sign')


class BNB extends ETH {

    API = 'https://api.bscscan.com/api?module='

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
        const txData = {
            from: keys.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            to: toAddress,
            value: amountToSend,
            chainId: web3.utils.toHex(this.CHAIN_ID)
        }

        // Build Tx
        const { rawTx } = sign(txData, keys.privateKey.replace('0x', ''))

        // Send Tx
        try {
            const txHash = await web3.eth.sendSignedTransaction('0x' + rawTx.toString('hex'))
            return { status: 'OK', payload: txHash, message: 'Transaction sent' }
        } catch (e) {
            return { status: 'ERROR', message: 'message' in e ? e.message : 'Error sending transaction' }
        }
    }    

    createBEP20Token = async (decimals, symbol, name, totalSupply, keys) => {
        if (!decimals) return { status: 'ERROR', message: 'Missing decimals' }
        if (!symbol) return { status: 'ERROR', message: 'Missing token symbol' }
        if (!name) return { status: 'ERROR', message: 'Missing token name' }
        if (!totalSupply) return { status: 'ERROR', message: 'Missing total supply' }

        // Connect to HTTP Provider
        const web3 = new Web3(new Web3.providers.HttpProvider(this.HTTP_PROVIDER))

        let weiAmount
        try {
            const web3 = new Web3()
            weiAmount = web3.utils.toWei(totalSupply)
        } catch (e) {
            console.log(e)
            return
        }

        // Determine the tx nonce
        const nonce = await web3.eth.getTransactionCount(keys.publicKey)

        // Get Gas Price
        let gasPrice = await web3.eth.getGasPrice()

        // Convert Gas Price to Hex
        gasPrice = await web3.utils.toHex(gasPrice)

        // Get Gas Limit        
        let gasLimit = '1000000'

        // Convert Gas Limit to Hex
        gasLimit = await web3.utils.toHex(gasLimit)

        const contract = new web3.eth.Contract(Token.ERC20.abi)

        const contractData = contract.deploy({
            data: `0x${Token.ERC20.bytecode.object}`,
            arguments: [decimals, symbol, name, weiAmount]
        }).encodeABI()

        // Prepare raw tx
        const txData = {
            from: keys.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            chainId: web3.utils.toHex(this.CHAIN_ID),
            data: contractData
        }

        // Build Tx
        const { rawTx } = sign(txData, keys.privateKey.replace('0x', ''))

        // Send Tx
        try {
            const txHash = await web3.eth.sendSignedTransaction('0x' + rawTx.toString('hex'))
            return { status: 'OK', payload: txHash, message: 'Transaction sent' }
        } catch (e) {
            return { status: 'ERROR', message: 'message' in e ? e.message : 'Error sending transaction' }
        }
    }

    sendToken = async (toAddress, sendAmount, contractAddress, gasLimit, gasPrice, keys) => {

        if (!toAddress) return { status: 'ERROR', message: 'Missing recepient' }
        if (!sendAmount) return { status: 'ERROR', message: 'Missing amount' }
        if (!contractAddress) return { status: 'ERROR', message: 'Missing token contract address' }
        if (!gasLimit) return { status: 'ERROR', message: 'Missing gasLimit' }
        if (!gasPrice) return { status: 'ERROR', message: 'Missing gasPrice' }
        if (!keys) return { status: 'ERROR', message: 'Missing Wallet' }

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

        // Instantiate Contract
        let contract
        try {
            contract = new web3.eth.Contract(Token.ERC20.abi, contractAddress, { from: keys.publicKey })
        } catch (e) {
            return { status: 'ERROR', message: 'Error instantiating contract' }
        }

        // Determine the tx nonce
        const nonce = await web3.eth.getTransactionCount(keys.publicKey)

        // Get Token Decimals
        const decimals = await contract.methods.decimals().call()

        // Convert amount to wei
        let amountToSend = ETH.pad(sendAmount, decimals)       
        
        // Convert Gas Price & Gas Limit to Hex
        gasLimit = web3.utils.toHex(gasLimit)
        gasPrice =  web3.utils.toHex(await web3.eth.getGasPrice())

        // Prepare raw tx
        const txData = {
            from: keys.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit: gasLimit,
            gasPrice: gasPrice,
            to: contractAddress,
            value: '0x0',
            chainId: web3.utils.toHex(this.CHAIN_ID),
            data: contract.methods.transfer(toAddress, amountToSend).encodeABI()
        }

        // Build Tx
        const { rawTx } = sign(txData, keys.privateKey.replace('0x', ''))
        
        // Send Tx
        try {
            const txHash = await web3.eth.sendSignedTransaction('0x' + rawTx.toString('hex'))
            return { status: 'OK', payload: txHash, message: 'Transaction sent' }
        } catch (e) {
            return { status: 'ERROR', message: 'message' in e ? e.message : 'Error sending transaction' }
        }
    }
}

export default BNB