const hre = require('hardhat')
const BigNumber = require('bignumber.js')
BigNumber.set({ EXPONENTIAL_AT: 25 })

// https://docs.openzeppelin.com/learn/deploying-and-interacting#interacting-programmatically
async function approve(spender, amount, tokenAddress) {
    const accounts = await hre.ethers.getSigners()
    const borrower = accounts[2]
    
    const ExampleERC20 = await hre.ethers.getContractFactory('ExampleERC20')
    const erc20 = await ExampleERC20.attach(tokenAddress)
    await erc20.connect(borrower).approve(spender, amount)

    const allowance = await erc20.allowance(borrower.address, spender)
    console.log('allowance: ', allowance.toString())
}

const spender = '0x0165878A594ca255338adfa4d48449f69242Eb8F'
const amount = BigNumber(0).toString()
const tokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

approve(spender, amount, tokenAddress)