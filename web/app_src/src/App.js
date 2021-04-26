import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { connect } from 'react-redux'

import Dashboard from './components/views/Dashboard'

// FIL <=> ERC20 Market
import BorrowFIL from './components/fil_erc20_market/BorrowFIL'
import ConfirmBorrowFIL from './components/fil_erc20_market/ConfirmBorrowFIL'
import BorrowFILDone from './components/fil_erc20_market/BorrowFILDone'
import BorrowFILRequests from './components/fil_erc20_market/BorrowFILRequests'
import FILLoanDetails from './components/fil_erc20_market/FILLoanDetails'

// ERC20 <=> FIL Market
import LendERC20 from './components/erc20_fil_market/LendERC20'
import ConfirmLendERC20 from './components/erc20_fil_market/ConfirmLendERC20'
import LendERC20Done from './components/erc20_fil_market/LendERC20Done'
import LendERC20Offers from './components/erc20_fil_market/LendERC20Offers'
import ERC20LoanDetails from './components/erc20_fil_market/ERC20LoanDetails'
import MyLoans from './components/views/MyLoans'

// Libraries
import FIL from './crypto/FIL'
import ETH from './crypto/ETH'
import { NATIVE_TOKEN } from './crypto/Networks'
import Web3 from 'web3'
import './styles.css'

// Actions
import { saveAccount, saveFilEndpoint, saveFilToken, saveNativeToken, saveNetwork } from './actions/shared'
import { saveFilBalance, saveFilTxs, removePendingTx, removeAllPendingTxs } from './actions/filecoin_wallet'
import { savePrices } from './actions/prices'
import { saveLoanAssets } from './actions/loanAssets'
import { saveProtocolContracts } from './actions/protocolContracts'
import { saveAssetBalance } from './actions/balances'

// API
import { getPrices, getLoanAssets, getProtocolContracts } from './utils/api'

class App extends Component {

  async componentDidMount() {
    const { dispatch, shared } = this.props

    if (!shared?.filEndpoint) dispatch(saveFilEndpoint(process.env.REACT_APP_FIL_ENDPOINT))
    if (!shared?.filToken) dispatch(saveFilToken(process.env.REACT_APP_FIL_TOKEN))

    this.loandFilData()
    this.loadMetamaskData()
    this.loadBalances()
    // this.filInterval = setInterval(async () => {
    //   this.loandFilData()
    // }, 15000)

    // LOAD API DATA
    getLoanAssets({ networkId: 'ALL' })
      .then(data => data.json())
      .then((res) => {
        console.log(res)
        dispatch(saveLoanAssets(res.payload))
      })

    getProtocolContracts()
      .then(data => data.json())
      .then((res) => {
        dispatch(saveProtocolContracts(res.payload))
      })

    getPrices()
      .then(data => data.json())
      .then((res) => {
        dispatch(savePrices(res.payload))
      })

    this.pricesInterval = setInterval(() => {
      getPrices()
        .then(data => data.json())
        .then((res) => {
          dispatch(savePrices(res.payload))
        })
    }, 60000)

    this.balancesInterval = setInterval(() => {
      this.loadBalances()
    }, 30000)
  }

  componentWillUnmount() {
    clearInterval(this.filInterval)
    clearInterval(this.metamaskInterval)
    clearInterval(this.balancesInterval)
  }

  loandFilData = async () => {
    const { shared, filecoin_wallet, dispatch } = this.props
    try {
      const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)
      const account = filecoin_wallet?.public_key[shared?.filNetwork]

      // Fetch Balance
      const balance = await filecoin.getBalance(account)
      dispatch(saveFilBalance({ balance: balance, network: shared?.filNetwork }))

      // Fetch Messages
      const messages = await filecoin.getAccountMessages(account)
      dispatch(saveFilTxs({ txs: messages, network: shared?.filNetwork }))

      // Remove Pending Txs that have been mined
      Object.values(filecoin_wallet?.pending_txs[shared?.filNetwork]).map(async (tx) => {
        const isMined = await filecoin.messageIsMined(tx?.CID)
        if (isMined) {
          dispatch(removePendingTx({ txId: tx?.CID['/'], network: shared?.filNetwork }))
        }
      })

    } catch (e) {
      console.log(e)
    }

  }

  loadMetamaskData = async () => {
    const { dispatch } = this.props

    let web3, providerAccounts, networkId
    try {

      // Connect Provider
      web3 = new Web3(window.ethereum)

      // Get Connected Accounts
      providerAccounts = await web3.eth.getAccounts()

      // Save Account
      dispatch(saveAccount(providerAccounts[0]))

      // Save Network
      networkId = await web3.eth.net.getId()
      dispatch(saveNetwork(networkId))

      // Save Native Token
      dispatch(saveNativeToken(NATIVE_TOKEN[networkId]))
      dispatch(saveNativeToken(NATIVE_TOKEN[networkId] ? NATIVE_TOKEN[networkId] : 'ETH'))

      this.metamaskInterval = setInterval(async () => {
        const { shared } = this.props

        // Get Network ID
        networkId = await web3.eth.net.getId()

        // Check if network Id has changed
        if (networkId != shared?.networkId) {
          dispatch(saveNetwork(networkId))
          dispatch(saveNativeToken(NATIVE_TOKEN[networkId] ? NATIVE_TOKEN[networkId] : 'ETH'))
        }

        // Get account
        providerAccounts = await web3.eth.getAccounts()
        const account = providerAccounts[0] !== undefined ? providerAccounts[0] : ''

        // Check if Account has changed
        if (shared?.account != account) {
          dispatch(saveAccount(account))
          // dispatch(removeAssetBalances())          
        }

      }, 1000)

    } catch (e) {
      console.log(e)
    }
  }

  loadBalances = async () => {
    const { loanAssets, shared, balances, dispatch } = this.props

    // Filter Tokens
    const filteredTokens = Object.values(loanAssets).filter(a => a?.networkId == shared?.networkId)
    const totalTokens = filteredTokens.length

    // Return if not connected
    if (!(shared?.account && shared?.networkId)) {
      return
    }

    // Get Native Token Balance
    try {
      const nativeBalance = await ETH.getBalance(shared?.account)
      if (nativeBalance != balances?.[shared?.nativeToken] && parseFloat(nativeBalance) >= 0) {
        dispatch(saveAssetBalance({ contractAddress: shared?.nativeToken, balance: nativeBalance }))
      }
    } catch (e) {
      console.log(e)
    }

    // Get Token Balances   
    for (let i = 0; i < totalTokens; i++) {
      try {
        const asset = filteredTokens[i]
        const balance = await ETH.getERC20Balance(shared?.account, asset?.contractAddress)

        if (balance?.status != 'OK') return

        if (balance?.payload != balances?.[asset?.contractAddress] && parseFloat(balance?.payload) >= 0) {
          dispatch(saveAssetBalance({ contractAddress: asset?.contractAddress, balance: balance?.payload }))
        }

      } catch (e) {
        console.log(e)
      }
    }

  }

  render() {
    return (
      <Router>
        <Route path='/dashboard' component={Dashboard} />
        <Route path='/myloans' component={MyLoans} />

        <Route path='/borrow/FIL' exact component={BorrowFIL} />
        <Route path='/borrow/FIL/confirm' exact component={ConfirmBorrowFIL} />
        <Route path='/borrow/FIL/done' exact component={BorrowFILDone} />
        <Route path='/borrow/requests/FIL' exact component={BorrowFILRequests} />
        <Route path='/loan/FIL/:loanId' component={FILLoanDetails} />

        <Route path='/lend/ERC20' exact component={LendERC20} />
        <Route  path='/lend/ERC20/confirm' exac component={ConfirmLendERC20} />
        <Route path='/lend/ERC20/done' exact component={LendERC20Done} />
        <Route path='/lend/offers/ERC20' component={LendERC20Offers} />
        <Route path='/loan/ERC20/:loanId' component={ERC20LoanDetails} />
      </Router>
    )
  }
}

function mapStateToProps({ shared, filecoin_wallet, loanAssets }) {
  return {
    shared,
    filecoin_wallet,
    loanAssets
  }
}

export default connect(mapStateToProps)(App)