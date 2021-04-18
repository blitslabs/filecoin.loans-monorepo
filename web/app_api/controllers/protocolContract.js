const { sendJSONresponse } = require('../utils')
const {
    ProtocolContract
} = require('../models/sequelize')

module.exports.getProtocolContracts = async (req, res) => {

    const protocolContracts = await ProtocolContract.findAll({ 
        attributes: ['id', 'address', 'blockchain', 'name', 'networkId', 'status'],
        raw: true
     })
     
    const payload = {}

    for (let c of protocolContracts) {
        payload[c.networkId] = {
            ...payload[c.networkId],
            [c.name]: { ...c }
        }
    }

    sendJSONresponse(res, 200, { status: 'OK', payload: payload })
    return
}