const hre = require('hardhat')
const BigNumber = require('bignumber.js')
BigNumber.set({ EXPONENTIAL_AT: 25 })

async function main() {

    // Details
    const initialSupply = BigNumber(100000e18).toString()
    const initialBalance = BigNumber(1000e18).toString()    
    const minLoanAmount = BigNumber(10e18).toString()
    const maxLoanAmount = BigNumber(10000e18).toString()

    const signers = await hre.ethers.getSigners()
    const owner = signers[0]
    const lender = signers[1]
    const borrower = signers[2]

    // Deploy Test DAI
    const ExampleERC20 = await hre.ethers.getContractFactory('ExampleERC20')
    const dai = await ExampleERC20.connect(owner).deploy('DAI Stablecoin', 'DAI', initialSupply)

    // Wait for DAI to deploy
    await dai.deployed()

    // Transfer DAI to lender
    await dai.connect(owner).transfer(lender.address, initialBalance)

    // Transfer DAI to borrower
    await dai.connect(owner).transfer(borrower.address, initialBalance)

    // Deploy BLAKE2b
    const BLAKE2b = await hre.ethers.getContractFactory('BLAKE2b')
    const blake2b = await BLAKE2b.connect(owner).deploy()

    // Wait for Blake2b to deploy
    await blake2b.deployed()

    // Deploy ERC20Loans
    const ERC20Loans = await hre.ethers.getContractFactory('ERC20Loans')
    const erc20Loans = await ERC20Loans.connect(owner).deploy(blake2b.address)

    // Wait for ERC20Loans to deploy
    await erc20Loans.deployed()

    // Add Asset Type
    await erc20Loans.connect(owner).addAssetType(dai.address, minLoanAmount, maxLoanAmount)

    console.log('#### RESULTS ####')

    // Contracts
    console.log('DAI: ', dai.address)
    console.log('ERC20Loans: ', erc20Loans.address)
    
    // Accounts
    console.log('owner: ', owner.address)
    console.log('lender: ', lender.address)
    console.log('borrower: ', borrower.address)    
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });