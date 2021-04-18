const hre = require('hardhat')
const Web3 = require('web3')
const ERC20_COLLATERAL_LOCK_ABI = (require('../artifacts/contracts/ERC20CollateralLock.sol/ERC20CollateralLock.json')).abi
const CONTRACT_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F'


async function fetchLoan(loanId) {
    const web3 = new Web3('http://localhost:8545')
    const contract = new web3.eth.Contract(ERC20_COLLATERAL_LOCK_ABI, CONTRACT_ADDRESS)
    const loan = await contract.methods.fetchLoan(loanId).call()
    console.log(loan)
}

fetchLoan('1')