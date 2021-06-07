export const SAVE_ENDPOINTS = 'SAVE_ENDPOINTS'
export const REMOVE_ENDPOINTS = 'REMOVE_ENDPOINTS'

export function saveEndpoints(endpoints) {
    return {
        type: SAVE_ENDPOINTS,
        endpoints
    }
}

export function removeEndpoints() {
    return {
        type: REMOVE_ENDPOINTS
    }
}