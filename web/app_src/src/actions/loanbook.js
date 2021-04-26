export const SAVE_OPEN_BORROW_REQUESTS = 'SAVE_OPEN_BORROW_REQUESTS'
export const SAVE_OPEN_LOAN_OFFERS = 'SAVE_OPEN_LOAN_OFFERS'

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