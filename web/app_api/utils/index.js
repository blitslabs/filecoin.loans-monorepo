const BigNumber = require('bignumber.js')

module.exports.sendJSONresponse = function (res, status, content) {
    res.status(status)
    res.json(content)
}

module.exports.pad = function (num, size) {
    let decimals = '1'
    while (decimals.length <= parseInt(size)) decimals = decimals + '0'
    return Number(BigNumber(num).multipliedBy(decimals).toString()).toLocaleString('fullwide', { useGrouping: false })
}
