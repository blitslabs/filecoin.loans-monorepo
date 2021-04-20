// import * as filecoin_signer from '@zondax/filecoin-signing-tools'
import CryptoJS from 'crypto-js'
import blake2b from 'blake2b'
import secp256k1 from 'secp256k1'
import BigNumber from 'bignumber.js'
import { HttpJsonRpcConnector, LotusClient } from 'filecoin.js'
// const cbor = require('ipld-dag-cbor').util
import cbor from 'ipld-dag-cbor'

const INIT_ACTOR = {
    mainnet: 'f01',
    testnet: 't01'
}

class FIL {
    lotus
    constructor(endpoint, token) {
        const connector = new HttpJsonRpcConnector({ url: endpoint, token })
        this.lotus = new LotusClient(connector)
    }

    static async signer() {
        return await import('@zondax/filecoin-signing-tools')
    }

    static decryptWallet(encrypted, password) {
        try {
            const filecoin_wallet = JSON.parse(CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8))
            return { status: 'OK', payload: filecoin_wallet }
        } catch (e) {
            return { status: 'ERROR', message: 'Error decrypting wallet' }
        }
    }

    getAccountKey(address) {
        return this.lotus.state.accountKey(address)
    }

    async send(to, amount, privateKeyBase64, network = "mainnet") {
        if (!to) return { status: 'ERROR', message: 'Missing `to` address ' }
        if (!amount) return { status: 'ERROR', message: 'Missing amount' }
        if (!privateKeyBase64) return { status: 'ERROR', message: 'Missing private key' }

        const filecoin_signer = await FIL.signer()
        const privateKey = Buffer.from(privateKeyBase64, 'base64')

        let recoveredKey
        try {
            recoveredKey = filecoin_signer.keyRecover(privateKey, network === 'mainnet' ? false : true)
        } catch (e) {
            return { status: 'ERROR', messasge: 'Failed to recover address from private key' }
        }

        const address = recoveredKey.address

        // Get Address Nonce
        let nonce
        try {
            nonce = await this.lotus.mpool.getNonce(address)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to fetch nonce' }
        }

        // Prepare message
        const message = {
            from: address,
            to,
            nonce,
            value: BigNumber(amount).multipliedBy(1e18).toString(),
            gasprice: '20000000000',
            gaslimit: 1000000,
            method: 0,
            params: []
        }

        // Get Gas Estimation
        let unsignedMessage
        try {
            unsignedMessage = await this.lotus.gasEstimate.messageGas(message)
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Failed to obtain gas estimation' }
        }

        // Sign Message
        let signedMessage
        try {
            signedMessage = JSON.parse(filecoin_signer.transactionSignLotus(unsignedMessage, privateKey))
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Failed to sign message' }
        }

        // Send message
        try {
            const CID = await this.lotus.mpool.push(signedMessage)

            const tx = {
                CID,
                From: signedMessage?.Message?.From,
                GasFeeCap: signedMessage?.Message?.GasFeeCap,
                GasLimit: signedMessage?.Message?.GasLimit,
                GasPremium: signedMessage?.Message?.GasPremium,
                Method: signedMessage?.Message?.Method,
                Nonce: signedMessage?.Message?.Nonce,
                To: signedMessage?.Message?.To,
                Value: signedMessage?.Message?.Value,
                Version: 0
            }

            return { status: 'OK', payload: tx }

        } catch (e) {
            return { status: 'ERROR', message: 'Failed to broadcast message' }
        }
    }

    async createPaymentChannel(to, amount, privateKeyBase64, network = "mainnet") {
        if (!to) return { status: 'ERROR', message: 'Missing `to` address' }
        if (!amount) return { status: 'ERROR', message: 'Missing amount' }
        if (!privateKeyBase64) return { status: 'ERROR', message: 'Missing private key' }

        const filecoin_signer = await FIL.signer()
        const privateKey = Buffer.from(privateKeyBase64, 'base64')

        let recoveredKey
        try {
            recoveredKey = filecoin_signer.keyRecover(privateKey, network === 'mainnet' ? false : true)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to recover address from private key' }
        }

        const from = recoveredKey.address

        // Get Address Nonce
        let nonce
        try {
            nonce = await this.lotus.mpool.getNonce(from)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to fetch nonce' }
        }

        // Prepare constructor params
        const constructor_params = {
            from,
            to,
        }

        // Serialize message params
        const params = {
            code_cid: 'fil/3/paymentchannel',
            constructor_params: Buffer.from(
                filecoin_signer.serializeParams(constructor_params),
            ).toString('base64'),
        }

        const serialized_params = filecoin_signer.serializeParams(params)

        // Prepare Message
        const message = {
            from,
            to: INIT_ACTOR[network], // Init actor
            nonce,
            value: BigNumber(amount).multipliedBy(1e18).toString(),
            gasprice: '20000000000',
            gaslimit: 10000000,
            method: 2, // Exec
            params: Buffer.from(serialized_params).toString('base64')
        }

        // Get Gas Estimation
        let unsignedMessage
        try {
            unsignedMessage = await this.lotus.gasEstimate.messageGas(message)
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Failed to obtain gas estimation' }
        }

        // Sign Message
        let signedMessage
        try {
            signedMessage = JSON.parse(filecoin_signer.transactionSignLotus(unsignedMessage, privateKey))
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to sign message' }
        }

        // Send Message
        try {
            const CID = await this.lotus.mpool.push(signedMessage)

            // Wait Msg
            const response = await this.lotus.state.waitMsg(CID)

            return { status: 'OK', payload: { data: response, CID } }
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to broadcast message' }
        }
    }

    static generateSecretHash(secret) {
        return blake2b(32).update(Buffer.from(secret)).digest('hex')
    }

    async createVoucher(
        paymentChannelId, timeLockMin, timeLockMax, secretHash, amount,
        lane, voucherNonce, minSettleHeight, privateKeyBase64, network = "mainnet"
    ) {
        const filecoin_signer = await FIL.signer()
        const privateKey = Buffer.from(privateKeyBase64, 'base64')

        let recoveredKey
        try {
            recoveredKey = filecoin_signer.keyRecover(privateKey, network === 'mainnet' ? false : true)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to recover address from private key' }
        }

        const from = recoveredKey.address

        // Create Voucher
        const voucher = filecoin_signer.createVoucher(
            paymentChannelId,
            timeLockMin,
            timeLockMax,
            secretHash,
            BigNumber(amount).multipliedBy(1e18).toString(),
            lane,
            voucherNonce,
            minSettleHeight
        )

        // Sign Voucher
        let signedVoucher
        try {
            signedVoucher = await filecoin_signer.signVoucher(voucher, privateKey)
            console.log(signedVoucher)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to sign voucher' }
        }

        // Verify Voucher
        let voucherIsVerified
        try {
            voucherIsVerified = await filecoin_signer.verifyVoucherSignature(signedVoucher, from)
            if (!voucherIsVerified) return { status: 'ERROR', mesage: 'Failed to verify signed voucher' }
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to verify voucher' }
        }

        return { status: 'OK', payload: signedVoucher }
    }

    static decodeVoucher(signedVoucher) {
        const cborSignedVoucher = Buffer.from(signedVoucher, 'base64')
        const sv = cbor.util.deserialize(cborSignedVoucher)
        const secretHash = Buffer.from(sv[3]).toString('hex')
        const amount = Buffer.from(sv[7]).readUIntBE(0, sv[7].length)
        return { secretHash, amount }
    }

    async redeemVoucher(paymentChannelId, signedVoucher, secret, privateKeyBase64, network = "mainnet") {
        if (!paymentChannelId) return { status: 'ERROR', message: 'Missing payment channel ID' }
        if (!signedVoucher) return { status: 'ERROR', message: 'Missing signed voucher' }
        if (!secret) return { status: 'ERROR', message: 'Missing preimage' }
        if (!privateKeyBase64) return { status: 'ERROR', message: 'Missing private key' }

        const filecoin_signer = await FIL.signer()
        const privateKey = Buffer.from(privateKeyBase64, 'base64')

        let recoveredKey
        try {
            recoveredKey = filecoin_signer.keyRecover(privateKey, network === 'mainnet' ? false : true)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to recover address from private key' }
        }

        const from = recoveredKey.address

        // Get Address Nonce
        let nonce
        try {
            nonce = await this.lotus.mpool.getNonce(from)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to fetch nonce' }
        }

        // Prepare Update Payment Channel Message
        let message
        try {
            message = filecoin_signer.updatePymtChan(
                paymentChannelId,
                from,
                signedVoucher,
                secret,
                nonce,
                '0',
                '0',
                '0'
            )
        } catch (e) {
            return { status: 'ERROR', message: 'Error creating message' }
        }

        // Get Gas Estimation
        let unsignedMessage
        try {
            unsignedMessage = await this.lotus.gasEstimate.messageGas(message)
        } catch (e) {
            console.log(e)
            return { status: 'ERROR', message: 'Failed to obtain gas estimation' }
        }

        // Sign Message
        let signedMessage
        try {
            signedMessage = JSON.parse(filecoin_signer.transactionSignLotus(unsignedMessage, privateKey))
        } catch (e) {
            return { status: 'ERROR', messag: 'Failed to sign message' }
        }

        // Send Message
        try {
            const CID = await this.lotus.mpool.push(signedMessage)
            // Wait Msg
            const response = await this.lotus.state.waitMsg(CID)
            return { status: 'OK', payload: { data: response, CID } }
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to broadcast message' }
        }
    }

    async settlePaymentChannel(paymentChannelId, privateKeyBase64, network = "mainnet") {
        if (!paymentChannelId) return { status: 'ERROR', message: 'Missing payment channel ID' }
        if (!privateKeyBase64) return { status: 'ERROR', message: 'Missing private key' }

        const filecoin_signer = await FIL.signer()
        const privateKey = Buffer.from(privateKeyBase64, 'base64')

        let recoveredKey
        try {
            recoveredKey = filecoin_signer.keyRecover(privateKey, network === 'mainnet' ? false : true)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to recover address from private key' }
        }

        const from = recoveredKey.address

        // Get Address Nonce
        let nonce
        try {
            nonce = await this.lotus.mpool.getNonce(from)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to fetch nonce' }
        }

        // Prepare Settle Payment Channel Message
        let message
        try {
            message = filecoin_signer.settlePymtChan(
                paymentChannelId,
                from,
                nonce,
                '0',
                '0',
                '0'
            )
        } catch (e) {
            return { status: 'ERROR', message: 'Error creating message' }
        }

        // Get Gas Estimation
        let unsignedMessage
        try {
            unsignedMessage = await this.lotus.gasEstimate.messageGas(message)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to obtain gas estimation' }
        }

        // Sign Message
        let signedMessage
        try {
            signedMessage = JSON.parse(filecoin_signer.transactionSignLotus(unsignedMessage, privateKey))
        } catch (e) {
            return { status: 'ERROR', messag: 'Failed to sign message' }
        }

        // Send Message
        try {
            const CID = await this.lotus.mpool.push(signedMessage)
            // Wait Msg
            const response = await this.lotus.state.waitMsg(CID)
            return { status: 'OK', payload: { data: response, CID } }
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to broadcast message' }
        }
    }

    async collectPaymentChannel(paymentChannelId, privateKeyBase64, network = "mainnet") {
        if (!paymentChannelId) return { status: 'ERROR', message: 'Missing payment channel ID' }
        if (!privateKeyBase64) return { status: 'ERROR', message: 'Missing private key' }

        const filecoin_signer = await FIL.signer()
        const privateKey = Buffer.from(privateKeyBase64, 'base64')

        let recoveredKey
        try {
            recoveredKey = filecoin_signer.keyRecover(privateKey, network === 'mainnet' ? false : true)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to recover address from private key' }
        }

        const from = recoveredKey.address

        // Get Address Nonce
        let nonce
        try {
            nonce = await this.lotus.mpool.getNonce(from)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to fetch nonce' }
        }

        // Prepare Settle Payment Channel Message
        let message
        try {
            message = filecoin_signer.collectPymtChan(
                paymentChannelId,
                from,
                nonce,
                '0',
                '0',
                '0'
            )
        } catch (e) {
            return { status: 'ERROR', message: 'Error creating message' }
        }

        // Get Gas Estimation
        let unsignedMessage
        try {
            unsignedMessage = await this.lotus.gasEstimate.messageGas(message)
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to obtain gas estimation' }
        }

        // Sign Message
        let signedMessage
        try {
            signedMessage = JSON.parse(filecoin_signer.transactionSignLotus(unsignedMessage, privateKey))
        } catch (e) {
            return { status: 'ERROR', messag: 'Failed to sign message' }
        }

        // Send Message
        try {
            const CID = await this.lotus.mpool.push(signedMessage)
            // Wait Msg
            const response = await this.lotus.state.waitMsg(CID)
            return { status: 'OK', payload: { data: response, CID } }
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to broadcast message' }
        }
    }

    async getPaymentChannelState(paymentChannelId) {
        try {
            const response = await this.lotus.state.readState(paymentChannelId)
            return { status: 'OK', payload: response }
        } catch (e) {
            return { status: 'ERROR', message: 'Failed to fetch payment channel state' }
        }
    }

    async getBalance(account) {
        const balance = await this.lotus.wallet.balance(account)
        return BigNumber(balance).dividedBy(1e18).toString()
    }

    async getAccountMessages(account) {
        // Fetch chain height
        const blockHeight = parseInt(await this.getBlockHeight())

        // Fetch account messages
        const received = await this.lotus.state.listMessages({ to: account }, null, blockHeight - 1440)
        const sent = await this.lotus.state.listMessages({ from: account }, null, blockHeight - 1440)

        const payload = {}

        // Fetch message details
        for (let r of received) {
            const message = await this.getMessage(r)
            payload[message?.CID['/']] = message
        }

        for (let s of sent) {
            const message = await this.getMessage(s)
            payload[message?.CID['/']] = message
        }

        return payload
    }

    async getBlockHeight() {
        const res = await this.lotus.chain.getHead()
        return res.Height
    }

    async getMessage(messageCID) {
        const message = await this.lotus.chain.getMessage(messageCID)
        return message
    }

    async messageIsMined(messageCID) {
        try {
            const isMined = await this.lotus.chain.hasObj(messageCID)
            return isMined
        } catch (e) {
            return false
        }
    }

    async getMessageReceipt(messageCID) {
        const receipt = await this.lotus.state.getReceipt(messageCID)
        return receipt
    }

    getLotusVersion() {
        return this.lotus.common.version()
    }

    static getDigest(message) {
        const messageBuffer = Buffer.from(message)
        return blake2b(32).update(messageBuffer).digest()
    }

    static signMessage(message, privateKeyBase64) {
        const privateKey = Buffer.from(privateKeyBase64, 'base64')
        // Get Mesage digest
        const messageDigest = FIL.getDigest(message)
        // Sign message
        const signature = secp256k1.ecdsaSign(messageDigest, privateKey)
        const signatureResult = Buffer.concat([
            Buffer.from(signature.signature),
            Buffer.from([signature.recid]),
        ])
        return Buffer.from(signatureResult).toString('hex')
    }

    static verifySignature(signature, message) {
        signature = Buffer.from(signature, 'hex')

        // Get Message Digest
        const messageDigest = FIL.getDigest(message)

        // Get public Key
        const publicKey = secp256k1.ecdsaRecover(
            signature.slice(0, -1),
            signature[64],
            messageDigest,
            false
        )

        return secp256k1.ecdsaVerify(
            signature.slice(0, -1),
            messageDigest,
            publicKey
        )
    }

    // https://github.com/glifio/filecoin-address/blob/primary/src/index.js#L137
    static isValidAddress(address) {
        try {
            if (!address) throw Error('No bytes to validate.')
            if (address.length < 3) throw Error('Address is too short to validate.')
            if (address[0] !== 'f' && address[0] !== 't') {
                throw Error('Unknown address network.')
            }

            switch (address[1]) {
                case '0': {
                    if (address.length > 22) throw Error('Invalid ID address length.')
                    break
                }
                case '1': {
                    if (address.length !== 41)
                        throw Error('Invalid secp256k1 address length.')
                    break
                }
                case '2': {
                    if (address.length !== 41) throw Error('Invalid Actor address length.')
                    break
                }
                case '3': {
                    if (address.length !== 86) throw Error('Invalid BLS address length.')
                    break
                }
                default: {
                    throw new Error('Invalid address protocol.')
                }
            }

            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    static getTxExplorerUrl(txHash, network) {
        return network === 'mainnet' ? `https://filfox.info/en/message/${txHash}`
            : `https://calibration.filscan.io/#/tipset/message-detail?cid=${txHash}`
    }
}

export default FIL