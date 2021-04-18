module.exports = (sequelize, DataTypes) => {
    return sequelize.define('endpoint', {
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        endpoint: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        endpointType: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'HTTP'
        },
        blockchain: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'ETH'
        },
        networkId: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '1'
        },
        shard: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '0'
        },
        authToken: {
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