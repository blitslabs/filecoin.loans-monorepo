import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, SafeAreaView,
    StatusBar, StyleSheet, Keyboard, TouchableOpacity, Platform,
} from 'react-native'

// Components
import Header from '../components/Header'
import AssetCards from '../components/AssetCards'
import MyStatusBar from '../components/MyStatusBar'

const HEIGHT = Dimensions.get('window').height

// Libraries
import AsyncStorage from '@react-native-community/async-storage'
import SplashScreen from 'react-native-splash-screen'
import io from 'socket.io-client'
import { SOCKETS_HOST } from '@env'
import BackgroundTimer from 'react-native-background-timer'
import ETH from '../../crypto/ETH'
import BNB from '../../crypto/BNB'
import FIL from '../../crypto/FIL'
const ASSETS = ['ETH', 'BNB', 'FIL']
import { ASSETS as ASSET_DATA } from '../../crypto/index'
import BigNumber from 'bignumber.js'

// Actions
import { setSelectedAsset, setCardStackKey } from '../../actions/shared'
import { saveTx, removeTxs } from '../../actions/txs'
import { saveBalances } from '../../actions/balances'
import { savePrices } from '../../actions/prices'
import { updateTokenBalance, removeAllTokens, saveToken, updateTokenData } from '../../actions/tokens'

import { toggleWalletLock } from '../../actions/auth'

// API
import {
    getPrices, getAssets, getAccountTxs,
} from '../../utils/api'

// ENV Variables
import { NETWORK } from "@env"

class WalletView extends Component {

    cardStackRef = React.createRef()

    checkWalletLock = () => {
        const { auth, navigation, dispatch } = this.props
        try {
            const currentTimestamp = parseInt(new Date().getTime() / 1000)
            const timeDiff = currentTimestamp - auth?.last_unlock

            if (timeDiff > 5 || isNaN(timeDiff) || timeDiff < 0) {
                navigation.navigate('UnlockWallet')
                dispatch(toggleWalletLock(true))
            }

        } catch (e) {
            console.log(e)
            navigation.navigate('UnlockWallet')
            dispatch(toggleWalletLock(true))
        }
    }

    componentDidMount() {
        // this.checkWalletLock()

        SplashScreen.hide()
        Keyboard.dismiss()

        let { publicKeys, tokens, nftCollections, dispatch, shared } = this.props

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


        const socket = io(SOCKETS_HOST).connect()

        socket.on('connect', () => {
            console.log('Connected to sockets server...')

            socket.on('prices', (data) => {
                console.log(data)
                dispatch(savePrices(data))
            })

        })

        socket.on('disconnect', () => {
            console.log('Sockets servers disconnected...')
            socket.removeAllListeners()
        })

        socket.on('connect_error', (err) => {
            console.log(err)
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



            else if (blockchain === 'filecoin') {
                const filecoin = new FIL(ASSET_DATA?.FIL?.mainnet_endpoints?.http)

                filecoin.getBalance(account)
                    .then((data) => {
                        dispatch(saveBalances({ [account]: { total_balance: data } }))
                    })

                getAccountTxs({ blockchain, account })
                    .then(data => data.json())
                    .then((res) => {
                        if (res && 'docs' in res && res.docs.length > 0) {
                            res.docs.map((tx) => {
                                if (txs[account] === undefined || txs[account][tx.id] === undefined || txs[account][tx.id].status !== tx.status) {
                                    dispatch(saveTx({
                                        ...tx,
                                        address: account,
                                        txHash: tx.id,
                                        fee: BigNumber(tx?.fee).div(1e18).toString(),
                                        metadata: {
                                            ...tx.metadata,
                                            value: BigNumber(tx?.metadata?.value).div(1e18).toString(),
                                        },
                                    }))
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
            ? shared.selectedAsset === 'ETH' ? 0
                : shared?.selectedAsset === 'BNB' ? 1
                    : shared?.selectedAsset === 'FIL' ? 2
                        : 3 : 0

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
                <AssetCards cardStackRef={this.cardStackRef} navigation={this.props.navigation} cardIndex={cardIndex} />
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

function mapStateToProps({ wallet, txs, shared, tokens, nftCollections, auth }) {
    return {
        wallet,
        publicKeys: wallet && wallet.publicKeys,
        txs,
        shared,
        tokens,
        nftCollections,
        auth
    }
}

export default connect(mapStateToProps)(WalletView)