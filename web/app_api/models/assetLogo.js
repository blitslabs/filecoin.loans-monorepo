module.exports = (sequelize, DataTypes) => {
    return sequelize.define('assetLogo', {
        symbol: {
            type: DataTypes.STRING,
            allowNull: false
        },
        blockchain: {
            type: DataTypes.STRING,
            allowNull: false
        },
        imagePath: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    })
}