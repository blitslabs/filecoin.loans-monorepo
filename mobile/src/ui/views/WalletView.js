import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, SafeAreaView,
    StatusBar, StyleSheet, Keyboard, TouchableOpacity, Platform,
} from 'react-native'

// Components
import Header from '../components/Header'
import Cards from '../components/Cards'
import MyStatusBar from '../components/MyStatusBar'

const HEIGHT = Dimensions.get('window').height

// Libraries
import AsyncStorage from '@react-native-community/async-storage'
import SplashScreen from 'react-native-splash-screen'

import BackgroundTimer from 'react-native-background-timer'


import ETH from '../../crypto/ETH'
import BNB from '../../crypto/BNB'
import FIL from '../../crypto/FIL'
const ASSETS = ['FIL', 'BNB', 'ETH']
import { ASSETS as ASSET_DATA } from '../../crypto/index'



// Actions
import { setSelectedAsset, setCardStackKey } from '../../actions/shared'
import { saveTx, removeTxs } from '../../actions/txs'
import { saveBalances } from '../../actions/balances'
import { savePrices } from '../../actions/prices'
import { updateTokenBalance, removeAllTokens, saveToken, updateTokenData } from '../../actions/tokens'
import { addBlocchainWallet } from '../../actions/wallet'

// API
import {
    saveWallet, getPrices, getAssets, getEndpoints, getNFTCollections,
    getAccountTokens, getAccountTxs, getAccountCollection,
    getAccountTxsByXPUB
} from '../../utils/api'

// ENV Variables
import { NETWORK } from "@env"

class WalletView extends Component {

    cardStackRef = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        Keyboard.dismiss()

        let { publicKeys, tokens, nftCollections, dispatch, shared } = this.props

        // if (!('FIL' in wallet?.wallet)) {
        //     const keys = FIL.createWallet(wallet?.wallet?.mnemonic, 1)
        //     dispatch(addBlocchainWallet({ symbol: 'FIL', keys: { ...keys } }))
        // }

        const selectedAssetIndex = ASSETS.indexOf(shared?.selectedAsset)
        this.cardStackRef.current.jumpToCardIndex(selectedAssetIndex)

        // Get Assets
        getAssets({ network: NETWORK, assetType: 'ERC20' })
            .then(data => data.json())
            .then((res) => {
                // console.log(res)
                if (res.status === 'OK' && res.payload.length > 0) {
                    res.payload.map((a) => {
                        if (!(a?.contractAddress in tokens) || tokens[a.contractAddress] === undefined) {
                            dispatch(updateTokenData(a))
                        }
                    })
                }
            })

        // Get Prices
        getPrices()
            .then(data => data.json())
            .then((res) => {
                if (res.status === 'OK') {
                    dispatch(savePrices(res.payload))
                }
            })
      
        this.updateWalletData()

        BackgroundTimer.runBackgroundTimer(() => {
            // this.updateWalletData()
        }, 60000)
    }

    componentWillUnmount() {
        BackgroundTimer.stopBackgroundTimer()
    }

    updateWalletData = () => {
        console.log('UPDATE_WALLET_DATA')
        const { publicKeys, tokens, txs, dispatch } = this.props

        Object.entries(publicKeys).map(async (key) => {
            const blockchain = ASSET_DATA[key[0]]?.name.toLowerCase()
            const account = key[1]


            if (blockchain === 'ethereum') {
                const eth = new ETH('ETH', 'mainnet')
                eth.getBalance(account)
                    .then((data) => {
                        console.log(data)
                        dispatch(saveBalances({ [account]: { total_balance: data } }))
                    })

                await this.sleep(5500)
                eth.getAccountTxs(account, 'ETH')
                    .then((res) => {
                        if (res.status === 'OK') {
                            res.payload.map((tx) => {
                                if (txs[account] === undefined || txs[account][tx.id] === undefined || txs[account][tx.id].status !== tx.status) {
                                    dispatch(saveTx({ ...tx }))
                                }
                            })
                        }
                    })

                await this.sleep(5500)
                eth.getAccountTokenTxs(account)
                    .then((res) => {
                        if (res.status === 'OK') {
                            res.payload.map((tx) => {
                                if (
                                    txs[account] === undefined || txs[account][tx.id] === undefined ||
                                    txs[account][tx.id].status !== tx.status ||
                                    txs[account][tx.id]?.metadata?.symbol != tx?.metadata.symbol
                                ) {
                                    dispatch(saveTx({ ...tx }))

                                    // Check if tokens has been saved
                                    if (!(tx?.metadata?.token_id in tokens) || tokens[tx?.metadata?.token_id] === undefined) {
                                        dispatch(updateTokenData({
                                            name: tx?.metadata?.name,
                                            symbol: tx?.metadata?.symbol,
                                            contractAddress: tx?.metadata?.token_id,
                                            decimals: tx?.metadata?.decimals,
                                            type: tx?.metadata?.type,
                                            chainType: 'ETH',
                                            address: account
                                        }))
                                    }
                                }
                            })
                        }
                    })

            }

            else if (blockchain === 'binance') {
                const bnb = new BNB('BNB', 'mainnet')

                bnb.getBalance(account)
                    .then((data) => {
                        dispatch(saveBalances({ [account]: { total_balance: data } }))
                    })

                await this.sleep(5500)
                bnb.getAccountTxs(account, 'BNB')
                    .then((res) => {
                        if (res.status === 'OK') {
                            res.payload.map((tx) => {
                                if (txs[account] === undefined || txs[account][tx.id] === undefined || txs[account][tx.id].status !== tx.status) {
                                    dispatch(saveTx({ ...tx }))
                                }
                            })
                        }
                    })

                await this.sleep(5500)
                bnb.getAccountTokenTxs(account)
                    .then((res) => {
                        if (res.status === 'OK') {
                            res.payload.map((tx) => {
                                if (
                                    txs[account] === undefined || txs[account][tx.id] === undefined ||
                                    txs[account][tx.id].status !== tx.status ||
                                    txs[account][tx.id]?.metadata?.symbol != tx?.metadata.symbol
                                ) {
                                    dispatch(saveTx({ ...tx }))

                                    // Check if tokens has been saved
                                    if (!(tx?.metadata?.token_id in tokens) || tokens[tx?.metadata?.token_id] === undefined) {
                                        dispatch(updateTokenData({
                                            name: tx?.metadata?.name,
                                            symbol: tx?.metadata?.symbol,
                                            contractAddress: tx?.metadata?.token_id,
                                            decimals: tx?.metadata?.decimals,
                                            type: tx?.metadata?.type,
                                            chainType: 'BNB',
                                            address: account
                                        }))
                                    }
                                }
                            })
                        }
                    })
            }


        })

        // Update Token Balances
        if (Object.values(tokens).length > 0) {
            Object.values(tokens).map(async (t) => {
                if (t.chainType === 'ETH') {
                    const eth = new ETH('ETH', 'mainnet')
                    const tokenData = await eth.getERC20Data(t.contractAddress, publicKeys['ETH'])
                    dispatch(updateTokenBalance({ contractAddress: t.contractAddress, balance: tokenData.balance }))
                }
                else if (t.chainType === 'BNB') {
                    const bnb = new BNB('BNB', 'mainnet')
                    const tokenData = await bnb.getERC20Data(t.contractAddress, publicKeys['BNB'])
                    dispatch(updateTokenBalance({ contractAddress: t.contractAddress, balance: tokenData.balance }))
                }
            })
        }
    }


    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    handleAssetSelectBtn = async (assetSymbol) => {
        console.log(assetSymbol)
        const { dispatch } = this.props
        let selectedAssetIndex = ASSETS.indexOf(assetSymbol)
        this.cardStackRef.current.jumpToCardIndex(selectedAssetIndex)
        dispatch(setSelectedAsset(ASSETS[selectedAssetIndex]))
    }

    render() {

        const { shared } = this.props
        const { selectedAsset } = shared

        const cardIndex = shared && 'selectedAsset'
            ? shared.selectedAsset === 'FIL' ? 0
                : shared.selectedAsset === 'BNB' ? 1
                    : shared?.selectedAsset === 'ETH' ? 2
                        : 0 : 0


        return (
            <SafeAreaView style={styles.container} >
                <StatusBar backgroundColor="black" />
                <Header
                    title="Wallet"
                    navigation={this.props.navigation}
                />
                <View style={styles.walletTitlesContainer}>
                    <Pressable
                        hitSlop={20}
                        onPress={() => this.handleAssetSelectBtn(ASSETS[0])}
                        style={{ borderBottomWidth: selectedAsset === ASSETS[0] ? 2 : 0 }}
                    >
                        <Text style={styles.walletTitleBtn}>{ASSETS[0]}</Text>
                    </Pressable>
                    <Pressable
                        hitSlop={20}
                        onPress={() => this.handleAssetSelectBtn(ASSETS[1])}
                        style={{ borderBottomWidth: selectedAsset === ASSETS[1] ? 2 : 0 }}
                    >
                        <Text style={styles.walletTitleBtn}>{ASSETS[1]}</Text>
                    </Pressable>
                    <Pressable
                        hitSlop={20}
                        onPress={() => this.handleAssetSelectBtn(ASSETS[2])}
                        style={{ borderBottomWidth: selectedAsset === ASSETS[2] ? 2 : 0 }}
                    >
                        <Text style={styles.walletTitleBtn}>{ASSETS[2]}</Text>
                    </Pressable>

                </View >
                <Cards cardStackRef={this.cardStackRef} navigation={this.props.navigation} cardIndex={cardIndex} />
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        // height: HEIGHT,
        // paddingHorizontal: 20,
        paddingVertical: 20,
    },
    walletTitlesContainer: {
        marginHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 10
    },
    walletTitleBtn: {
        fontFamily: 'Poppins-SemiBold'
    }
})

function mapStateToProps({ wallet, txs, shared, tokens, nftCollections, }) {
    return {
        wallet,
        publicKeys: wallet && wallet.publicKeys,
        txs,
        shared,
        tokens,
        nftCollections
    }
}

export default connect(mapStateToProps)(WalletView)