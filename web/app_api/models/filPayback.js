module.exports = (sequelize, DataTypes) => {
    return sequelize.define('filPayback', {
        paymentChannelId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentChannelAddress: {
            type: DataTypes.STRING,
            allowNull: true
        },
        filLender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        filBorrower: {
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
            allowNull: true
        },
        txHash: {
            type: DataTypes.STRING,
            allowNull: true
        },
        secretHashB1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        secretB1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        signedVoucher: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        network: {
            type: DataTypes.STRING,
            allowNull: false
        },
        settlingAtHeight: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        settlingAtEstTimestamp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        collateralLockId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        collateralLockContractId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        collateralLockContractAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        collateralLockNetworkId: {
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