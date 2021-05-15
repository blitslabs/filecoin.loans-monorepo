import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Dimensions, TextInput, Text, Image, Pressable, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert } from 'react-native'
// import Header from '../../components/header'

// Components
import TextInputWithBtn from '../components/TextInputWithBtn'
import PrimaryBtn from '../components/PrimaryBtn'
import MyStatusBar from '../components/MyStatusBar'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import Slider from '@react-native-community/slider'

import ETH from '../../crypto/ETH'
import BNB from '../../crypto/BNB'
import BigNumber from 'bignumber.js'
import Blits from '../../crypto/Blits'
import { ASSETS } from '../../crypto/index'
import currencyFormatter from 'currency-formatter'

// Icons
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'


class SendTokenView extends Component {

    state = {
        address: '',
        amount: '',

        gasLimit: 100000,
        gasPrice: 1,
        addressIsInvalid: false,
        amountIsInvalid: false,
    }

    componentDidMount() {
        SplashScreen.hide()
        const { shared, route, wallet } = this.props

        this.setState({ address: route?.params?.address ? route?.params?.address : '' })

        if (shared?.selectedAsset === 'ETH') {
            const eth = new ETH('ETH', 'mainnet')
            eth.getGasData()
                .then((data) => {
                    this.setState({
                        gasLimit: '100000',
                        gasPrice: data?.gasPrice
                    })
                })
        } else if (shared?.selectedAsset === 'BNB') {
            const bnb = new BNB('BNB', 'mainnet')
            bnb.getGasData()
                .then((data) => {
                    this.setState({
                        gasLimit: '100000',
                        gasPrice: data?.gasPrice
                    })
                })
    
        }
    }

    handleAddressChange = (value) => {
        const { shared } = this.props
        let addressIsInvalid = false
        console.log(Blits.isAddressValid(value, shared.selectedAsset))
        try {
            addressIsInvalid = !Blits.isAddressValid(value, shared.selectedAsset)
        } catch (e) {
            addressIsInvalid = false
        }

        this.setState({ address: value, addressIsInvalid })
    }

    handleAmountChange = (value) => {
        this.setState({ amount: value })
    }

    handleScanBtn = () => {
        console.log('QR_CODE_SCAN_BTN')
        const { navigation } = this.props
        navigation.push('QRCode', { onQRRead: this.onQRRead })
    }

    onQRRead = (e) => {
        const { navigation, shared } = this.props
        const address = e.data
        let addressIsInvalid = false

        try {
            addressIsInvalid = !Blits.isAddressValid(address, shared.selectedAsset)
        } catch (e) {
            addressIsInvalid = true
        }

        this.setState({ address, addressIsInvalid })
        navigation.pop()
    }


    handleMaxBtn = () => {
        console.log('MAX_AMOUNT_BTN')
        const { tokens, shared } = this.props
        const tokenBalance = BigNumber(tokens[shared.selectedToken].balance)
        this.setState({ amount: tokenBalance.toString() })
    }

    handleSendBtn = () => {
        console.log('SEND_BTN')
        const { navigation, publicKeys, shared, balances, tokens } = this.props
        const nativeBalance = balances[publicKeys[shared.selectedAsset]] !== undefined ? BigNumber(balances[publicKeys[shared.selectedAsset]].total_balance) : 0
        const tokenBalance = BigNumber(tokens[shared.selectedToken].balance)
        let { address, amount, fromShard, shard, gasPrice, gasLimit } = this.state

        if (!address || !amount) {
            Alert.alert('Error', 'Enter all the required fields', [{ text: 'OK' }])
            return
        }

        // Convert to BigNumber
        amount = BigNumber(amount)
        gasPrice = BigNumber(gasPrice)
        gasLimit = BigNumber(gasLimit)

        // Check Address
        let addressIsValid

        try {
            addressIsValid = Blits.isAddressValid(address, shared.selectedAsset)
        } catch (e) {
            addressIsValid = false
        }

        if (!address || !addressIsValid) {
            Alert.alert('Error', 'Invalid address', [{ text: 'OK' }])
            return
        }

        // Check token balance
        if (!amount || amount.lte(0) || !tokenBalance || tokenBalance.lt(amount)) {
            Alert.alert('Error', `Not enough token balance`, [{ text: 'OK' }])
            return
        }

        // Check native token balance
        const gas = gasPrice.times(gasLimit.div(1000000000))

        if (nativeBalance.lt(gas)) {
            Alert.alert('Error', `Not enough ${shared.selectedAsset} to send`, [{ text: 'OK' }])
            return
        }

        const txConfirmationText = <View>
            <Text style={styles.txConfirmationText}>{`You are sending ${amount} ${tokens[shared.selectedToken].symbol} to:`} </Text>
            <Text style={{ ...styles.txConfirmationText, fontSize: 10 }}>{address}</Text>
        </View>
        navigation.push('ConfirmTx', { txConfirmationText, handleSendTx: this.handleSendTx })
    }

    handleSendTx = async () => {
        console.log('SEND_TX')
        const { dispatch, wallet, navigation, shared, tokens } = this.props
        const { address, amount, gasLimit, gasPrice } = this.state
        const token = tokens[shared.selectedToken]

        let tx
        if (shared.selectedAsset === 'ETH') {
            const eth = new ETH('ETH', 'mainnet')
            tx = await eth.sendToken(address, amount, token.contractAddress, gasLimit, gasPrice, wallet.ETH)
        } else if (shared.selectedAsset === 'BNB') {
            const bnb = new BNB('BNB', 'mainnet')
            tx = await bnb.sendToken(address, amount, token.contractAddress, gasLimit, gasPrice, wallet.BNB)
        }
        console.log('TX: ', tx)
        navigation.replace('TxComplete', { txStatus: tx.status, message: tx.message, explorerUrl: `${ASSETS[shared.selectedAsset].explorer_url}${tx.payload}` })
    }

    render() {

        const { address, amount, addressIsInvalid, gasPrice, gasLimit } = this.state
        const { shared, tokens } = this.props
        const token = tokens[shared.selectedToken]
        const tokenBalance = token.balance
        const amountIsInvalid = parseFloat(amount) > parseFloat(tokenBalance) ? true : false

        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" />

                <View style={styles.formContainer}>


                    <View style={styles.balancesContainer}>
                        <Text style={styles.formLabel}>Available balance</Text>
                        <View style={{ flexDirection: 'row', }}>
                            <Text style={styles.text}>{currencyFormatter.format(tokenBalance, { code: 'USD' }).replace('$', '')} {token.symbol} </Text>
                        </View>
                    </View>


                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.formLabel}>Send to Address</Text>
                        <TextInputWithBtn
                            placeholder="Address"
                            value={this.state.address}
                            onChangeText={this.handleAddressChange}
                            icon={<IconMaterialCommunity name="qrcode-scan" size={22} />}
                            onIconBtnPressed={this.handleScanBtn}
                            isInvalid={addressIsInvalid}
                        />
                        {addressIsInvalid && <Text style={{ ...styles.sm_text, color: 'red', marginTop: 2 }}>Invalid Address</Text>}
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.formLabel}>Amount {token.symbol}</Text>
                        <TextInputWithBtn
                            placeholder="Amount"
                            value={this.state.amount}
                            onChangeText={this.handleAmountChange}
                            icon={<Text style={{ ...styles.formLabel, paddingTop: 4 }}>MAX</Text>}
                            onIconBtnPressed={this.handleMaxBtn}
                            isInvalid={parseFloat(amount) > parseFloat(tokenBalance) ? true : false}
                            keyboardType="numeric"
                        />
                        {amountIsInvalid && <Text style={{ ...styles.sm_text, color: 'red', marginTop: 2 }}>Not enough balance</Text>}
                    </View>


                    <ScrollView>
                        <View style={styles.detailsContainer}>
                            <Text style={styles.formLabel}>Transaction Details</Text>

                            <Text style={styles.text}>Sending {amount ? currencyFormatter.format(amount, { code: 'USD' }).replace('$', '') : '0'} {token.symbol} to:</Text>
                            <Text style={styles.text}>{address}</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                <View>
                                    <Text style={styles.formLabel}>Gas Price</Text>
                                    <Text style={styles.text}>{gasPrice} Gwei</Text>
                                </View>
                                <View>
                                    <Text style={styles.formLabel}>Gas Limit</Text>
                                    <Text style={styles.text}>{gasLimit} wei</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                </View>

                <View style={{ width: '100%', paddingHorizontal: 20, paddingBottom: 20 }}>
                    <PrimaryBtn onPress={this.handleSendBtn} title='Send Token' />
                </View>

            </SafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    container: {

        backgroundColor: 'white',
        flex: 1,
        alignItems: 'center'
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
        paddingBottom: 30,
        backgroundColor: 'transparent',
        width: '100%',
        flex: 1
    },
    balancesContainer: {
        marginVertical: 0,
    },
    formLabel: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 12
    },
    text: {
        fontFamily: 'Poppins-Regular'
    },
    detailsContainer: {
        borderTopColor: '#f9f9f9',
        borderTopWidth: 1,
        paddingTop: 15,
        marginTop: 10,
        width: '100%',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        // marginBottom: 20,
    },
    sm_text: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10
    },
    txConfirmationText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40
    }


})

function mapStateToProps({ wallet, shared, balances, tokens }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        balances,
        wallet: wallet && wallet.wallet,
        tokens
    }
}

export default connect(mapStateToProps)(SendTokenView)