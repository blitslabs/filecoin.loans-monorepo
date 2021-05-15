import {
    SAVE_CONTACT, REMOVE_CONTACT, REMOVE_ALL_CONTACTS
} from '../actions/contacts'

export default function contacts(state = {}, action) {
    switch (action.type) {
        case SAVE_CONTACT:
            return {
                ...state,
                [action.contact.id]: {
                    ...action.contact
                }
            }

        case REMOVE_CONTACT:
            return {
                ...Object.fromEntries(
                    Object.values(state)
                        .filter(c => c.id !== action.contactId)
                        .map(c => [c.id, c])
                )
            }

        case REMOVE_ALL_CONTACTS:
            return {}

        default:
            return state
    }
}