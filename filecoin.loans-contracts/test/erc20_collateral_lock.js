const { assert, expect } = require('chai')
const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')
BigNumber.set({ EXPONENTIAL_AT: 25 })
const blake2b = require('blake2b')
const Web3 = require('web3')
const web3 = new Web3('http://127.0.0.1:8545/')
const { toWei, padLeft, numberToHex } = web3.utils

let dai, priceAggregator, blake2b_contract, collateralLock
let owner, lender, borrower

describe('ERC20CollateralLock', async () => {
    
    const initialSupply = BigNumber(1000e18).toString()
    const initialBalance = BigNumber(100e18).toString()
    const initialPrice = BigNumber(160e10).toString()
    const minLoanAmount = BigNumber(10e18).toString()
    const maxLoanAmount = BigNumber(1000e18).toString()

    // Secrets / Secret Hashes
    const secretA1 = Buffer.from('secretA1')
    const secretHashA1 = blake2b(32).update(secretA1).digest('hex')
    const secretB1 = Buffer.from('secretB1')
    const secretHashB1 = blake2b(32).update(secretB1).digest('hex')

    // Borrow Request Details
    const collateralAmount = BigNumber(100e18).toString()
    const principalAmount = BigNumber(1e18).toString()
    const interestRate = BigNumber(0.1e18).toString()
    const loanExpirationPeriod = 60 * 60 * 24 * 34 // 34 days

    // FIL Accounts
    const filBorrower = 't1qphxnf4aigxvz2ivk4zvumbvu2wcm6lu6pxwu2i'
    const filLender = 't1bwon7wa4f7hpawkcluagsulibkutegwruwriwri'
    const filBorrower_bytes32 = web3.utils.toHex(filBorrower)
    const filLender_bytes32 = web3.utils.toHex(filLender)

    beforeEach(async () => {

        // Get Accounts
        [owner, lender, borrower] = await ethers.getSigners()

        // Deploy Example DAI
        const ExampleERC20 = await ethers.getContractFactory('ExampleERC20')
        dai = await ExampleERC20.connect(owner).deploy("DAI Stablecoin", "DAI", initialSupply)

        // Transfer DAI to lender
        await dai.transfer(lender.address, initialBalance)

        // Transfer DAI to borrower
        await dai.transfer(borrower.address, initialBalance)
        
        // Deploy PriceAggregatorTest
        const AggregatorTest = await ethers.getContractFactory('AggregatorTest')
        priceAggregator = await AggregatorTest.connect(owner).deploy()

        // Update AggregatorPrice
        await priceAggregator.updateAnswer(initialPrice)

        // Deploy Blake2b
        const BLAKE2b = await ethers.getContractFactory('BLAKE2b')
        blake2b_contract = await BLAKE2b.connect(owner).deploy()

        // Deploy ERC20LockCollateral
        const ERC20CollateralLock = await ethers.getContractFactory('ERC20CollateralLock')
        collateralLock = await ERC20CollateralLock.connect(owner).deploy(blake2b_contract.address)

        // Add Asset Type
        await collateralLock.connect(owner).addAssetType(dai.address, minLoanAmount, maxLoanAmount)

        // Borrower Allowance
        await dai.connect(borrower).approve(collateralLock.address, BigNumber(1000e18).toString())
    })

    it('should fetch asset type', async () => {        
        const assetType = await collateralLock.getAssetType(dai.address)
        assert.equal(assetType.minLoanAmount.toString(), minLoanAmount, 'Invalid minLoanAmount')
        assert.equal(assetType.maxLoanAmount.toString(), maxLoanAmount, 'Invalid maxLoanAmount')
    })

    it('should create borrow request', async () => {
        await collateralLock.connect(borrower).createBorrowRequest(
            `0x${secretHashA1}`,
            filBorrower_bytes32,
            collateralAmount,
            dai.address,
            principalAmount,
            interestRate,
            loanExpirationPeriod
        )

        const loan = await collateralLock.fetchLoan(1)
        assert.equal(loan.actors[0], borrower.address, 'Invalid borrower')
    })
})