const Web3 = require('web3')
const ERC20_ABI = (require('../artifacts/contracts/ExampleERC20.sol/ExampleERC20.json')).abi
const DAI_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const borrower = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
async function main() {
    const web3 = new Web3('http://localhost:8545')
    const contract = new web3.eth.Contract(ERC20_ABI, DAI_ADDRESS)
    const balance = await contract.methods.balanceOf(borrower).call()
    console.log(balance)
}

main()