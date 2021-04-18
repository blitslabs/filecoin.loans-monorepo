const ABI = {
  LOANS: {
    abi: [
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
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
            "name": "maxLoanAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "minLoanAmount",
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
            "internalType": "bytes32",
            "name": "secretB1",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "enum CrosschainLoansMoneyMarket.State",
            "name": "state",
            "type": "uint8"
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
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          }
        ],
        "name": "DisableAssetType",
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
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          }
        ],
        "name": "EnableAssetType",
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
            "internalType": "bytes32",
            "name": "secretHashA1",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "enum CrosschainLoansMoneyMarket.State",
            "name": "state",
            "type": "uint8"
          }
        ],
        "name": "LoanAssignedAndApproved",
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
          }
        ],
        "name": "LoanCreated",
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
            "internalType": "enum CrosschainLoansMoneyMarket.State",
            "name": "state",
            "type": "uint8"
          }
        ],
        "name": "LoanFunded",
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
            "internalType": "bytes32",
            "name": "secretA1",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "enum CrosschainLoansMoneyMarket.State",
            "name": "state",
            "type": "uint8"
          }
        ],
        "name": "LoanPrincipalWithdrawn",
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
            "internalType": "enum CrosschainLoansMoneyMarket.State",
            "name": "state",
            "type": "uint8"
          }
        ],
        "name": "LoanRepaymentAccepted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
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
        "name": "ModifyAssetTypeLoanParameters",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
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
        "name": "ModifyLoanParameters",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "_referral",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "_referrer",
            "type": "address"
          }
        ],
        "name": "NewReferral",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "_referral",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "_referrer",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "_token",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "PayReferrer",
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
            "internalType": "enum CrosschainLoansMoneyMarket.State",
            "name": "state",
            "type": "uint8"
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
            "internalType": "enum CrosschainLoansMoneyMarket.State",
            "name": "state",
            "type": "uint8"
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
        "constant": true,
        "inputs": [],
        "name": "acceptExpirationPeriod",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_loanId",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "_secretB1",
            "type": "bytes32"
          }
        ],
        "name": "acceptRepayment",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "_contractAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_maxLoanAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_minLoanAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_baseRatePerYear",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_multiplierPerYear",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_referralFees",
            "type": "uint256"
          }
        ],
        "name": "addAssetType",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "addAuthorization",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "_token",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_marketAddress",
            "type": "address"
          }
        ],
        "name": "addMoneyMarket",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
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
            "internalType": "uint256",
            "name": "maxLoanAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minLoanAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "supply",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "demand",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "baseRatePerPeriod",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "multiplierPerPeriod",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "enabled",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "referralFees",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
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
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_loanId",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "_secretB1",
            "type": "bytes32"
          }
        ],
        "name": "cancelLoanBeforePrincipalWithdraw",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "contractEnabled",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "_secretHashB1",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "_principal",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_contractAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_aCoinLenderAddress",
            "type": "address"
          }
        ],
        "name": "createLoan",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "loanId",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "_secretHashB1",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "_principal",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_contractAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_aCoinLenderAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_referrer",
            "type": "address"
          }
        ],
        "name": "createLoan",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "loanId",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "_contractAddress",
            "type": "address"
          }
        ],
        "name": "disableAssetType",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "disableContract",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "_contractAddress",
            "type": "address"
          }
        ],
        "name": "enableAssetType",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "enableContract",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
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
            "internalType": "address payable[2]",
            "name": "actors",
            "type": "address[2]"
          },
          {
            "internalType": "bytes32[2]",
            "name": "secretHashes",
            "type": "bytes32[2]"
          },
          {
            "internalType": "bytes32[2]",
            "name": "secrets",
            "type": "bytes32[2]"
          },
          {
            "internalType": "uint256[2]",
            "name": "expirations",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[2]",
            "name": "details",
            "type": "uint256[2]"
          },
          {
            "internalType": "address",
            "name": "aCoinLenderAddress",
            "type": "address"
          },
          {
            "internalType": "enum CrosschainLoansMoneyMarket.State",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
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
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "internalType": "address",
            "name": "_contractAddress",
            "type": "address"
          }
        ],
        "name": "getAssetInterestRate",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
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
            "name": "maxLoanAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minLoanAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "supply",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "demand",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "baseRatePerPeriod",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "multiplierPerPeriod",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "interestRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "enabled",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "referralFees",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "internalType": "address",
            "name": "_account",
            "type": "address"
          }
        ],
        "name": "getReferrer",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "loanExpirationPeriod",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "loanIdCounter",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
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
        "name": "modifyAssetTypeLoanParameters",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
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
        "name": "modifyLoanParameters",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "_token",
            "type": "address"
          },
          {
            "internalType": "contract CToken",
            "name": "_market",
            "type": "address"
          }
        ],
        "name": "modifyMoneyMarket",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "moneyMarkets",
        "outputs": [
          {
            "internalType": "bool",
            "name": "isEnabled",
            "type": "bool"
          },
          {
            "internalType": "contract CToken",
            "name": "market",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_loanId",
            "type": "uint256"
          }
        ],
        "name": "payback",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
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
        "name": "referrals",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "referrers",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_loanId",
            "type": "uint256"
          }
        ],
        "name": "refundPayback",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "removeAuthorization",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "_referrer",
            "type": "address"
          }
        ],
        "name": "saveReferrer",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "secondsPerYear",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
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
            "internalType": "bytes32",
            "name": "_secretHashA1",
            "type": "bytes32"
          }
        ],
        "name": "setBorrowerAndApprove",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "_token",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "_status",
            "type": "bool"
          }
        ],
        "name": "toggleMoneyMarket",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "totalReferrals",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
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
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
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
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_supply",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_demand",
            "type": "uint256"
          }
        ],
        "name": "utilizationRate",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_loanId",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "_secretA1",
            "type": "bytes32"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  ERC20_COLLATERAL_LOCK: {
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
            "internalType": "uint256[2]",
            "name": "expirations",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[4]",
            "name": "details",
            "type": "uint256[4]"
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
    ],
  },
  ERC20: {
    abi: [
      {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "delegate",
            "type": "address"
          },
          {
            "name": "numTokens",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "buyer",
            "type": "address"
          },
          {
            "name": "numTokens",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "name": "",
            "type": "uint8"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "tokenOwner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "receiver",
            "type": "address"
          },
          {
            "name": "numTokens",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "delegate",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "_decimals",
            "type": "uint8"
          },
          {
            "name": "_symbol",
            "type": "string"
          },
          {
            "name": "_name",
            "type": "string"
          },
          {
            "name": "_total_supply",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "tokenOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "tokens",
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
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "tokens",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      }
    ]
  }
}

export default ABI