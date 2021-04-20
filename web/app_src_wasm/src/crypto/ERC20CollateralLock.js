import Web3 from 'web3'
import ABI from './ABI'
import ETH from './ETH'
import BigNumber from 'bignumber.js'
BigNumber.set({ EXPONENTIAL_AT: 25 })

class ERC20CollateralLock {

    web3
    collateralLock
    collateralLockAddress

    constructor(contractAddress) {
        if (!window.ethereum) {
            throw ('Web3 provider not found')
        }
        if (!contractAddress) throw ('Missing contract address')
        this.web3 = new Web3(window.ethereum)
        this.collateralLock = new this.web3.eth.Contract(ABI.ERC20_COLLATERAL_LOCK.abi, contractAddress)
        this.collateralLockAddress = contractAddress
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
        loanExpirationPeriod
    ) {
        if (!secretHashA1) return { status: 'ERROR', message: 'Missing secretHashA1' }
        if (!filBorrower) return { status: 'ERROR', message: 'Missing filBorrower' }
        if (!collateralAmount) return { status: 'ERROR', message: 'Missing collateralAmount' }
        if (!tokenContractAddress) return { status: 'ERROR', message: 'Missing tokenContractAddress' }
        if (!principalAmount) return { status: 'ERROR', message: 'Missing principalAmount' }
        if (!interestRate) return { status: 'ERROR', message: 'Missing interestRate' }
        if (!loanExpirationPeriod) return { status: 'ERROR', message: 'Missing loanExpirationPeriod' }

        // Format params
        filBorrower = this.web3.utils.toHex(filBorrower)
        principalAmount = ETH.pad(principalAmount, 18)
        interestRate = ETH.pad(parseFloat(interestRate) / 100, 18)
        loanExpirationPeriod = parseInt(BigNumber(loanExpirationPeriod).plus(4).multipliedBy(84400))

        // Get token decimals
        const token = new this.web3.eth.Contract(ABI.ERC20.abi, tokenContractAddress)
        const decimals = await token.methods.decimals().call()
        collateralAmount = ETH.pad(collateralAmount, decimals)

        // Get from account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        // Get Gas Price
        const gasPrice = await this.web3.eth.getGasPrice()
        const gasLimit = '500000'

        try {
            // Encode contract tx data
            const tx = await this.collateralLock.methods.createBorrowRequest(
                secretHashA1, filBorrower, collateralAmount,
                tokenContractAddress, principalAmount, interestRate,
                loanExpirationPeriod
            ).send({ from })

            return { status: 'OK', payload: tx }

        } catch (e) {
            return { status: 'ERROR', message: 'Error creating borrow request' }
        }
    }

    async acceptOffer(
        loanId, ethLender, filLender,
        secretHashB1, paymentChannelId,
        principalAmount,
    ) {
        console.log(loanId)
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if (!ethLender) return { status: 'ERROR', message: 'Missing ETH lender address' }
        if (!filLender) return { status: 'ERROR', message: 'Missing FIL lender address' }
        if (!secretHashB1) return { status: 'ERROR', message: 'Missing secretHashB1' }
        if (!paymentChannelId) return { status: 'ERROR', message: 'Missing payment channeld ID' }
        if (!principalAmount) return { status: 'ERROR', message: 'Missing principal amount' }

        // Format params
        filLender = this.web3.utils.toHex(filLender)
        paymentChannelId = this.web3.utils.toHex(paymentChannelId)
        principalAmount = ETH.pad(principalAmount, 18)

        // Get account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        try {
            const tx = await this.collateralLock.methods.acceptOffer(
                loanId, ethLender, filLender, secretHashB1,
                paymentChannelId, principalAmount
            ).send({ from })

            return { status: 'OK', payload: tx }
        } catch (e) {
            return { status: 'ERROR', message: 'Error accepting offer' }
        }
    }

    async unlockCollateral(
        loanId,
        secretB1
    ) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if (!secretB1) return { status: 'ERROR', message: 'Missing secretB1' }

        // Get account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        try {
            const tx = await this.collateralLock.methods.unlockCollateral(
                loanId, secretB1
            ).send({ from })

            return { status: 'OK', payload: tx }
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error unlocking collateral' }
        }
    }

    async seizeCollateral(
        loanId,
        secretA1
    ) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if (!secretA1) return { status: 'ERROR', message: 'Missing secretA1' }

        // Get account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        try {
            const tx = await this.collateralLock.methods.seizeCollateral(
                loanId, secretA1
            ).send({ from })

            return { status: 'OK', payload: tx }
        } catch (e) {
            return { status: 'ERROR', message: 'Error accepting offer' }
        }
    }

    async cancelBorrowRequest(
        loanId,
        secretA1
    ) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if (!secretA1) return { status: 'ERROR', message: 'Missing secretA1' }

        // Get account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        try {
            const tx = await this.collateralLock.methods.cancelBorrowRequest(
                loanId, secretA1
            ).send({ from })

            return { status: 'OK', payload: tx }
        } catch (e) {
            return { status: 'ERROR', message: 'Error accepting offer' }
        }
    }
}

export default ERC20CollateralLock