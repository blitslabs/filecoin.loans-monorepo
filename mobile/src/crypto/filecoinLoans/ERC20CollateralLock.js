import BigNumber from 'bignumber.js'
import ETH from '../ETH'
import ABI from '../ABI'
import Token from '../Token'
const { sign } = require('@warren-bank/ethereumjs-tx-sign')

class ERC20CollateralLock {

    web3
    collateralLock
    collateralLockAddress
    CHAIN_ID

    constructor(web3, contractAddress, chainId) {
        this.web3 = web3
        this.collateralLock = new this.web3.eth.Contract(ABI.ERC20CollateralLock.abi, contractAddress)
        this.collateralLockAddress = contractAddress
        this.CHAIN_ID = chainId
    }

    async getAccountLoans(account) {
        if (!account) return { status: 'ERROR', message: 'Missing account' }
        try {
            const accountLoans = await this.collateralLock.methods.getAccountLoans(account).call()
            return { status: 'OK', payload: accountLoans }
        } catch (e) {
            return { status: 'ERROR', message: 'Error fetching account loans' }
        }
    }

    async getUserLoansCount(account) {
        if (!account) return { status: 'ERROR', message: 'Missing account' }
        try {
            const userLoansCount = await this.collateralLock.methods.userLoansCount(account).call()
            return { status: 'OK', payload: userLoansCount }
        } catch (e) {
            return { status: 'ERROR', message: 'Error fetching user loans count' }
        }
    }

    async createBorrowRequest(
        secretHashA1, filBorrower, collateralAmount,
        tokenContractAddress, principalAmount, interestRate,
        loanExpirationPeriod, gasLimit, gasPrice, keys
    ) {
        if (!secretHashA1) return { status: 'ERROR', message: 'Missing secretHashA1' }
        if (!filBorrower) return { status: 'ERROR', message: 'Missing filBorrower' }
        if (!collateralAmount) return { status: 'ERROR', message: 'Missing collateralAmount' }
        if (!tokenContractAddress) return { status: 'ERROR', message: 'Missing tokenContractAddress' }
        if (!principalAmount) return { status: 'ERROR', message: 'Missing principalAmount' }
        if (!interestRate) return { status: 'ERROR', message: 'Missing interestRate' }
        if (!loanExpirationPeriod) return { status: 'ERROR', message: 'Missing loanExpirationPeriod' }
        if (!gasLimit) return { status: 'ERROR', message: 'Missing gas limit' }
        if (!gasPrice) return { status: 'ERROR', message: 'Missing gas price' }
        if (!keys) return { status: 'ERROR', message: 'Missing wallet' }

        // Format params
        filBorrower = this.web3.utils.toHex(filBorrower)
        principalAmount = ETH.pad(principalAmount, 18)
        interestRate = parseInt(ETH.pad(parseFloat(interestRate) / 100, 18))
        loanExpirationPeriod = parseInt(BigNumber(loanExpirationPeriod).plus(4).multipliedBy(84400))

        // Get token decimals
        const token = new this.web3.eth.Contract(Token.ERC20.abi, tokenContractAddress)
        const decimals = await token.methods.decimals().call()
        collateralAmount = ETH.pad(collateralAmount, decimals)

        // Get nonce
        const nonce = await this.web3.eth.getTransactionCount(keys.publicKey)

        // Format gas data
        gasPrice = this.web3.utils.toHex((new BigNumber(gasPrice).multipliedBy(1000000000)).toString())
        gasLimit = this.web3.utils.toHex(gasLimit)

        let data
        try {
            data = this.collateralLock.methods.createBorrowRequest(
                secretHashA1, filBorrower, collateralAmount,
                tokenContractAddress, principalAmount, interestRate,
                loanExpirationPeriod
            ).encodeABI()
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error encoding transaction' }
        }

        // Prepare raw tx
        const txData = {
            from: keys?.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit,
            gasPrice,
            to: this.collateralLockAddress,
            value: '0x0',
            chainId: this.web3.utils.toHex(this.CHAIN_ID),
            data: data
        }

        // Build Tx
        const { rawTx } = sign(txData, keys.privateKey.replace('0x', ''))

        // Send Tx
        try {
            const txHash = await this.web3.eth.sendSignedTransaction('0x' + rawTx.toString('hex'))
            return { status: 'OK', payload: txHash, message: 'Transaction send' }
        } catch (e) {
            return { status: 'ERROR', message: 'message' in e ? e.message : 'Error sending transaction' }
        }
    }

    async acceptOffer(
        loanId, ethLender, filLender, secretHashB1, paymentChannelId, principalAmount,
        gasLimit, gasPrice, keys
    ) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if (!ethLender) return { status: 'ERROR', message: 'Missing ETH lender address' }
        if (!filLender) return { status: 'ERROR', message: 'Missing FIL lender address' }
        if (!secretHashB1) return { status: 'ERROR', message: 'Missing secretHashB1' }
        if (!paymentChannelId) return { status: 'ERROR', message: 'Missing payment channeld ID' }
        if (!principalAmount) return { status: 'ERROR', message: 'Missing principal amount' }
        if (!gasLimit) return { status: 'ERROR', message: 'Missing gas limit' }
        if (!gasPrice) return { status: 'ERROR', message: 'Missing gas price' }
        if (!keys) return { status: 'ERROR', message: 'Missing wallet' }

        // Format params
        filLender = this.web3.utils.toHex(filLender)
        paymentChannelId = this.web3.utils.toHex(paymentChannelId)
        principalAmount = ETH.pad(principalAmount, 18)

        // Get nonce
        const nonce = await this.web3.eth.getTransactionCount(keys.publicKey)

        // Format gas data
        gasPrice = this.web3.utils.toHex((new BigNumber(gasPrice).multipliedBy(1000000000)).toString())
        gasLimit = this.web3.utils.toHex(gasLimit)

        const data = this.collateralLock.methods.acceptOffer(
            loanId, ethLender, filLender, secretHashB1,
            paymentChannelId, principalAmount
        ).encodeABI()

        // Prepare raw tx
        const txData = {
            from: keys?.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit,
            gasPrice,
            to: this.collateralLockAddress,
            value: '0x0',
            chainId: this.web3.utils.toHex(this.CHAIN_ID),
            data: data
        }

        // Build Tx
        const { rawTx } = sign(txData, keys.privateKey.replace('0x', ''))

        // Send Tx
        try {
            const txHash = await this.web3.eth.sendSignedTransaction('0x' + rawTx.toString('hex'))
            return { status: 'OK', payload: txHash, message: 'Transaction send' }
        } catch (e) {
            return { status: 'ERROR', message: 'message' in e ? e.message : 'Error sending transaction' }
        }
    }

    async unlockCollateral(loanId, secretB1, gasLimit, gasPrice, keys) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if (!secretB1) return { status: 'ERROR', message: 'Missing secretB1' }
        if (!gasLimit) return { status: 'ERROR', message: 'Missing gas limit' }
        if (!gasPrice) return { status: 'ERROR', message: 'Missing gas price' }
        if (!keys) return { status: 'ERROR', message: 'Missing wallet' }

        // Get nonce
        const nonce = await this.web3.eth.getTransactionCount(keys.publicKey)

        // Format gas data
        gasPrice = this.web3.utils.toHex((new BigNumber(gasPrice).multipliedBy(1000000000)).toString())
        gasLimit = this.web3.utils.toHex(gasLimit)

        const data = this.collateralLock.methods.unlockCollateral(
            loanId, secretB1
        ).encodeABI()

        // Prepare raw tx
        const txData = {
            from: keys?.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit,
            gasPrice,
            to: this.collateralLockAddress,
            value: '0x0',
            chainId: this.web3.utils.toHex(this.CHAIN_ID),
            data: data
        }

        // Build Tx
        const { rawTx } = sign(txData, keys.privateKey.replace('0x', ''))

        // Send Tx
        try {
            const txHash = await this.web3.eth.sendSignedTransaction('0x' + rawTx.toString('hex'))
            return { status: 'OK', payload: txHash, message: 'Transaction send' }
        } catch (e) {
            return { status: 'ERROR', message: 'message' in e ? e.message : 'Error sending transaction' }
        }
    }

    async seizeCollateral(loanId, secretA1, gasLimit, gasPrice, keys) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if (!secretA1) return { status: 'ERROR', message: 'Missing secretA1' }
        if (!gasLimit) return { status: 'ERROR', message: 'Missing gas limit' }
        if (!gasPrice) return { status: 'ERROR', message: 'Missing gas price' }
        if (!keys) return { status: 'ERROR', message: 'Missing wallet' }

        // Get nonce
        const nonce = await this.web3.eth.getTransactionCount(keys.publicKey)

        // Format gas data
        gasPrice = this.web3.utils.toHex((new BigNumber(gasPrice).multipliedBy(1000000000)).toString())
        gasLimit = this.web3.utils.toHex(gasLimit)

        const data = this.collateralLock.methods.seizeCollateral(
            loanId, secretA1
        ).encodeABI()

        // Prepare raw tx
        const txData = {
            from: keys?.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit,
            gasPrice,
            to: this.collateralLockAddress,
            value: '0x0',
            chainId: this.web3.utils.toHex(this.CHAIN_ID),
            data: data
        }

        // Build Tx
        const { rawTx } = sign(txData, keys.privateKey.replace('0x', ''))

        // Send Tx
        try {
            const txHash = await this.web3.eth.sendSignedTransaction('0x' + rawTx.toString('hex'))
            return { status: 'OK', payload: txHash, message: 'Transaction send' }
        } catch (e) {
            return { status: 'ERROR', message: 'message' in e ? e.message : 'Error sending transaction' }
        }
    }

    async cancelBorrowRequest(loanId, secretA1, gasLimit, gasPrice, keys) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if (!secretA1) return { status: 'ERROR', message: 'Missing secretA1' }
        if (!gasLimit) return { status: 'ERROR', message: 'Missing gas limit' }
        if (!gasPrice) return { status: 'ERROR', message: 'Missing gas price' }
        if (!keys) return { status: 'ERROR', message: 'Missing wallet' }

        // Get nonce
        const nonce = await this.web3.eth.getTransactionCount(keys.publicKey)

        // Format gas data
        gasPrice = this.web3.utils.toHex((new BigNumber(gasPrice).multipliedBy(1000000000)).toString())
        gasLimit = this.web3.utils.toHex(gasLimit)

        const data = this.collateralLock.methods.cancelBorrowRequest(
            loanId, secretA1
        ).encodeABI()

        // Prepare raw tx
        const txData = {
            from: keys?.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit,
            gasPrice,
            to: this.collateralLockAddress,
            value: '0x0',
            chainId: this.web3.utils.toHex(this.CHAIN_ID),
            data: data
        }

        // Build Tx
        const { rawTx } = sign(txData, keys.privateKey.replace('0x', ''))

        // Send Tx
        try {
            const txHash = await this.web3.eth.sendSignedTransaction('0x' + rawTx.toString('hex'))
            return { status: 'OK', payload: txHash, message: 'Transaction send' }
        } catch (e) {
            return { status: 'ERROR', message: 'message' in e ? e.message : 'Error sending transaction' }
        }
    }
}

export default ERC20CollateralLock