import Web3 from 'web3'
import ABI from './ABI'
import ETH from './ETH'
import BigNumber from 'bignumber.js'
BigNumber.set({ EXPONENTIAL_AT: 25 })

class ERC20Loans {

    web3
    erc20Loans
    erc20LoansAddress

    constructor(contractAddress) {
        if (!window.ethereum) {
            throw ('Web3 provider not found')
        }

        if (!contractAddress) throw ('Missing contract address')
        this.web3 = new Web3(window.ethereum)
        this.erc20Loans = new this.web3.eth.Contract(ABI.ERC20_LOANS.abi, contractAddress)
        this.erc20LoansAddress = contractAddress
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
            return { status: 'ERROR', message: 'Error fetching user loans count' }
        }
    }

    async createLoanOffer(
        secretHashB1, filLender, principalAmount, interestAmount,
        tokenContractAddress, loanExpirationPeriod
    ) {
        if (!secretHashB1) return { status: 'ERROR', message: 'Missing secretHashB1' }
        if (!filLender) return { status: 'ERROR', message: 'Missing fil lender' }
        if (!principalAmount) return { status: 'ERROR', message: 'Missing principal amount' }
        if (!interestAmount) return { status: 'ERROR', message: 'Missing interest amount' }
        if (!tokenContractAddress) return { status: 'ERROR', message: 'Missing token contract address' }
        if (!loanExpirationPeriod) return { status: 'ERROR', message: 'Missing loan expiration period' }

        // Get token decimals
        const token = new this.web3.eth.Contract(ABI.ERC20.abi, tokenContractAddress)
        const decimals = await token.methods.decimals().call()

        // Format params
        filLender = this.web3.utils.toHex(filLender)
        principalAmount = ETH.pad(principalAmount, decimals)
        interestAmount = ETH.pad(interestAmount, decimals)
        loanExpirationPeriod = parseInt(BigNumber(loanExpirationPeriod).plus(4).multipliedBy(84400))

        // Get from account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        try {
            const tx = await this.erc20Loans.methods.createLoanOffer(
                secretHashB1, filLender, principalAmount, interestAmount,
                tokenContractAddress, loanExpirationPeriod
            ).send({ from })

            return { status: 'OK', payload: tx }

        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error creating loan offer' }
        }
    }

    async approveRequest(
        loanId, borrower, filBorrower, secretHashA1,
        paymentChannelId, collateralAmount
    ) {
        if (!loanId) return { status: 'ERROR', message: 'Missing loan ID' }
        if (!borrower) return { status: 'ERROR', message: 'Missing borrower address' }
        if (!filBorrower) return { status: 'ERROR', message: 'Missing borrower FIL address' }
        if (!secretHashA1) return { status: 'ERROR', message: 'Missing secretHashA1' }
        if (!paymentChannelId) return { status: 'ERROR', message: 'Missing payment channel ID' }
        if (!collateralAmount) return { status: 'ERROR', message: 'Missing collateral amount' }
        
        // Format params
        filBorrower = this.web3.utils.toHex(filBorrower)
        paymentChannelId = this.web3.utils.toHex(paymentChannelId)
        collateralAmount = ETH.pad(collateralAmount, 18)        

        // Get Account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        try {
            const tx = await this.erc20Loans.methods.approveRequest(
                loanId, borrower, filBorrower, secretHashA1,
                paymentChannelId, collateralAmount
            ).send({ from })
            return { status: 'OK', payload: tx }
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error accepting offer' }
        }
    }

    async withdraw(loanId, secretA1) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if (!secretA1) return { status: 'ERROR', message: 'Missing secretA1' }

        // Get account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        try {
            const tx = await this.erc20Loans.methods.withdraw(
                loanId, secretA1
            ).send({ from })

            return { status: 'OK', payload: tx }
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error withdrawing principal' }
        }
    }

    async payback(loanId) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }

        // Get account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        try {
            const tx = await this.erc20Loans.methods.payback(
                loanId
            ).send({ from })

            return { status: 'OK', payload: tx }
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error paying back loan' }
        }
    }

    async acceptRepayment(loanId, secretB1) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if(!secretB1) return { status: 'ERROR', message: 'Missing secretB1'}

        // Get account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        try {
            const tx = await this.erc20Loans.methods.acceptRepayment(
                loanId, secretB1
            ).send({ from })

            return { status: 'OK', payload: tx }
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error accepting loan repayment' }
        }
    }

    async refundPayback(loanId) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }

        // Get account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        try {
            const tx = await this.erc20Loans.methods.refundPayback(
                loanId
            ).send({ from })

            return { status: 'OK', payload: tx }
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error refunding payback' }
        }
    }

    async cancelLoan(loanId, secretB1) {
        if (!loanId) return { status: 'ERROR', message: 'Missing `loanId`' }
        if(!secretB1) return { status: 'ERROR', message: 'Missing secretB1'}

        // Get account
        const accounts = await this.web3.eth.getAccounts()
        const from = accounts[0]

        try {
            const tx = await this.erc20Loans.methods.cancelLoan(
                loanId, secretB1
            ).send({ from })

            return { status: 'OK', payload: tx }
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error canceling loan' }
        }
    }
}

export default ERC20Loans