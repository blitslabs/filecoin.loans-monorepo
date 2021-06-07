import Web3 from 'web3'
import blake2b from 'blake2b'
import ETH from '../ETH'
import cbor from 'ipld-dag-cbor'

export async function generateSecret(message, keys) {

    try {
        // Sign Message
        const signedMessage = await ETH.signMessage(message, keys)

        // Generate Secret
        let secret = Buffer.from(signedMessage?.signature)
        secret = blake2b(32).update(secret).digest('hex')

        // Generate Secret Hash
        let secretHash = Buffer.from(secret)
        secretHash = blake2b(32).update(secretHash).digest('hex')
        secretHash = `0x${secretHash}`

        return { status: 'OK', payload: { secret, secretHash } }

    } catch (e) {
        console.log(e)
        return { status: 'ERROR', message: 'Error signing message' }
    }
}

export function decodeVoucher(signedVoucher) {
    const cborSignedVoucher = Buffer.from(signedVoucher, 'base64')
    const sv = cbor.util.deserialize(cborSignedVoucher)   
    const secretHash = Buffer.from(sv[3]).toString('hex')
    const timeLockMax = sv[2]
    const amount = parseInt(Buffer.from(sv[7]).toString('hex'), 16)    
    return { secretHash, timeLockMax, amount }
}