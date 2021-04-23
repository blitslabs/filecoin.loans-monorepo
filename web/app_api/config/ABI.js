module.exports.ABI = {
    ERC20Loans: {
        abi: [
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_blake2b",
                        "type": "address"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "borrower",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes",
                        "name": "filBorrower",
                        "type": "bytes"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes32",
                        "name": "secretHashA1",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes32",
                        "name": "paymentChannelId",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "collateralAmount",
                        "type": "uint256"
                    }
                ],
                "name": "AcceptOffer",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes",
                        "name": "secretB1",
                        "type": "bytes"
                    }
                ],
                "name": "AcceptRepayment",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "contractAddress",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "minLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "maxLoanAmount",
                        "type": "uint256"
                    }
                ],
                "name": "AddAssetType",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "AddAuthorization",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes",
                        "name": "secretB1",
                        "type": "bytes"
                    }
                ],
                "name": "CancelLoan",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "lender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "principal",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    }
                ],
                "name": "CreateLoanOffer",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [],
                "name": "DisableContract",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [],
                "name": "EnableContract",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "contractAddress",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes32",
                        "name": "parameter",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "data",
                        "type": "uint256"
                    }
                ],
                "name": "ModifyAssetTypeParams",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "borrower",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    }
                ],
                "name": "Payback",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "borrower",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    }
                ],
                "name": "RefundPayback",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "RemoveAuthorization",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "contractAddress",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "bool",
                        "name": "value",
                        "type": "bool"
                    }
                ],
                "name": "ToggleAssetTypeState",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "borrower",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes",
                        "name": "secretA1",
                        "type": "bytes"
                    }
                ],
                "name": "Withdraw",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "acceptExpirationPeriod",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_secretB1",
                        "type": "bytes"
                    }
                ],
                "name": "acceptRepayment",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address payable",
                        "name": "_borrower",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_filBorrower",
                        "type": "bytes"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "_secretHashA1",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "_paymentChannelId",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_collateralAmount",
                        "type": "uint256"
                    }
                ],
                "name": "acceptRequest",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_contractAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_minLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_maxLoanAmount",
                        "type": "uint256"
                    }
                ],
                "name": "addAssetType",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "addAuthorization",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "assetTypes",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "contractAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "enabled",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "authorizedAccounts",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_secretB1",
                        "type": "bytes"
                    }
                ],
                "name": "cancelLoan",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "contractEnabled",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "bytes32",
                        "name": "_secretHashB1",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_filLender",
                        "type": "bytes"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_principal",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_interest",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "_contractAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_loanExpirationPeriod",
                        "type": "uint256"
                    }
                ],
                "name": "createLoanOffer",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "disableContract",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "enableContract",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    }
                ],
                "name": "fetchLoan",
                "outputs": [
                    {
                        "internalType": "address[2]",
                        "name": "actors",
                        "type": "address[2]"
                    },
                    {
                        "internalType": "bytes[2]",
                        "name": "filAddresses",
                        "type": "bytes[2]"
                    },
                    {
                        "internalType": "bytes32[2]",
                        "name": "secretHashes",
                        "type": "bytes32[2]"
                    },
                    {
                        "internalType": "bytes[2]",
                        "name": "secrets",
                        "type": "bytes[2]"
                    },
                    {
                        "internalType": "uint256[3]",
                        "name": "expirations",
                        "type": "uint256[3]"
                    },
                    {
                        "internalType": "uint256[3]",
                        "name": "details",
                        "type": "uint256[3]"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "paymentChannelId",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "enum ERC20Loans.State",
                        "name": "state",
                        "type": "uint8"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_account",
                        "type": "address"
                    }
                ],
                "name": "getAccountLoans",
                "outputs": [
                    {
                        "internalType": "uint256[]",
                        "name": "",
                        "type": "uint256[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_contractAddress",
                        "type": "address"
                    }
                ],
                "name": "getAssetType",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "minLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "enabled",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "loanIdCounter",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_data",
                        "type": "uint256"
                    }
                ],
                "name": "modifyAcceptExpirationPeriod",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_contractAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "_parameter",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_data",
                        "type": "uint256"
                    }
                ],
                "name": "modifyAssetTypeParams",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    }
                ],
                "name": "payback",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    }
                ],
                "name": "refundPayback",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "removeAuthorization",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_contractAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bool",
                        "name": "_value",
                        "type": "bool"
                    }
                ],
                "name": "toggleAssetTypeState",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "userLoans",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "userLoansCount",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_secretA1",
                        "type": "bytes"
                    }
                ],
                "name": "withdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
    },
    ERC20CollateralLock: {
        abi: [
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_blake2b",
                        "type": "address"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "lender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes",
                        "name": "filLender",
                        "type": "bytes"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes32",
                        "name": "secretHashB1",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes32",
                        "name": "paymentChannelId",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "principalAmount",
                        "type": "uint256"
                    }
                ],
                "name": "AcceptOffer",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "contractAddress",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "minLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "maxLoanAmount",
                        "type": "uint256"
                    }
                ],
                "name": "AddAssetType",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "AddAuthorization",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "borrower",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "collateralAmount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes",
                        "name": "secretA1",
                        "type": "bytes"
                    }
                ],
                "name": "CancelBorrowRequest",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "borrower",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "collateralAmount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    }
                ],
                "name": "CreateBorrowRequest",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [],
                "name": "DisableContract",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [],
                "name": "EnableContract",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "contractAddress",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes32",
                        "name": "parameter",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "data",
                        "type": "uint256"
                    }
                ],
                "name": "ModifyAssetTypeParams",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "RemoveAuthorization",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "lender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    }
                ],
                "name": "SeizeCollateral",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "contractAddress",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "bool",
                        "name": "value",
                        "type": "bool"
                    }
                ],
                "name": "ToggleAssetTypeState",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "borrower",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "collateralAmount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    }
                ],
                "name": "UnlockCollateral",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "loanId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "borrower",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    }
                ],
                "name": "UnlockRefundableCollateral",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address payable",
                        "name": "_lender",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_filLender",
                        "type": "bytes"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "_secretHashB1",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "_paymentChannelId",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_principalAmount",
                        "type": "uint256"
                    }
                ],
                "name": "acceptOffer",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_contractAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_minLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_maxLoanAmount",
                        "type": "uint256"
                    }
                ],
                "name": "addAssetType",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "addAuthorization",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "assetTypes",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "contractAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "enabled",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "authorizedAccounts",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_secretA1",
                        "type": "bytes"
                    }
                ],
                "name": "cancelBorrowRequest",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "contractEnabled",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "bytes32",
                        "name": "_secretHashA1",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_filBorrower",
                        "type": "bytes"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_collateralAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "_contractAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_principalAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_interestRate",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_loanExpirationPeriod",
                        "type": "uint256"
                    }
                ],
                "name": "createBorrowRequest",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "disableContract",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "enableContract",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    }
                ],
                "name": "fetchLoan",
                "outputs": [
                    {
                        "internalType": "address[2]",
                        "name": "actors",
                        "type": "address[2]"
                    },
                    {
                        "internalType": "bytes[2]",
                        "name": "filAddresses",
                        "type": "bytes[2]"
                    },
                    {
                        "internalType": "bytes32[2]",
                        "name": "secretHashes",
                        "type": "bytes32[2]"
                    },
                    {
                        "internalType": "bytes[2]",
                        "name": "secrets",
                        "type": "bytes[2]"
                    },
                    {
                        "internalType": "uint256[3]",
                        "name": "expirations",
                        "type": "uint256[3]"
                    },
                    {
                        "internalType": "uint256[5]",
                        "name": "details",
                        "type": "uint256[5]"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "paymentChannelId",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "enum ERC20CollateralLock.State",
                        "name": "state",
                        "type": "uint8"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_account",
                        "type": "address"
                    }
                ],
                "name": "getAccountLoans",
                "outputs": [
                    {
                        "internalType": "uint256[]",
                        "name": "",
                        "type": "uint256[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_contractAddress",
                        "type": "address"
                    }
                ],
                "name": "getAssetType",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "minLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxLoanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "enabled",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "loanIdCounter",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_contractAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "_parameter",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_data",
                        "type": "uint256"
                    }
                ],
                "name": "modifyAssetTypeParams",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "removeAuthorization",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_secretA1",
                        "type": "bytes"
                    }
                ],
                "name": "seizeCollateral",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_contractAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bool",
                        "name": "_value",
                        "type": "bool"
                    }
                ],
                "name": "toggleAssetTypeState",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_loanId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_secretB1",
                        "type": "bytes"
                    }
                ],
                "name": "unlockCollateral",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "userLoans",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "userLoansCount",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    },
    ERC20: {
        abi: [
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "symbol",
                        "type": "string"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Approval",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Transfer",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "name",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "symbol",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [
                    {
                        "internalType": "uint8",
                        "name": "",
                        "type": "uint8"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalSupply",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "balanceOf",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "recipient",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "transfer",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "spender",
                        "type": "address"
                    }
                ],
                "name": "allowance",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "approve",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "recipient",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "transferFrom",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "addedValue",
                        "type": "uint256"
                    }
                ],
                "name": "increaseAllowance",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "subtractedValue",
                        "type": "uint256"
                    }
                ],
                "name": "decreaseAllowance",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
    },
    AggregatorTest: {
        abi: [
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "int256",
                        "name": "current",
                        "type": "int256"
                    },
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "roundId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "name": "AnswerUpdated",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "roundId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "startedBy",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "startedAt",
                        "type": "uint256"
                    }
                ],
                "name": "NewRound",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "newOwner",
                        "type": "address"
                    }
                ],
                "name": "OwnershipTransferred",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "newOwner",
                        "type": "address"
                    }
                ],
                "name": "transferOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "latestAnswer",
                "outputs": [
                    {
                        "internalType": "int256",
                        "name": "",
                        "type": "int256"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [],
                "name": "latestTimestamp",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [],
                "name": "latestRound",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "roundId",
                        "type": "uint256"
                    }
                ],
                "name": "getAnswer",
                "outputs": [
                    {
                        "internalType": "int256",
                        "name": "",
                        "type": "int256"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "roundId",
                        "type": "uint256"
                    }
                ],
                "name": "getTimestamp",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [
                    {
                        "internalType": "int256",
                        "name": "price",
                        "type": "int256"
                    }
                ],
                "name": "updateAnswer",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
    }
}