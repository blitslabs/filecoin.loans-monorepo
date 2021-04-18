const { sendJSONresponse } = require('../utils')
const {
    AssetLogo
} = require('../models/sequelize')
const fs = require('fs')

module.exports.getAssetLogo = async (req, res) => {
    const { symbol, blockchain } = req.params

    if(!symbol || !blockchain) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing required parameters'})
        return
    }

    const asset = await AssetLogo.findOne({
        where: {
            symbol,
            blockchain
        }
    })

    if(!asset) {
        try {
            const imageData = await fs.readFileSync('./uploads/logos/ERC20.png')
            res.writeHead(200, { 'Content-Type': 'image/png'})
            res.end(imageData, 'binary')
            return
        } catch(e) {
            sendJSONresponse(res, 422, { status: 'ERROR', message: 'Error reading image'})
            return
        }
    }

    try {
        const imageData = await fs.readFileSync(asset.imagePath)
        res.writeHead(200, { 'Content-Type': 'image/png'})
        res.end(imageData, 'binary')
        return
    } catch(e) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Error reading image'})
    }
}