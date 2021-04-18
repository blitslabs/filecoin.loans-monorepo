const { sendJSONresponse } = require('../utils')
const {
    LoanAsset
} = require('../models/sequelize')

module.exports.getLoanAssets = async (req, res) => {
    const { networkId } = req.params

    if(!networkId) {
        sendJSONresponse(res, 404, { status: 'ERROR', message: 'Missing Network ID'})
        return
    }

    let loanAssets
    if (networkId !== 'ALL') {
        loanAssets = await LoanAsset.findAll({
            where: {
                networkId,
                status: 'ACTIVE'
            },
            attributes: ['id', 'name', 'symbol', 'contractAddress', 'blockchain', 'networkId', 'status'],
            raw: true
        })
    } else {
        loanAssets = await LoanAsset.findAll({
            where: {
                status: 'ACTIVE'
            },
            attributes: ['id', 'name', 'symbol', 'contractAddress', 'blockchain', 'networkId', 'status'],
            raw: true
        })
    }

    const payload = {}

    for (let a of loanAssets) {
        payload[a.contractAddress] = {
            ...a
        }
    }

    sendJSONresponse(res, 200, { status: 'OK', payload: payload })
    return
}

