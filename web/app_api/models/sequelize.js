const Sequelize = require('sequelize')
const ProtocolContractModel = require('./protocolContract')
const EndpointModel = require('./endpoint')
const LoanAssetModel = require('./loanAsset')
const AssetLogoModel = require('./assetLogo')
const LoanEventModel = require('./loanEvent')
const LoanModel = require('./loan')
const ERC20CollateralLockModel = require('./ERC20CollateralLock')
const FILLoanModel = require('./filLoan')
const FILPaybackModel = require('./filPayback')
const SystemSettingsModel = require('./systemSettings')
const EmailNotificationModel = require('./emailNotification')
const LogTopicModel = require('./logTopic')

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

const ProtocolContract = ProtocolContractModel(sequelize, Sequelize)
const Endpoint = EndpointModel(sequelize, Sequelize)
const LoanAsset = LoanAssetModel(sequelize, Sequelize)
const AssetLogo = AssetLogoModel(sequelize, Sequelize)
const LoanEvent = LoanEventModel(sequelize, Sequelize)
const Loan = LoanModel(sequelize, Sequelize)
const ERC20CollateralLock = ERC20CollateralLockModel(sequelize, Sequelize)
const FILLoan = FILLoanModel(sequelize, Sequelize)
const FILPayback = FILPaybackModel(sequelize, Sequelize)
const SystemSettings = SystemSettingsModel(sequelize, Sequelize)
const EmailNotification = EmailNotificationModel(sequelize, Sequelize)
const LogTopic = LogTopicModel(sequelize, Sequelize)

sequelize
    .query('SET FOREIGN_KEY_CHECKS = 0', { raw: true })
    .then(() => {
        sequelize.sync({ force: false })
            .then(() => {
                console.log('Database & tables created')
            })
    })

module.exports = {
    ProtocolContract,
    Endpoint,
    LoanAsset,
    AssetLogo,   
    LoanEvent,
    Loan,
    ERC20CollateralLock,
    FILLoan,
    FILPayback,
    SystemSettings,
    EmailNotification,
    LogTopic,
    sequelize,
}