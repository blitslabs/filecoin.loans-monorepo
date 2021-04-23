module.exports = (sequelize, DataTypes) => {
    return sequelize.define('filCollateral', {
        paymentChannelId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentChannelAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        filBorrower: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        filLender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        amount: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        signature: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        txHash: {
            type: DataTypes.STRING,
            allowNull: true
        },
        secretHashA1: {
            type: DataTypes.STRING,
            allowNull: true
        },
        secretA1: {
            type: DataTypes.STRING,
            allowNull: true
        },
        signedVoucher: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        network: {
            type: DataTypes.STRING,
            allowNull: false
        },
        settlingAtHeight: {
            type: DataTypes.STRING,
            allowNull: true
        },
        settlingAtEstTimestamp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        erc20LoanId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        erc20LoanContractId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        erc20LoansContract: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        erc20LoansNetworkId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '0'
        }
    })
}