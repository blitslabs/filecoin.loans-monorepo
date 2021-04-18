const Web3 = require('web3')
const { Harmony } = require('@harmony-js/core')
const { ChainID, ChainType } = require('@harmony-js/utils')
const { ABI } = require('../config/ABI')
const { sendJSONresponse } = require('../utils')
const {
    Endpoint, ProtocolContract, AutoLender
} = require('../models/sequelize')
const rp = require('request-promise')
const BigNumber = require('bignumber.js')
const { sign } = require('@warren-bank/ethereumjs-tx-sign')

module.exports.updateAggregatorPrice = async (req, res) => {

    const { networkId } = req.params

    if (!networkId) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing Network ID' })
        return
    }

    // Get Network Endpoint
    const endpoint = await Endpoint.findOne({
        where: {
            endpointType: 'HTTP',
            networkId,
        }
    })

    if (!endpoint) {
        sendJSONresponse(res, 404, { status: 'ERROR', message: 'Network endpoint not found' })
        return
    }

    // Get Protocol Contract
    const oracleContract = await ProtocolContract.findOne({
        where: {
            name: 'AggregatorTest',
            networkId,
        }
    })

    if (!oracleContract) {
        sendJSONresponse(res, 404, { status: 'ERROR', message: 'Oracle contract not found' })
        return
    }

    // Get Network Account
    const autoLender = await AutoLender.findOne({
        where: {
            networkId,
        }
    })

    if (!autoLender) {
        sendJSONresponse(res, 404, { status: 'ERROR', message: 'Account not found' })
        return
    }

    // Get Asset Prices
    const prices = await rp(
        'https://blits.net/api_wallet/assetPrices',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            json: true
        }
    )

    if (prices.status !== 'OK') {
        sendJSONresponse(res, 404, { status: 'ERROR', message: 'Error fetching prices' })
        return
    }

    const price = parseInt(BigNumber(prices.payload[endpoint.blockchain].usd).multipliedBy(1e8))

    if (isNaN(price) || price <= 0) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid price' })
        return
    }

    // Connect Web3
    const web3 = new Web3(new Web3.providers.HttpProvider(endpoint.endpoint))

    // Instantiate contract
    const contract = new web3.eth.Contract(ABI.AggregatorTest.abi, oracleContract.address, { from: autoLender.publicKey })

    // Get account nonce
    const nonce = await web3.eth.getTransactionCount(autoLender.publicKey)

    // Encode ABI data
    const data = await contract.methods.updateAnswer(
        web3.utils.toHex(price)
    ).encodeABI()

    // Gas Details
    const gasPrice = '10000000000'
    const gasLimit = '150000'

    // Prepare raw tx
    const tx_data = {
        from: autoLender.publicKey,
        nonce: '0x' + nonce.toString(16),
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(gasLimit),
        to: oracleContract.address,
        value: '0x0',
        chainId: web3.utils.toHex(networkId),
        data: data
    }

    // Build Tx
    const { rawTx } = sign(tx_data, autoLender.privateKey.replace('0x', ''))

    // Send signed tx
    try {
        const response = await web3.eth.sendSignedTransaction('0x' + rawTx.toString('hex'))
        sendJSONresponse(res, 200, { status: 'OK', message: 'Oracle price updated successfully', payload: response })
        return
    } catch (e) {
        console.log(e)
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Error updating oracle price' })
        return
    }
}

// module.exports.updateAggregatorPrice_ONE = async (req, res) => {

//     const { network } = req.params
//     const blockchain = 'ONE'

//     if (!network) {
//         sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required parameters' })
//         return
//     }

//     const endpoint = await Endpoint.findOne({
//         where: {
//             endpointType: 'HTTP',
//             blockchain,
//             network,
//         }
//     })

//     if (!endpoint) {
//         sendJSONresponse(res, 422, { status: 'ERROR', message: 'Endpoint not found' })
//         return
//     }


//     const oracleContract = await ProtocolContract.findOne({
//         where: {
//             name: 'AggregatorTest',
//             blockchain,
//             network
//         }
//     })

//     if (!oracleContract) {
//         sendJSONresponse(res, 422, { status: 'ERROR', message: 'Oracle contract not found' })
//         return
//     }

//     const autoLender = await AutoLender.findOne({
//         where: {
//             blockchain,
//         }
//     })

//     if (!autoLender) {
//         sendJSONresponse(res, 422, { status: 'ERROR', message: 'Admin account not found' })
//         return
//     }

//     // Fetch Prices
//     const prices = await rp(
//         'https://blits.net/api_wallet/assetPrices',
//         {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             json: true
//         }
//     )

//     if (prices.status !== 'OK') {
//         sendJSONresponse(res, 422, { status: 'ERROR', message: 'Error fetching prices' })
//         return
//     }

//     const price = parseInt(BigNumber(prices.payload.ONE.usd).multipliedBy(1e8))

//     if (isNaN(price) || price <= 0) {
//         sendJSONresponse(res, 422, { status: 'ERROR', message: 'Invalid price' })
//         return
//     }

//     const options = {
//         gasPrice: 10000000000,
//         gasLimit: 250000
//     }

//     try {
//         const hmy = new Harmony(endpoint.endpoint, { chainType: ChainType.Harmony, chainId: network === 'mainnet' ? ChainID.HmyMainnet : ChainID.HmyTestnet })
//         const contract = hmy.contracts.createContract(ABI.AggregatorTest.abi, oracleContract.address)
//         contract.wallet.addByPrivateKey(autoLender.privateKey)
//         const response = await contract.methods.updateAnswer(price).send(options)
//         sendJSONresponse(res, 200, { status: 'OK', message: 'Oracle prices updated' })
//     } catch (e) {
//         console.log(e)
//         sendJSONresponse(res, 422, { status: 'ERROR', message: e ? e : 'Error sending transaction' })
//     }
// }