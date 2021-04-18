module.exports = (sequelize, DataTypes) => {
    return sequelize.define('loan', {
        contractLoanId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        borrower: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lenderAuto: {
            type: DataTypes.STRING,
            allowNull: true
        },
        aCoinLenderAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        secretHashA1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        secretHashB1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        secretHashAutoB1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        secretA1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        secretB1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        secretAutoB1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        loanExpiration: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        acceptExpiration: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        principal: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        interest: {
            type: DataTypes.STRING,
            allowNull: true
        },
        tokenContractAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tokenName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tokenSymbol: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
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
        loansContractAddress: {
            type: DataTypes.STRING,
            allowNull: true
        }
    })
}