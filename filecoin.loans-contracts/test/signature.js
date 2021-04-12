const { assert, expect } = require('chai')
const { ethers } = require('hardhat')
const Web3 = require('web3')
const {publicKeyToAddress} = require("@nodefactory/filecoin-address")
let verify

describe('VerifySignatureTest', async () => {

    beforeEach(async () => {
        const VerifySignatureTest = await ethers.getContractFactory('VerifySignatureTest')
        verify  = await VerifySignatureTest.deploy()
    })

    it('should verify signature', async () => {
        const web3 = new Web3('http://127.0.0.1:8545/')
        const signature = '0x3a9540038e5889fcc98d4427fed23aec90016ad138cd28caf22d8cf8ff74ae380e92ec73368a100f8deccd90578781cbdbd37337b83077f38efcab67df66acec00'
        const message = '0x56f49dcf89699a215f496779675cf37680ea806eb27d67e672b105395b8b6e05'
       
        // const response = await verify.recover(message, signature)
        const response = await verify.verifySignature(signature)
        console.log(response)
    })
})