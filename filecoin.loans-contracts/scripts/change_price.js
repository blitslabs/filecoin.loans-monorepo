const hre = require('hardhat')
const BigNumber = require('bignumber.js')
const CONTRACT_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
const newPrice = BigNumber(160e8).toString()

async function changePrice(newPrice) {
    const AggregatorTest = await hre.ethers.getContractFactory('AggregatorTest')
    const priceFeed = await AggregatorTest.attach(CONTRACT_ADDRESS)
    await priceFeed.updateAnswer(newPrice)

    const latestPrice = await priceFeed.latestAnswer()
    console.log(latestPrice.toString())
}

changePrice(newPrice)