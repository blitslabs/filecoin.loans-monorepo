const hre = require('hardhat')
const CONTRACT_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
const TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

async function main() {
    const ERC20Loans = await hre.ethers.getContractFactory('ERC20Loans')
    const erc20Loans = await ERC20Loans.attach(CONTRACT_ADDRESS)
    const assetType = await erc20Loans.getAssetType(TOKEN_ADDRESS)
    console.log(assetType)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });