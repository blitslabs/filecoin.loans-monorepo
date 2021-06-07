import React, { Component, Fragment } from 'react'

import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar, StyleSheet, Keyboard, TouchableOpacity, Alert, ScrollView } from 'react-native'

// Components
import PrimaryBtn from './PrimaryBtn'
import BlitsBtn from './BlitsBtn'
import SecondaryBtn from './SecondaryBtn'
import MyTextInput from './MyTextInput'

// Libraries
import { Gravatar, GravatarApi } from 'react-native-gravatar'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import { ASSETS } from '../../crypto/index'
import BigNumber from 'bignumber.js'
import Modal from 'react-native-modal'

// Actions
import { updatePreTxData } from '../../actions/prepareTx'

class ConfirmTxModal extends Component {

    state = {
        allowanceScreen: true,
        amount: '',
        gasLimit: '',
        gasPrice: '',
        total: '',
        fee: '',
        gasIsInvalid: false,
        gasErrorMsg: 'Invalid gas price',
        saveGasBtnDisable: false,
        balance: '',
        amount: ''
    }

    componentDidMount() {
        const { prepareTx, publicKeys, balances, amount } = this.props
        const { blockchain, gasLimit, gasPrice } = prepareTx

        this.checkGas(gasPrice, gasLimit)


    }

    handleGasLimitChange = (value) => {
        const { gasPrice, gasLimit } = this.state
        this.checkGas(gasPrice, value)
    }

    handleGasPriceChange = (value) => {
        const { gasPrice, gasLimit } = this.state
        this.checkGas(value, gasLimit)
    }

    checkGas = (gasPrice, gasLimit) => {
        const { publicKeys, balances, prepareTx } = this.props
        const { blockchain, amount } = prepareTx
        const account = publicKeys[blockchain]
        const balance = balances[account] !== undefined ? BigNumber(balances[account].total_balance) : BigNumber(0)

        if (!gasPrice || gasPrice == 0) {
            this.setState({
                gasPrice: 0, gasIsInvalid: true,
                gasErrorMsg: 'Invalid gas price',
                saveGasBtnDisable: true
            })
            return
        }

        if (!gasLimit || gasLimit == 0) {
            this.setState({
                gasLimit: 0, gasIsInvalid: true,
                gasErrorMsg: 'Invalid gas limit',
                saveGasBtnDisable: true
            })
            return
        }

        gasPrice = BigNumber(gasPrice)
        gasLimit = BigNumber(gasLimit)

        const fee = BigNumber(gasLimit).div(1000000000).times(gasPrice)
        const total = fee.plus(amount)

        if (balance.lt(total)) {
            this.setState({
                gasLimit: gasLimit.toString(), gasPrice: gasPrice.toString(),
                gasIsInvalid: true, gasErrorMsg: 'Insufficient balance',
                saveGasBtnDisable: true, fee: fee.toString()
            })
            return
        }

        this.setState({
            fee: fee.toString(),
            gasPrice: gasPrice.toString(), gasLimit: gasLimit.toString(),
            gasIsInvalid: false, saveGasBtnDisable: false
        })
    }

    handleSaveBtn = () => {
        console.log('SAVE_GAS_BTN')
        const { dispatch } = this.props
        let { gasLimit, gasPrice, fee } = this.state
        gasLimit = BigNumber(gasLimit)
        gasPrice = BigNumber(gasPrice)

        if (!gasLimit || !gasPrice || gasLimit.lte(0) || gasPrice.lte(0)) {
            Alert.alert('Error', `Invalid gas value`, [{ text: 'OK' }])
            return
        }

        dispatch(updatePreTxData({
            gasPrice: gasPrice.toString(),
            gasLimit: gasLimit.toString(),
            fee
        }))

        this.setState({
            allowanceScreen: true
        })
    }

    render() {

        const {
            prepareTx, balances, publicKeys, prices, isVisible, onClose, onConfirmBtn
        } = this.props

        const {
            contractName, operation, description, blockchain, amount, image
        } = prepareTx

        const { fee, gasLimit, gasPrice, gasIsInvalid, gasErrorMsg } = this.state

        const account = publicKeys[blockchain]
        const balance = balances[account] !== undefined ? parseFloat(balances[account].total_balance) : 0
        const price = prices[blockchain] !== undefined ? parseFloat(prices[blockchain].usd) : 0
        const balanceValue = (price * balance).toFixed(1)
        const total = parseFloat(amount) + parseFloat(fee)
        const totalValue = (total * price).toFixed(4)

        return (
            <Modal
                isVisible={isVisible}
                onSwipeComplete={onClose}
                onBackButtonPress={onClose}
                swipeDirection={'down'}
                propagateSwipe
                style={styles.bottomModal}
                animationIn='slideInUp'
                animationOut='slideOutDown'
            >
                {
                    this.state.allowanceScreen
                        ?
                        <SafeAreaView style={styles.wrapper}>
                            <View style={styles.draggerWrapper}>
                                <View style={styles.dragger} />
                            </View>
                            <View style={{ alignItems: 'center', paddingVertical: 10, marginTop: 10 }}>
                                <Image style={{ height: 60, width: 60 }} source={require('../../../assets/images/blits_sym.png')} />
                            </View>
                            <View style={styles.titleWrapper}>
                                <Text style={styles.title}>
                                    {contractName}
                                </Text>
                                <View style={{ flexDirection: 'row', marginTop: -5 }}>
                                    <FontAwesome name="circle" color="#32d832" size={8} style={{ marginTop: 6 }} />
                                    <Text style={{ fontFamily: 'Poppins-Regular' }}> {ASSETS[blockchain]?.name}</Text>
                                </View>
                                <View style={{ marginTop: 5, borderColor: 'grey', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 0 }}>
                                    <Text style={{ fontSize: 10, fontFamily: 'Poppins-Light' }}>{operation}</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 5 }}>
                                <Text style={{ fontFamily: 'Poppins-Regular' }}>{description}</Text>
                            </View>
                            <View style={styles.accountContainer}>
                                <View style={styles.avatarContainer}>
                                    <Gravatar options={{
                                        email: account,
                                        parameters: { "size": "200", "d": "retro" },
                                        secure: true,

                                    }}
                                        style={styles.roundedProfileImage} />
                                </View>
                                <View style={styles.accountTextContainer}>
                                    <Text style={styles.accountText}>Account ({account?.substring(0, 15)}...)</Text>
                                    <Text style={styles.balanceText}>Balance ${balanceValue} ({balance} {blockchain})</Text>
                                </View>
                            </View>

                            <View style={styles.txDetailsContainer}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Amount</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular' }}>{amount} {blockchain}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Network fee </Text>
                                        <TouchableOpacity
                                            onPress={() => this.setState({ allowanceScreen: false })}
                                        >
                                            <Text style={{ ...styles.textLink, paddingLeft: 5, paddingTop: 2 }}>Edit</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={{ fontFamily: 'Poppins-Regular' }}>{fee} {blockchain}</Text>
                                </View>
                                <View style={{ borderWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e1e4e8', marginVertical: 10 }}></View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Total Amount</Text>
                                    <View>
                                        <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'right' }}>{total} {blockchain}</Text>
                                        <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'right' }}>${totalValue}</Text>
                                    </View>
                                </View>
                            </View>
                            {
                                gasIsInvalid
                                    ?
                                    <View style={{ marginTop: 0, alignItems: 'center', backgroundColor: '#d6029a36', marginHorizontal: 25, borderColor: '#d6029a', borderWidth: StyleSheet.hairlineWidth, borderRadius: 5, paddingVertical: 5, paddingHorizontal: 10 }}>
                                        <Text style={{ fontFamily: 'Poppins-Regular', color: '#d6029a', fontSize: 12 }}>{gasErrorMsg}</Text>
                                    </View>
                                    : null
                            }
                            <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 15, marginTop: 15 }}>
                                <View style={{ flex: 1 }}>
                                    <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <BlitsBtn title="Confirm" onPress={() => onConfirmBtn()} />
                                </View>
                            </View>
                        </SafeAreaView>
                        :
                        <SafeAreaView style={styles.wrapper}>
                            <View style={{ flexDirection: 'row', marginBottom: 10, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
                                <View style={{ position: 'absolute', left: 12 }}>
                                    <TouchableOpacity
                                        onPress={() => this.setState({ allowanceScreen: true })}
                                    >
                                        <IconMaterialCommunity name="chevron-left" size={30} color="black" />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Edit Network Fee</Text>
                                </View>
                            </View>
                            <View style={{ marginBottom: 20 }}>
                                <View style={{ flexDirection: 'row', marginHorizontal: 20 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'Poppins-Regular' }}>Total</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold' }}>{fee} {blockchain}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'Poppins-Regular' }}>Gas Limit</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <MyTextInput value={gasLimit} onChangeText={this.handleGasLimitChange} keyboardType="numeric" style={{ height: 30, paddingTop: 5, paddingBottom: 2, paddingLeft: 8 }} />
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'Poppins-Regular' }}>Gas Price: (GWEI)</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <MyTextInput value={gasPrice} onChangeText={this.handleGasPriceChange} keyboardType="numeric" style={{ height: 30, paddingTop: 5, paddingBottom: 2, paddingLeft: 8 }} />
                                    </View>
                                </View>
                                {
                                    gasIsInvalid
                                        ?
                                        <View style={{ marginTop: 20, alignItems: 'center', backgroundColor: '#d6029a36', marginHorizontal: 20, borderColor: '#d6029a', borderWidth: StyleSheet.hairlineWidth, borderRadius: 5, paddingVertical: 5, paddingHorizontal: 10 }}>
                                            <Text style={{ fontFamily: 'Poppins-Regular', color: '#d6029a', fontSize: 12 }}>{gasErrorMsg}</Text>
                                        </View>
                                        : null
                                }
                            </View>
                            <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
                                <BlitsBtn title="Save" onPress={() => this.handleSaveBtn()} disabled={this.state.saveGasBtnDisable} />
                            </View>
                        </SafeAreaView>
                }
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0
    },
    wrapper: {
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    draggerWrapper: {
        width: '100%',
        height: 33,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgb(229, 229, 229)'
    },
    dragger: {
        width: 48,
        height: 5,
        borderRadius: 4,
        backgroundColor: 'grey',
        opacity: 0.5
    },
    titleWrapper: {
        marginTop: 0,
        alignItems: 'center'
    },
    title: {
        fontFamily: 'Poppins-SemiBold',
        color: 'black',
        fontSize: 18,
        flexDirection: 'row',
        alignSelf: 'center'
    },
    accountContainer: {
        flexDirection: 'row', alignItems: 'center',
        borderColor: 'grey', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 10,
        paddingVertical: 8,
        marginVertical: 5
    },
    avatarContainer: {
        flex: 2,
    },
    accountTextContainer: {
        flexDirection: 'column',
        flex: 10,
        paddingLeft: 5
    },
    roundedProfileImage: {
        width: 50, height: 50, borderWidth: 0,
        borderColor: 'white', borderRadius: 50,
    },
    accountText: {
        fontFamily: 'Poppins-SemiBold',
    },
    balanceText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginTop: -3
    },
    txDetailsContainer: {

        borderColor: 'grey', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15
    },
    textLink: {
        fontFamily: 'Poppins-SemiBold',
        color: '#32CCDD',
        fontSize: 12,
    }
})

function mapStateToProps({ loanRequest, tokens, shared, wallet, prepareTx, balances, prices }) {
    return {
        loanRequest,
        tokens,
        shared,
        wallet: wallet && wallet.wallet,
        publicKeys: wallet && wallet.publicKeys,
        prepareTx,
        balances,
        prices
    }
}

export default connect(mapStateToProps)(ConfirmTxModal)