

export const ASSETS = {
    ETH: {
        name: 'Ethereum',
        symbol: 'ETH',
        explorer_url: 'https://etherscan.io/tx/',
        mainnet_endpoints: {
            http: '',
            ws: ''
        },
        chainId: 1,
        chainName: 'mainnet'
    },
    BNB: {
        name: 'Binance',
        symbol: 'BNB',
        explorer_url: 'https://testnet.bscscan.com/tx/',
        mainnet_endpoints: {
            http: 'https://data-seed-prebsc-2-s1.binance.org:8545',
            ws: ''
        },
        chainId: '97',
        chainName: 'mainnet'
    },
    FIL: {
        name: 'Filecoin',
        symbol: 'FIL',
        explorer_url: 'https://filfox.info/en/message/',
        mainnet_endpoints: {
            http: 'http://45.32.220.97:8000/rpc/v0',
            ws: ''
        },
        network: 'testnet',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.YpvMHFIcu-AW38RbFCeDw9NR731mOfmFKYsAtjaVqgI'
    }
}
