module.exports = (sequelize, DataTypes) => {
    return sequelize.define('erc20Loan', {
        contractLoanId: {
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
            type: DataTypes.TEXT,
            allowNull: true
        },
        secretHashB1: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        secretA1: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        secretB1: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        loanExpiration: {
            type: DataTypes.STRING,
            allowNull: true
        },
        acceptExpiration: {
            type: DataTypes.STRING,
            allowNull: true
        },
        loanExpirationPeriod: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        principalAmount: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        interestAmount: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        collateralAmount: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentChannelId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        unlockCollateralMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        multisigLender: {
            type: DataTypes.STRING,
            allowNull: true
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true
        },
        blockchain: {
            type: DataTypes.STRING,
            allowNull: true
        },
        networkId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        erc20LoansContract: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    })
}