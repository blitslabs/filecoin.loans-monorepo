module.exports = (sequelize, DataTypes) => {
    return sequelize.define('filLoan', {        
        paymentChannelId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentChannelAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        filLender: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        filBorrower: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ethLender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ethBorrower: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lockedAmount: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        amountToSend: {
            type: DataTypes.STRING,
            allowNull: true
        },        
        network: {
            type: DataTypes.STRING,
            allowNull: false
        },
        secretHashB1: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        principalAmount: {
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
            allowNull: false
        }
    })
}