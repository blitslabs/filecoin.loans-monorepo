module.exports = (sequelize, DataTypes) => {
    return sequelize.define('logTopic', {
        topic: {
            type: DataTypes.STRING,
            allowNull: true,
        },        
        operation: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contractName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        }        
    })
}