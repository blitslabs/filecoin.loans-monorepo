

export const ASSETS = {    
    FIL: {
        name: 'Filecoin',
        symbol: 'FIL',
        
    },
    BNB: {
        name: 'Binance',
        symbol: 'BNB',
        explorer_url: 'https://bscscan.com',
        mainnet_endpoints: {
            http: 'https://bsc-dataseed.binance.org/',
            ws: ''
        },
        chainId: '56',
        chainName: 'mainnet'
    },
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
}

export const CONTRACTS = {
    BlitsLoans: {
        eth: {
            mainnet_contract: '',
            testnet_contract: '0x34858118B60e2C61B8c96327aF14B4B3279B0F33'
        },
        one: {
            mainnet_contract: '',
            testnet_contract: ''
        }
    },
    CollateralLock: {
        eth: {
            mainnet_contract: '',
            testnet_contract: ''
        },
        one: {
            mainnet_contract: '',
            testnet_contract: '0xF709E3718AB788BF3f5829B16c937e5dA95D2F48'
        }
    },
    DAI: {
        name: 'DAI',
        symbol: 'DAI',
        mainnet_contract: '0x6b175474e89094c44da98b954eedeac495271d0f',
        testnet_contract: '0x66de848754ac3db593ad80da63d2f174ec6dc798',
        blockchain: 'ETH'
    },
    BUSD: {
        name: 'BUSD',
        symbol: 'BUSD',
        mainnet_contract: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
        testnet_contract: '0x66de848754ac3db593ad80da63d2f174ec6dc798',
        blockchain: 'ETH'
    },
    Horizon: {
        eth: {
            erc20: '0x2dCCDB493827E15a5dC8f8b72147E6c4A5620857',
            busd: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',
            link: '0xfE601dE9D4295274b9904D5a9Ad7069F23eE2B32'
        },
        one: {
            erc20: '0x2fBBCEF71544C461EDfC311F42e3583d5F9675D1', // one197auaac4gnzxrm0uxy059c6c840evaw3c3g55j
            busd: '0x05d11b7082D5634e0318d818a2F0cD381b371EA5', // one1qhg3kuyz6435uqccmqv29uxd8qdnw8497rtqew
            link: '0xC0C7b147910Ef11F6454Dc1918EcDe9A2B64A3a8' // one1crrmz3u3pmc37ez5msv33mx7ng4kfgagpu7qck
        }
    }
}