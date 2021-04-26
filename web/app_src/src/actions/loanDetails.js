export const SAVE_LOAN_DETAILS = 'SAVE_LOAN_DETAILS'

export function saveLoanDetails(loanData) {
    return {
        type: SAVE_LOAN_DETAILS,
        loanData
    }
}
