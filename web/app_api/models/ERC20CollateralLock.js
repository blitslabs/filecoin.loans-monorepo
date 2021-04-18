module.exports = (sequelize, DataTypes) => {
    return sequelize.define('erc20CollateralLock', {
        contractLoanId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        paymentChannelId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        borrower: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        filBorrower: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        filLender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        secretHashA1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        secretHashB1: {
            type: DataTypes.STRING,
            allowNull: true
        },
        secretA1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        secretB1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        loanExpiration: {
            type: DataTypes.STRING,
            allowNull: true
        },
        loanExpirationPeriod: {
            type: DataTypes.STRING,
            allowNull: true
        },
        collateralAmount: {
            type: DataTypes.STRING,
            allowNull: true,
        },        
        principalAmount: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        interestRate: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lockPrice: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        liquidationPrice: {
            type: DataTypes.STRING,
            allowNull: true
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        blockchain: {
            type: DataTypes.STRING,
        },
        networkId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        collateralLockContractAddress: {
            type: DataTypes.STRING,
            allowNull: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true
        }
    })
}