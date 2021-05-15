export const SAVE_AVAILABLE_LOANS = 'SAVE_AVAILABLE_LOANS'
export const REMOVE_AVAILABLE_LOANS = 'REMOVE_AVAILABLE_LOANS'

export function saveAvailableLoans(loans) {
    return {
        type: SAVE_AVAILABLE_LOANS,
        loans
    }
}


export function removeLoans() {
    return {
        type: REMOVE_AVAILABLE_LOANS,
    }
}