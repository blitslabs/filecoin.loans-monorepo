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

    const payload = {}

    for (let a of activityHistory) {
        if (a.event === 'LockCollateral' || a.event === 'UnlockAndClose' || a.event === 'SeizeCollateral') {
            const collateralLock = await CollateralLock.findOne({
                where: {
                    contractLoanId: a.loanId
                },
                raw: true
            })

            payload[a.id] = {
                ...a,
                details: {
                    ...collateralLock
                }
            }
        } else {
            const loan =await Loan.findOne({
                where: {
                    contractLoanId: a.loanId
                },
                raw: true
            })

            payload[a.id] = {
                ...a,
                details: {
                    ...loan
                }
            }
        }
    }

    sendJSONresponse(res, 200, { status: 'OK', payload: payload, pages })
    return
}

