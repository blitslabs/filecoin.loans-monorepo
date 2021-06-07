export const ASSETS = {
    ONE: {
        name: 'Harmony',
        symbol: 'ONE',
        mainnet_endpoints: {
            shard_0_endpoint: 'https://api.s0.t.hmny.io',
            shard_1_endpoint: 'https://api.s1.t.hmny.io',
            shard_2_endpoint: 'https://api.s2.t.hmny.io',
            shard_3_endpoint: 'https://api.s3.t.hmny.io',
            shard_0_websocket: 'wss://ws.s0.t.hmny.io',
            shard_1_websocket: 'wss://ws.s1.t.hmny.io',
            shard_2_websocket: 'wss://ws.s2.t.hmny.io',
            shard_3_websocket: 'wss://ws.s3.t.hmny.io',
        },
        testnet_endpoints: {
            shard_0_endpoint: 'https://api.s0.b.hmny.io',
            shard_1_endpoint: 'https://api.s1.b.hmny.io',
            shard_2_endpoint: 'https://api.s2.b.hmny.io',
            shard_3_endpoint: 'https://api.s3.b.hmny.io',
            shard_0_websocket: 'wss://ws.s0.t.hmny.io',
            shard_1_websocket: 'wss://ws.s0.t.hmny.io',
            shard_2_websocket: 'wss://ws.s0.t.hmny.io',
            shard_3_websocket: 'wss://ws.s0.t.hmny.io',
        },
        explorer_url: 'https://explorer.harmony.one/#/tx/'
    },
    ETH: {
        name: 'Ethereum',
        symbol: 'ETH',
        explorer_url: 'https://etherscan.io/tx/',
        mainnet_endpoints: {
            http: 'https://eth.blits.net',
            ws: 'wss://eth.blits.net/ws'
        },
        chainId: 1,
        chainName: 'mainnet'
    },
    BNB: {
        name: 'Binance',
        symbol: 'BNB',
        explorer_url: 'https://bscscan.com',
        mainnet_endpoints: {
            http: '',
            ws: ''
        },
        chainId: '',
        chainName: ''
    },
    BTC: {
        name: 'Bitcoin',
        symbol: 'BTC',
        explorer_url: 'https://www.blockchain.com/btc/address/'
    },
}