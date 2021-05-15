export const SAVE_LOAN_REQUEST = 'SAVE_LOAN_REQUEST'


export function saveLoanRequest(loanRequest) {
    return {
        type: SAVE_LOAN_REQUEST,
        loanRequest
    }
}