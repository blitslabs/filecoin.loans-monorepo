const { sendJSONresponse } = require('../utils')
const {
    LoanEvent, Loan, CollateralLock
} = require('../models/sequelize')

module.exports.getActivityHistory = async (req, res) => {

    const page = req.params.page ? parseInt(req.params.page) : 1
    const limit = 25
    let offset = 0

    const results = await LoanEvent.count()

    const pages = Math.ceil(results / limit)
    offset = limit * (page - 1)

    const activityHistory = await LoanEvent.findAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        raw: true,
    })

    sendJSONresponse(res, 200, { status: 'OK', payload: activityHistory, pages })
    return
}

