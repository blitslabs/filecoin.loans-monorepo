require('dotenv').config()
const Web3 = require('web3')
const {
    HTTP_PROVIDER
} = process.env
const ABI = (require('../../artifacts/contracts/ERC20CollateralLock.sol/ERC20CollateralLock.json')).abi

async function getAssetType(tokenAddress, collateralLockContract) {
    const web3 = new Web3(new Web3.providers.HttpProvider(HTTP_PROVIDER))
    const contract = new web3.eth.Contract(ABI, collateralLockContract)
    return await contract.methods.assetTypes(tokenAddress).call()
}

const tokenAddress = '0xa84E50408f9dC576309102da03Ed8D6A82b7869B'
const collateralLockContract = '0x465905d2281f59319B158cea5f2381B9eE9930CF'

getAssetType(tokenAddress, collateralLockContract)
    .then((response) => {
        console.log(response)
    })