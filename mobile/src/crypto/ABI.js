const ABI = {
  LOANS: {
    abi: [
      {
        "inputs": [],
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
            "internalType": "enum BlitsLoans.State",
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
            "internalType": "enum BlitsLoans.State",
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
            "internalType": "enum BlitsLoans.State",
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
            "internalType": "enum BlitsLoans.State",
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
            "internalType": "enum BlitsLoans.State",
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
            "internalType": "enum BlitsLoans.State",
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
            "internalType": "enum BlitsLoans.State",
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
            "internalType": "contract ERC20",
            "name": "token",
            "type": "address"
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
        "inputs": [],
        "name": "loanExpirationPeriod",
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
        "inputs": [],
        "name": "secondsPerYear",
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
        "stateMutability": "pure",
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
        "name": "getAssetInterestRate",
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
            "name": "_lenderAuto",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "_secretHashB1",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "_secretHashAutoB1",
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
            "internalType": "bytes",
            "name": "_aCoinLenderAddress",
            "type": "bytes"
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
            "internalType": "bytes32",
            "name": "_secretHashA1",
            "type": "bytes32"
          }
        ],
        "name": "setBorrowerAndApprove",
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
            "internalType": "bytes32",
            "name": "_secretA1",
            "type": "bytes32"
          }
        ],
        "name": "withdraw",
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
            "internalType": "bytes32",
            "name": "_secretB1",
            "type": "bytes32"
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
            "internalType": "bytes32",
            "name": "_secretB1",
            "type": "bytes32"
          }
        ],
        "name": "cancelLoanBeforePrincipalWithdraw",
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
        "name": "fetchLoan",
        "outputs": [
          {
            "internalType": "address[3]",
            "name": "actors",
            "type": "address[3]"
          },
          {
            "internalType": "bytes32[3]",
            "name": "secretHashes",
            "type": "bytes32[3]"
          },
          {
            "internalType": "bytes32[3]",
            "name": "secrets",
            "type": "bytes32[3]"
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
            "internalType": "bytes",
            "name": "aCoinLenderAddress",
            "type": "bytes"
          },
          {
            "internalType": "enum BlitsLoans.State",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
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
        "name": "modifyAssetTypeLoanParameters",
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
          }
        ],
        "name": "disableAssetType",
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
          }
        ],
        "name": "enableAssetType",
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
          }
        ],
        "name": "addAssetType",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  COLLATERAL_LOCK: {
    abi: [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
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
            "internalType": "address",
            "name": "lender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "collateral",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "collateralValue",
            "type": "uint256"
          }
        ],
        "name": "LockCollateral",
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
            "name": "collateral",
            "type": "uint256"
          }
        ],
        "name": "UnlockAndClose",
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
          }
        ],
        "name": "UnlockRefundableCollateral",
        "type": "event"
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
        "name": "authorizedAccounts",
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
        "name": "collateralizationRatio",
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
        "inputs": [],
        "name": "loanExpirationPeriod",
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
        "name": "loanIdCounter",
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
        "inputs": [],
        "name": "seizureExpirationPeriod",
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
            "internalType": "address payable",
            "name": "_lender",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "_secretHashA1",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "_secretHashB1",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "_bCoinBorrowerAddress",
            "type": "bytes"
          }
        ],
        "name": "lockCollateral",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function",
        "payable": true
      },
      {
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
        "name": "unlockCollateralAndCloseLoan",
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
            "internalType": "bytes32",
            "name": "_secretA1",
            "type": "bytes32"
          }
        ],
        "name": "seizeCollateral",
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
        "name": "unlockRefundableCollateral",
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
            "internalType": "uint256[3]",
            "name": "expirations",
            "type": "uint256[3]"
          },
          {
            "internalType": "uint256[4]",
            "name": "details",
            "type": "uint256[4]"
          },
          {
            "internalType": "bytes",
            "name": "bCoinBorrowerAddress",
            "type": "bytes"
          },
          {
            "internalType": "enum CollateralLock.State",
            "name": "state",
            "type": "uint8"
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
        "type": "function",
        "constant": true
      },
      {
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
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
  },
  
}

export default ABI