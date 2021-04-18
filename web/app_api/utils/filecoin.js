const secp256k1 = require('secp256k1')
const blake2b = require('blake2b')

export function getDigest(message) {
    const messageBuffer = Buffer.from(message)
    return blake2b(32).update(messageBuffer).digest()
}

export function signMessage(message, privateKeyBase64) {
    const privateKey = Buffer.from(privateKeyBase64, 'base64')
    // Get Mesage digest
    const messageDigest = getDigest(message)
    // Sign message
    const signature = secp256k1.ecdsaSign(messageDigest, privateKey)
    const signatureResult = Buffer.concat([
        Buffer.from(signature.signature),
        Buffer.from([signature.recid]),
    ])
    return Buffer.from(signatureResult).toString('hex')
}

export function verifySignature(signature, message) {
    signature = Buffer.from(signature, 'hex')

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