const hre = require('hardhat')
const BigNumber = require('bignumber.js')
const CONTRACT_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F'
const { sign } = require('@warren-bank/ethereumjs-tx-sign')
const Web3 = require('web3')
const ABI = (require('../artifacts/contracts/ERC20CollateralLock.sol/ERC20CollateralLock.json')).abi
const ETH_PUBLIC_KEY = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const ETH_PRIVATE_KEY = '5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'

async function acceptOffer(
    loanId,
    lender,
    filLender,
    secretHashB1,
    paymentChannelId,
    principalAmount
) {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS)
    const nonce = await web3.eth.getTransactionCount(ETH_PUBLIC_KEY)
    const gasPrice = '150000000000'
    const gasLimit = '2000000'

    const data = await contract.methods.acceptOffer(
        loanId,
        lender,
        filLender,
        secretHashB1,
        paymentChannelId,
        principalAmount
    ).encodeABI()

    const txData = {
        from: ETH_PUBLIC_KEY,
        nonce: '0x' + nonce.toString(16),
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(gasLimit),
        to: CONTRACT_ADDRESS,
        value: '0x0',
        chainId: web3.utils.toHex('31337'),
        data: data
    }

    // Build Tx
    const { rawTx } = sign(txData, ETH_PRIVATE_KEY.replace('0x', ''))

    try {
        const response = await web3.eth.sendSignedTransaction('0x' + rawTx.toString('hex'))
        console.log(response)
    } catch (e) {
        return { status: 'ERROR', message: e }
    }
}

// async function acceptOffer(
//     loanId,
//     lender,
//     filLender,
//     secretHashB1,
//     paymentChannelId,
//     principalAmount
// ) {
//     const ERC20CollateralLock = await hre.ethers.getContractFactory('ERC20CollateralLock')
//     const collateralLock = await ERC20CollateralLock.attach(CONTRACT_ADDRESS)
//     await collateralLock.acceptOffer(
//         loanId,
//         lender,
//         filLender,
//         secretHashB1,
//         paymentChannelId,
//         principalAmount
//     )

//     const loanDetails = await collateralLock.fetchLoan(1)
//     console.log(loanDetails)
// }

acceptOffer(
    '1',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    '0x7431717068786e663461696778767a3269766b347a76756d6276753277636d366c7536707877753269',
    '0x00a029ac3f5ba40ffcfc8b4da2dfeb0afc85b38d11e9fbc6e9fdfc5dc223d721',
    '0x7430313231353300000000000000000000000000000000000000000000000000',
    BigNumber('1').multipliedBy(1e18).toString()
)