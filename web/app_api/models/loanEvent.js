module.exports = (sequelize, DataTypes) => {
    return sequelize.define('loanEvent', {
        txHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        event: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        loanId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        blockchain: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        networkId: {
            type: DataTypes.STRING,
            allowNull: true,
        },        
        contractAddress: {
            type: DataTypes.STRING,
            allowNull: true
        },
        loanType: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
}