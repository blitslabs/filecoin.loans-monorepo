module.exports = (sequelize, DataTypes) => {
    return sequelize.define('loanAsset', {
        name: {
            type: DataTypes.STRING,
            allowNull: true,            
        },
        symbol: {
            type: DataTypes.STRING,
            allowNull: false,
        },        
        contractAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        decimals: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        blockchain: {
            type: DataTypes.STRING,
            allowNull: false
        },
        networkId: {
            type: DataTypes.STRING,
            allowNull: true,
        },        
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'ACTIVE'
        }
    })
}