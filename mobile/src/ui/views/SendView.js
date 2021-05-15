import React, { Component, Fragment } from 'react'
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

// Icons
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'

// Actions
import { setSelectedAsset } from '../../actions/shared'


class SendView extends Component {

    state = {
        address: '',
        amount: '',
        gasLimit: 25000,
        gasPrice: 1,
        satsPerByte: 50,
        addressIsInvalid: false,
        amountIsInvalid: false,
    }

    componentDidMount() {
        SplashScreen.hide()
        const { shared, route } = this.props
        this.setState({ address: route?.params?.address ? route?.params?.address : '' })
        if (shared?.selectedAsset === 'ETH') {
            const eth = new ETH('ETH', 'mainnet')
            eth.getGasData()
                .then((data) => {
                    console.log(data)
                    this.setState({
                        gasLimit: data?.gasLimit,
                        gasPrice: data?.gasPrice
                    })
                })
        } else if (shared?.selectedAsset === 'BNB') {
            const bnb = new BNB('BNB', 'mainnet')
            bnb.getGasData()
                .then((data) => {
                    console.log(data)
                    this.setState({
                        gasLimit: data?.gasLimit,
                        gasPrice: data?.gasPrice
                    })
                })
        }


    }


    handleAddressChange = (value) => {
        const { shared } = this.props
        let addressIsInvalid = false

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


    handleMaxBtn = async () => {
        console.log('MAX_AMOUNT_BTN')
        const { publicKeys, shared, balances } = this.props
        const balance = balances[publicKeys[shared.selectedAsset]] !== undefined ? BigNumber(balances[publicKeys[shared.selectedAsset]].total_balance) : 0
        const { gasLimit, gasPrice, satsPerByte } = this.state
        let netAmount = 0
        let fees = 0

        if (balance === 0) {
            this.setState({ amount: 0 })
            return
        }

        if (shared.selectedAsset === 'BTC') {
            fees = await BTC.estimateFees(publicKeys[shared.selectedAsset], satsPerByte)
        } else if (shared.selectedAsset === 'ETH') {
            fees = (parseFloat(gasPrice) * parseFloat(parseInt(gasLimit) / parseInt(1000000000)))
        }

        netAmount = balance.minus(fees)
        console.log(fees)
        this.setState({ amount: netAmount.toString() })
    }

    handleSendBtn = async () => {
        console.log('SEND_BTN')
        const { navigation, publicKeys, shared, balances } = this.props
        const balance = balances[publicKeys[shared.selectedAsset]] !== undefined ? BigNumber(balances[publicKeys[shared.selectedAsset]].total_balance) : 0
        let { address, amount, fromShard, gasPrice, gasLimit, satsPerByte } = this.state

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

        let maxAmount = 0
        let fees = 0

        if (shared.selectedAsset === 'ETH') {
            fees = gasPrice.times(gasLimit.div(1000000000))
        } else if (shared.selectedAsset === 'BTC') {
            fees = await BTC.estimateFees(publicKeys[shared.selectedAsset], satsPerByte)
        }

        maxAmount = balance.minus(fees)

        if (!amount || amount.lte(0) || !balance || balance.lte(0) || amount.gt(maxAmount)) {
            Alert.alert('Error', `Not enough balance on shard ${fromShard}`, [{ text: 'OK' }])
            return
        }

        const txConfirmationText = <View>
            <Text style={styles.txConfirmationText}>{`You are sending ${amount.toString()} ${shared.selectedAsset} to:`} </Text>
            <Text style={{ ...styles.txConfirmationText, fontSize: 10 }}>{address}</Text>
        </View>
        navigation.push('ConfirmTx', { txConfirmationText, handleSendTx: this.handleSendTx })
    }

    handleSendTx = async () => {
        console.log('SEND_TX')
        const { distpach, wallet, navigation, shared } = this.props
        const { address, amount, gasLimit, gasPrice, satsPerByte } = this.state

        let tx

        if (shared.selectedAsset === 'ETH') {
            try {
                const eth = new ETH('ETH', 'mainnet')
                tx = await eth.send(address, amount.toString(), wallet.ETH)
            } catch (e) {
                console.log('TX: ', e)
                navigation.replace('TxComplete', { txStatus: 'ERROR', message: tx.message })
                return
            }
        } else if (shared.selectedAsset === 'BNB') {
            try {
                const bnb = new BNB('BNB', 'mainnet')
                tx = await bnb.send(address, amount.toString(), wallet.BNB)
            } catch (e) {
                console.log('TX: ', e)
                navigation.replace('TxComplete', { txStatus: 'ERROR', message: tx.message })
                return
            }
        } else if (shared.selectedAsset === 'BTC') {
            try {
                tx = await BTC.send(address, amount.toString(), wallet.BTC, satsPerByte)
            } catch (e) {
                console.log('TX: ', e)
                navigation.replace('TxComplete', { txStatus: 'ERROR', message: tx.message })
                return
            }
        }

        console.log('TX: ', tx)
        navigation.replace('TxComplete', { txStatus: tx.status, message: tx.message, explorerUrl: `${ASSETS[shared.selectedAsset].explorer_url}${tx.payload}` })
    }

    handleSatsPerByteChange = (satsPerByte) => this.setState({ satsPerByte: satsPerByte })

    handleToShardChange = (value) => {
        this.setState({ toShard: value })
    }

    render() {
        const { publicKeys, shared, balances } = this.props
        const balance = balances[publicKeys[shared.selectedAsset]] !== undefined ? parseFloat(balances[publicKeys[shared.selectedAsset]].total_balance) : 0
        const { address, amount, addressIsInvalid, gasPrice, gasLimit, satsPerByte } = this.state

        const amountIsInvalid = parseFloat(amount) > balance ? true : false

        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" />

                <View style={styles.formContainer}>


                    <View style={styles.balancesContainer}>
                        <Text style={styles.formLabel}>Available balance</Text>
                        <View style={{ flexDirection: 'row', }}>
                            <Text style={styles.text}>{balance} {shared.selectedAsset} </Text>
                            <Text style={{ ...styles.sm_text, paddingTop: 3, paddingLeft: 5 }}></Text>

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
                        <Text style={styles.formLabel}>Amount {shared.selectedAsset}</Text>
                        <TextInputWithBtn
                            placeholder="Amount"
                            value={this.state.amount}
                            onChangeText={this.handleAmountChange}
                            icon={<Text style={{ ...styles.formLabel, paddingTop: 4 }}>MAX</Text>}
                            onIconBtnPressed={this.handleMaxBtn}
                            isInvalid={amountIsInvalid}
                            keyboardType="numeric"
                        />
                        {amountIsInvalid && <Text style={{ ...styles.sm_text, color: 'red', marginTop: 2 }}>Not enough balance</Text>}
                    </View>


                    <ScrollView>
                        <View style={styles.detailsContainer}>
                            <Text style={styles.formLabel}>Transaction Details</Text>

                            <Text style={styles.text}>Sending {amount ? amount : '0'} {shared.selectedAsset} to:</Text>
                            <Text style={styles.text}>{address}</Text>
                            {
                                shared.selectedAsset === 'BTC'
                                    ?
                                    <View style={{ marginTop: 10, width: Dimensions.get('window').width * 0.4, alignItems: 'flex-start', }}>

                                        <Text style={styles.formLabel}>Sats Per Byte</Text>
                                        <Text style={styles.text}>{satsPerByte}</Text>
                                        <View style={{ width: '100%' }}>
                                            <Slider
                                                style={{ width: '100%', height: 40, marginLeft: -15 }}
                                                minimumValue={10}
                                                maximumValue={100}
                                                minimumTrackTintColor="black"
                                                maximumTrackTintColor="#000000"
                                                thumbTintColor="#3ACCDC"
                                                step={1}
                                                value={satsPerByte}
                                                onValueChange={this.handleSatsPerByteChange}
                                            />
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 30, marginTop: -10 }}>
                                                <Text style={styles.sm_text}>Slow</Text>
                                                <Text style={styles.sm_text}>Priority</Text>
                                            </View>
                                        </View>

                                    </View>
                                    :
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
                            }

                        </View>
                    </ScrollView>

                </View>

                <View style={{ width: '100%', paddingHorizontal: 20, paddingBottom: 20 }}>
                    <PrimaryBtn onPress={this.handleSendBtn} title='Send' />
                </View>

            </SafeAreaView >
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
        paddingTop: 20,
        marginTop: 30,
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

function mapStateToProps({ wallet, shared, balances }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        balances,
        wallet: wallet && wallet.wallet,
    }
}

export default connect(mapStateToProps)(SendView)