export const SAVE_CONTACT = 'SAVE_CONTACT'
export const REMOVE_CONTACT = 'REMOVE_CONTACT'
export const REMOVE_ALL_CONTACTS = 'REMOVE_ALL_CONTACTS'

export function saveContact(contact) {
    return {
        type: SAVE_CONTACT,
        contact
    }
}

export function removeContact(contactId) {
    return {
        type: REMOVE_CONTACT,
        contactId
    }
}

export function removeAllContacts() {
    return {
        type: REMOVE_ALL_CONTACTS
    }
}