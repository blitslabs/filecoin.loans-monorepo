module.exports = (sequelize, DataTypes) => {
    return sequelize.define('emailNotification', {
        account: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },        
    })
}