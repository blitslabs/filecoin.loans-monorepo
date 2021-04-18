export const SAVE_PROTOCOL_CONTRACTS = 'SAVE_PROTOCOL_CONTRACTS'

export function saveProtocolContracts(contracts) {
    return {
        type: SAVE_PROTOCOL_CONTRACTS,
        contracts
    }
}