module.exports = (sequelize, DataTypes) => {
    return sequelize.define('protocolContract', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        blockchain: {
            type: DataTypes.STRING,
            allowNull: false
        },
        networkId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        version: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '0'
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'ACTIVE'
        }
    })
}