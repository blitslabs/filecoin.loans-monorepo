const rp = require('request-promise')
const BigNumber = require('bignumber.js')
const Web3 = require('web3')


const BNB = {

    API: 'https://api-testnet.bscscan.com/api?module=',

    getTransactions: async (account) => {
        const URL = `${BNB.API}account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=dec&apikey=YourApiKeyToken`
        return rp(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            json: true
        })
            .then((res) => {
                if(res.message === 'OK') {
                    const payload = []
                    for(let tx of res.result) {
                        tx = {
                            id: tx.hash,
                            from: tx.from,
                            to: tx.to,
                            fee: (new BigNumber(tx.gasUsed).multipliedBy(tx.gasPrice).dividedBy(1e18)).toString(),
                            date: tx.timeStamp,
                            block: tx.blockNumber,
                            status: tx.txreceipt_status == 1 ? 'completed' : tx.txreceipt_status,
                            type: 'transfer',
                            direction: tx.from.toUpperCase() == account.toUpperCase() ? 'outgoing' : 'incoming',
                            metadata: {
                                value: BigNumber(tx.value).dividedBy(1e18).toString(),
                                symbol: 'BNB',
                                decimals: 18
                            }
                        }
                        payload.push(tx)
                    }

                    return { status: 'OK', payload }
                }
            })
    }
}

const getTransactionsByAccount = async (account) => {
    // Connect to HTTP Proviveder
    const web3 = new Web3(new Web3.providers.HttpProvider('https://data-seed-prebsc-2-s1.binance.org:8545/'))
    // quorumjs.extend(web3);
    
    // web3.utils.hexToNumber = v => {
    //     if (!v) return v;
    //     try {
    //         return numberToBN(v).toNumber();
    //     } catch (e) {
    //         return numberToBN(v).toString();
    //     }
    // };
    let currentBlock = await web3.eth.getBlockNumber()
    // const currentBlock = 6380688
    let n = await web3.eth.getTransactionCount(account, currentBlock)
    let bal = await web3.eth.getBalance(account, currentBlock)
    console.log(bal)
    for (let i = currentBlock; i >= 0 && (n > 0 || bal > 0); --i) {

        try {
            let block = await web3.eth.getBlock(i, true)
            block.timestamp = ''
            console.log(block)
            // if (block && block.transactions) {
            //     block.transactions.forEach((e) => {
            //         if (account == e.from) {
            //             console.log(e)
            //             if (e.from != e.to)
            //                 bal = bal.plus(e.value)
            //             console.log(i, e.from, e.to, e.value.toString());
            //             --n
            //         }

            //         if (account == e.to) {
            //             console.log(e)
            //             if (e.from != e.to)
            //                 bal = bal.minus(e.value)
            //             console.log(i, e.from, e.to, e.value.toString())
            //         }
            //     })
            // }

        } catch (e) {
            console.log(e)
        }
    }
}


const start = async () => {
    const account = '0x1901eA9eB5168D3b4C49AD5eC1a54Bc7077ABF63'
    const response = await BNB.getTransactions(account)
    console.log(response)
}

start()