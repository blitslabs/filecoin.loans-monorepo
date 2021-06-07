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
  HORIZON_ERC20_ETH_MANAGER: {
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_wallet",
            "type": "address"
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
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
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "Locked",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "ethToken",
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
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "Unlocked",
        "type": "event"
      },
      {
        "constant": true,
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "usedEvents_",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "wallet",
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
            "internalType": "address",
            "name": "ethTokenAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "lockToken",
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
            "name": "ethTokenAddr",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "userAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "lockTokenFor",
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
            "name": "ethTokenAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "unlockToken",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  HORIZON_BUSD_ETH_MANAGER: {
    abi: [
      {
        "inputs": [
          {
            "internalType": "contract IBUSD",
            "name": "busd",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_wallet",
            "type": "address"
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
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
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "Locked",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "ethToken",
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
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "Unlocked",
        "type": "event"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "busd_",
        "outputs": [
          {
            "internalType": "contract IBUSD",
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
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "usedEvents_",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "wallet",
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
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "lockToken",
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
            "name": "userAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "lockTokenFor",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "unlockToken",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  HORIZON_LINK_ETH_MANAGER: {
    abi: [
      {
        "inputs": [
          {
            "internalType": "contract ILINK",
            "name": "link",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_wallet",
            "type": "address"
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
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
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "Locked",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "ethToken",
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
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "Unlocked",
        "type": "event"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "link_",
        "outputs": [
          {
            "internalType": "contract ILINK",
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
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "usedEvents_",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "wallet",
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
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "lockToken",
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
            "name": "userAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "lockTokenFor",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "unlockToken",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  HORIZON_ERC20_ONE_MANAGER: {
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_wallet",
            "type": "address"
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
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
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "Burned",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "oneToken",
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
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "Minted",
        "type": "event"
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
        "name": "mappings",
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
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "usedEvents_",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "wallet",
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
            "internalType": "address",
            "name": "tokenManager",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "ethTokenAddr",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          },
          {
            "internalType": "uint8",
            "name": "decimals",
            "type": "uint8"
          }
        ],
        "name": "addToken",
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
            "name": "tokenManager",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "ethTokenAddr",
            "type": "address"
          }
        ],
        "name": "removeToken",
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
            "name": "oneToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "burnToken",
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
            "name": "oneToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "mintToken",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  HORIZON_BUSD_ONE_MANAGER: {
    abi: [
      {
        "inputs": [
          {
            "internalType": "contract IBUSD",
            "name": "_hBUSD",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_wallet",
            "type": "address"
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
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
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "Burned",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "oneToken",
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
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "Minted",
        "type": "event"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "hBUSD",
        "outputs": [
          {
            "internalType": "contract IBUSD",
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
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "usedEvents_",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "wallet",
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
            "internalType": "address",
            "name": "tokenManager",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "eBUSD",
            "type": "address"
          }
        ],
        "name": "register",
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
            "name": "tokenManager",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "eBUSD",
            "type": "address"
          }
        ],
        "name": "deregister",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "burnToken",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "mintToken",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  HORIZON_LINK_ONE_MANAGER: {
    abi: [
      {
        "inputs": [
          {
            "internalType": "contract ILINK",
            "name": "_hLINK",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_wallet",
            "type": "address"
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
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
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "Burned",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "oneToken",
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
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "Minted",
        "type": "event"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "hLINK",
        "outputs": [
          {
            "internalType": "contract ILINK",
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
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "usedEvents_",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "wallet",
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
            "internalType": "address",
            "name": "tokenManager",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "eLINK",
            "type": "address"
          }
        ],
        "name": "register",
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
            "name": "tokenManager",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "eLINK",
            "type": "address"
          }
        ],
        "name": "deregister",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "burnToken",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "receiptId",
            "type": "bytes32"
          }
        ],
        "name": "mintToken",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  UNISWAP_ROUTER: {
    abi: [
      {
        "inputs": [],
        "name": "WETH",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "tokenA",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenB",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amountADesired",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountBDesired",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountAMin",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountBMin",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "addLiquidity",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountA",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountB",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liquidity",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amountTokenDesired",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountTokenMin",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountETHMin",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "addLiquidityETH",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountToken",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountETH",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liquidity",
            "type": "uint256"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "factory",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserveIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserveOut",
            "type": "uint256"
          }
        ],
        "name": "getAmountIn",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserveIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserveOut",
            "type": "uint256"
          }
        ],
        "name": "getAmountOut",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          }
        ],
        "name": "getAmountsIn",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          }
        ],
        "name": "getAmountsOut",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountA",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserveA",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserveB",
            "type": "uint256"
          }
        ],
        "name": "quote",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountB",
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
            "name": "tokenA",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenB",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "liquidity",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountAMin",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountBMin",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "removeLiquidity",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountA",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountB",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "liquidity",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountTokenMin",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountETHMin",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "removeLiquidityETH",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountToken",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountETH",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "liquidity",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountTokenMin",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountETHMin",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "approveMax",
            "type": "bool"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "name": "removeLiquidityETHWithPermit",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountToken",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountETH",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "tokenA",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenB",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "liquidity",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountAMin",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountBMin",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "approveMax",
            "type": "bool"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "name": "removeLiquidityWithPermit",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountA",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountB",
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
            "name": "amountOut",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapETHForExactTokens",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountOutMin",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapExactETHForTokens",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountOutMin",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapExactTokensForETH",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountOutMin",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapExactTokensForTokens",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountInMax",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapTokensForExactETH",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountInMax",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapTokensForExactTokens",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  UNISWAP_FACTORY: {
    abi: [{ "inputs": [{ "internalType": "address", "name": "_feeToSetter", "type": "address" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token0", "type": "address" }, { "indexed": true, "internalType": "address", "name": "token1", "type": "address" }, { "indexed": false, "internalType": "address", "name": "pair", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }], "name": "PairCreated", "type": "event" }, { "constant": true, "inputs": [], "name": "INIT_CODE_PAIR_HASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "allPairs", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "allPairsLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "tokenA", "type": "address" }, { "internalType": "address", "name": "tokenB", "type": "address" }], "name": "createPair", "outputs": [{ "internalType": "address", "name": "pair", "type": "address" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "feeTo", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "feeToSetter", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "getPair", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_feeTo", "type": "address" }], "name": "setFeeTo", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_feeToSetter", "type": "address" }], "name": "setFeeToSetter", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }]
  },
  UNISWAP_PAIR: {
    abi: [{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Swap", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint112", "name": "reserve0", "type": "uint112" }, { "indexed": false, "internalType": "uint112", "name": "reserve1", "type": "uint112" }], "name": "Sync", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [], "name": "DOMAIN_SEPARATOR", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MINIMUM_LIQUIDITY", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "PERMIT_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "burn", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_token0", "type": "address" }, { "internalType": "address", "name": "_token1", "type": "address" }], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "kLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "liquidity", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "price0CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "price1CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "skim", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "swap", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "sync", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }]
  },
  WETH: {
    abi: [
      {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
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
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
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
        "name": "ApproveRequest",
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
        "name": "approveRequest",
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
          },
          {
            "internalType": "address",
            "name": "_priceFeed",
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
            "name": "_newPriceFeed",
            "type": "address"
          }
        ],
        "name": "modifyPriceFeed",
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
}

export default ABI