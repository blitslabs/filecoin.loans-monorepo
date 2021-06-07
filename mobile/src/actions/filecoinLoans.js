export const SAVE_FL_PROTOCOL_CONTRACTS = 'SAVE_FL_PROTOCOL_CONTRACTS'
export const SAVE_FL_LOAN_ASSETS = 'SAVE_FL_LOAN_ASSETS'
export const SAVE_FL_TX = 'SAVE_FL_TX'
export const SAVE_OPEN_BORROW_REQUESTS = 'SAVE_OPEN_BORROW_REQUESTS'
export const SAVE_OPEN_LOAN_OFFERS = 'SAVE_OPEN_LOAN_OFFERS'
export const SAVE_LOAN_DETAILS = 'SAVE_LOAN_DETAILS'

export function saveFLProtocolContracts(contracts) {
    return {
        type: SAVE_FL_PROTOCOL_CONTRACTS,
        contracts
    }
}

export function saveFLLoanAssets(assets) {
    return {
        type: SAVE_FL_LOAN_ASSETS,
        assets,
    }
}

export function saveFLTx(tx) {
    return {
        type: SAVE_FL_TX,
        tx
    }
}

// Loanbook

export function saveOpenBorrowRequests(borrowRequests) {
    return {
        type: SAVE_OPEN_BORROW_REQUESTS,
        borrowRequests
    }
}

export function saveOpenLoanOffers(loanOffers) {
    return {
        type: SAVE_OPEN_LOAN_OFFERS,
        loanOffers
    }
}

// Loan Details
export function saveLoanDetails(loanData) {
    return {
        type: SAVE_LOAN_DETAILS,
        loanData
    }
}