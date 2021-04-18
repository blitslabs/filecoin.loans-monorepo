import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import ABI from './ABI'
import ETH from './ETH'

const CrosschainLoans = {

    getReferrals: async (loansContractAddress) => {
        // Check provider
        if (!window.ethereum) {
            return { status: 'ERROR', message: 'No web3 provider detected' }
        }

        // Enable metamask
        await window.ethereum.enable()

        // Connect to HTTP Provider
        const web3 = new Web3(window.ethereum)

        // Get account
        const accounts = await web3.eth.getAccounts()

        // Instantiate contract
        const contract = new web3.eth.Contract(ABI.LOANS.abi, loansContractAddress)

        // Get total referrals
        const totalReferrals = parseInt(await contract.methods.totalReferrals(accounts[0]).call())

        const referrals = []

        // Get all referrals
        if (totalReferrals > 0) {
            for (let i = 0; i < totalReferrals; i++) {
                // Get referral by index
                const ref = await contract.methods.referrals(accounts[0], i).call()
                referrals.push(ref)
            }
        }

        return referrals
    },

    createLoan: async (secretHashB1, principal, tokenContractAddress, loansContractAddress, aCoinLenderAddress, referrer = '') => {

        if (!window.ethereum) {
            return { status: 'ERROR', message: 'No web3 provider detected' }
        }

        if (!secretHashB1) return { status: 'ERROR', message: 'Missing secretHashB1' }
        if (!principal) return { status: 'ERROR', message: 'Missing principal' }
        if (!tokenContractAddress) return { status: 'ERROR', message: 'Missing token address' }
        if (!loansContractAddress) return { status: 'ERROR', message: 'Missing loans contract address' }
        if (!aCoinLenderAddress) return { status: 'ERROR', message: 'Missing lender\'s acoin address ' }
        // if (!referrer) return { status: 'ERROR', message: 'Missing referrer' }

        await window.ethereum.enable()

        // Connect to HTTP Provider
        const web3 = new Web3(window.ethereum)

        // Get Lender account
        const accounts = await web3.eth.getAccounts()
        const lender = accounts[0]

        // Instantiate Contract
        let contract
        try {
            contract = new web3.eth.Contract(ABI.LOANS.abi, loansContractAddress)
        } catch (e) {
            return { status: 'ERROR', message: 'Error instantiating contract' }
        }

        // Instantiate token contract
        let token
        try {
            token = new web3.eth.Contract(ABI.ERC20.abi, tokenContractAddress)
        } catch (e) {
            return { status: 'ERROR', message: 'Error instantiating token contract' }
        }

        // Get Token Decimals
        const decimals = await token.methods.decimals().call()

        // Format Principal Amount
        let amount = ETH.pad(principal, decimals)

        // Get Token Balance
        let balance = await token.methods.balanceOf(lender).call()
        balance = new BigNumber(balance)

        // Check Balance
        if (balance.lt(amount)) {
            return { status: 'ERROR', message: 'Insufficient balance' }
        }

        // Allowance
        let allowance = await token.methods.allowance(lender, loansContractAddress).call()
        allowance = new BigNumber(allowance)

        if (!allowance || allowance.lt(amount)) {
            return { status: 'ERROR', message: 'Insufficient allowance' }
        }

        try {
            let tx

            if (referrer && referrer != '') {
                tx = await contract.methods.createLoan(
                    secretHashB1, amount, tokenContractAddress,
                    aCoinLenderAddress, referrer
                ).send({ from: lender })
            } else {
                tx = await contract.methods.createLoan(
                    secretHashB1, amount, tokenContractAddress,
                    aCoinLenderAddress
                ).send({ from: lender })
            }
            return { status: 'OK', payload: tx }
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Error creating loan' }
        }

    },
}

export default CrosschainLoans