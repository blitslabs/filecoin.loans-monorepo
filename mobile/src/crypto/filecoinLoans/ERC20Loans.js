import BigNumber from 'bignumber.js'
import ETH from '../ETH'
import ABI from '../ABI'
import Token from '../Token'
const { sign } = require('@warren-bank/ethereumjs-tx-sign')

class ERC20Loans {

    web3
    collateralLock
    collateralLockAddress
    CHAIN_ID

    constructor(web3, contractAddress, chainId) {
        this.web3 = web3
        this.erc20Loans = new this.web3.eth.Contract(ABI.ERC20Loans.abi, contractAddress)
        this.erc20LoansAddress = contractAddress
        this.CHAIN_ID = chainId
    }

    async getAccountLoans(account) {
        if (!account) return { status: 'ERROR', message: 'Missing account' }
        try {
            const accountLoans = await this.erc20Loans.methods.getAccountLoans(account).call()
            return { status: 'OK', payload: accountLoans }
        } catch (e) {
            return { status: 'ERROR', message: 'Error fetching account loans' }
        }
    }

    async getUserLoansCount(account) {
        if (!account) return { status: 'ERROR', message: 'Missing account' }
        try {
            const userLoansCount = await this.erc20Loans.methods.userLoansCount(account).call()
            return { status: 'OK', payload: userLoansCount }
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error fetching user loans count' }
        }
    }

    async createLoanOffer(
        secretHashB1, filLender, principalAmount, interestAmount,
        tokenContractAddress, loanExpirationPeriod,
        gasLimit, gasPrice, keys
    ) {
        if (!secretHashB1) return { status: 'ERROR', message: 'Missing secretHashB1' }
        if (!filLender) return { status: 'ERROR', message: 'Missing fil lender' }
        if (!principalAmount) return { status: 'ERROR', message: 'Missing principal amount' }
        if (!interestAmount) return { status: 'ERROR', message: 'Missing interest amount' }
        if (!tokenContractAddress) return { status: 'ERROR', message: 'Missing token contract address' }
        if (!loanExpirationPeriod) return { status: 'ERROR', message: 'Missing loan expiration period' }
        if (!gasLimit) return { status: 'ERROR', message: 'Missing gas limit' }
        if (!gasPrice) return { status: 'ERROR', message: 'Missing gas price' }
        if (!keys) return { status: 'ERROR', message: 'Missing wallet' }

        // Get token decimals
        const token = new this.web3.eth.Contract(Token.ERC20.abi, tokenContractAddress)
        const decimals = await token.methods.decimals().call()

        // Format params
        filLender = this.web3.utils.toHex(filLender)
        principalAmount = ETH.pad(principalAmount, decimals)
        interestAmount = ETH.pad(interestAmount, decimals)
        loanExpirationPeriod = parseInt(BigNumber(loanExpirationPeriod).plus(4).multipliedBy(84400))

        // Get nonce
        const nonce = await this.web3.eth.getTransactionCount(keys.publicKey)

        // Format gas data
        gasPrice = this.web3.utils.toHex((new BigNumber(gasPrice).multipliedBy(1000000000)).toString())
        gasLimit = this.web3.utils.toHex(gasLimit)

        let txData
        try {
            const data = this.erc20Loans.methods.createLoanOffer(
                secretHashB1, filLender, principalAmount, interestAmount,
                tokenContractAddress, loanExpirationPeriod
            ).encodeABI()
    
            // Prepare raw tx
            txData = {
                from: keys?.publicKey,
                nonce: '0x' + nonce.toString(16),
                gasLimit,
                gasPrice,
                to: this.erc20LoansAddress,
                value: '0x0',
                chainId: this.web3.utils.toHex(this.CHAIN_ID),
                data: data
            }
        } catch(e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error creating transaction'}
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

    async approveRequest(
        loanId, borrower, filBorrower, secretHashA1,
        paymentChannelId, collateralAmount,
        gasLimit, gasPrice, keys
    ) {
        if (!loanId) return { status: 'ERROR', message: 'Missing loan ID' }
        if (!borrower) return { status: 'ERROR', message: 'Missing borrower address' }
        if (!filBorrower) return { status: 'ERROR', message: 'Missing borrower FIL address' }
        if (!secretHashA1) return { status: 'ERROR', message: 'Missing secretHashA1' }
        if (!paymentChannelId) return { status: 'ERROR', message: 'Missing payment channel ID' }
        if (!collateralAmount) return { status: 'ERROR', message: 'Missing collateral amount' }
        if (!gasLimit) return { status: 'ERROR', message: 'Missing gas limit' }
        if (!gasPrice) return { status: 'ERROR', message: 'Missing gas price' }
        if (!keys) return { status: 'ERROR', message: 'Missing wallet' }

        // Format params
        filBorrower = this.web3.utils.toHex(filBorrower)
        paymentChannelId = this.web3.utils.toHex(paymentChannelId)
        collateralAmount = ETH.pad(collateralAmount, 18)

        // Get nonce
        const nonce = await this.web3.eth.getTransactionCount(keys.publicKey)

        // Format gas data
        gasPrice = this.web3.utils.toHex((new BigNumber(gasPrice).multipliedBy(1000000000)).toString())
        gasLimit = this.web3.utils.toHex(gasLimit)

        const data = this.erc20Loans.methods.approveRequest(
            loanId, borrower, filBorrower, secretHashA1,
            paymentChannelId, collateralAmount
        ).encodeABI()

        // Prepare raw tx
        const txData = {
            from: keys?.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit,
            gasPrice,
            to: this.erc20LoansAddress,
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

    async withdraw(
        loanId, secretA1,
        gasLimit, gasPrice, keys
    ) {
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

        const data = this.erc20Loans.methods.withdraw(
            loanId, secretA1
        ).encodeABI()

        // Prepare raw tx
        const txData = {
            from: keys?.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit,
            gasPrice,
            to: this.erc20LoansAddress,
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

    async payback(
        loanId,
        gasLimit, gasPrice, keys
    ) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if (!gasLimit) return { status: 'ERROR', message: 'Missing gas limit' }
        if (!gasPrice) return { status: 'ERROR', message: 'Missing gas price' }
        if (!keys) return { status: 'ERROR', message: 'Missing wallet' }


        // Get nonce
        const nonce = await this.web3.eth.getTransactionCount(keys.publicKey)

        // Format gas data
        gasPrice = this.web3.utils.toHex((new BigNumber(gasPrice).multipliedBy(1000000000)).toString())
        gasLimit = this.web3.utils.toHex(gasLimit)

        const data = this.erc20Loans.methods.payback(
            loanId
        ).encodeABI()

        // Prepare raw tx
        const txData = {
            from: keys?.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit,
            gasPrice,
            to: this.erc20LoansAddress,
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

    async acceptRepayment(
        loanId, secretB1,
        gasLimit, gasPrice, keys
    ) {
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

        const data = this.erc20Loans.methods.acceptRepayment(
            loanId, secretB1
        ).encodeABI()

        // Prepare raw tx
        const txData = {
            from: keys?.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit,
            gasPrice,
            to: this.erc20LoansAddress,
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

    async refundPayback(
        loanId,
        gasLimit, gasPrice, keys
    ) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if (!gasLimit) return { status: 'ERROR', message: 'Missing gas limit' }
        if (!gasPrice) return { status: 'ERROR', message: 'Missing gas price' }
        if (!keys) return { status: 'ERROR', message: 'Missing wallet' }


        // Get nonce
        const nonce = await this.web3.eth.getTransactionCount(keys.publicKey)

        // Format gas data
        gasPrice = this.web3.utils.toHex((new BigNumber(gasPrice).multipliedBy(1000000000)).toString())
        gasLimit = this.web3.utils.toHex(gasLimit)

        const data = this.erc20Loans.methods.refundPayback(
            loanId
        ).encodeABI()

        // Prepare raw tx
        const txData = {
            from: keys?.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit,
            gasPrice,
            to: this.erc20LoansAddress,
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

    async cancelLoan(
        loanId, secretB1,
        gasLimit, gasPrice, keys
    ) {
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

        const data = this.erc20Loans.methods.cancelLoan(
            loanId, secretB1
        ).encodeABI()

        // Prepare raw tx
        const txData = {
            from: keys?.publicKey,
            nonce: '0x' + nonce.toString(16),
            gasLimit,
            gasPrice,
            to: this.erc20LoansAddress,
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

export default ERC20Loans