export const SAVE_LOANS = 'SAVE_LOANS'
export const REMOVE_LOANS = 'REMOVE_LOANS'
export const LOADING_LOAN_STATUS = 'LOADING_LOAN_STATUS'

export function saveLoans(loans) {
    return {
        type: SAVE_LOANS,
        loans
    }
}

export function removeLoans() {
    return {
        type: REMOVE_LOANS,
    }
}

export function loadingLoanStatus(loanId) {
    return {
        type: LOADING_LOAN_STATUS,
        loanId
    }
}