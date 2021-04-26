const blake2b = require('blake2b')
const secp256k1 = require('secp256k1')
const Web3 = require('web3')
const web3 = new Web3()

const main = async () => {
    const message = {
        loanId: '123',
        erc20CollateralLock: 'address',
        paymentChannelId: 'paycha1',
        pamynetChannelAddress: 'address',
        ethLender: '0xethLender',
        filLender: 'filLender',
        secretHashB1: 'secretHashB1',
        principalAmount: 'principalAmount',
        network: 'testnet'
    }

    const privateKeyBase64 = 'YzPHu1i6raDvD4VF1+XjjMHxyuDyd6JvrPK7R1IDVcQ='
    const privateKey = Buffer.from(privateKeyBase64, 'base64')




    // Sign Message Digest
    const signatureResult = signMessage(message, privateKey)
    const signatureHex = web3.utils.toHex(signatureResult)
    console.log(signatureHex)

    const recoveredSignature = Buffer.from(signatureHex.replace('0x', ''), 'hex')
    
    // Verify signature
    console.log(verifySignature(recoveredSignature, message))
}

main()

function getDigest(message) {
    const messageBuffer = Buffer.from(JSON.stringify(message))
    return blake2b(32).update(messageBuffer).digest()
}

function signMessage(message, privateKey) {
    // Get Mesage digest
    const messageDigest = getDigest(message)
    // Sign message
    const signature = secp256k1.ecdsaSign(messageDigest, privateKey)
    return Buffer.concat([
        Buffer.from(signature.signature),
        Buffer.from([signature.recid]),
    ]);
}

function verifySignature(signature, message) {
    // Get Message Digest
    const messageDigest = getDigest(message)

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