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
}

export default ERC20CollateralLock