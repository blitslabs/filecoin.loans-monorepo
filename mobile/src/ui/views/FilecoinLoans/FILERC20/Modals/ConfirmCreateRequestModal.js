import React, { Component, Fragment } from 'react'

import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar, StyleSheet, Keyboard, TouchableOpacity, Alert, ScrollView } from 'react-native'

// Components
import PrimaryBtn from '../../../../components/PrimaryBtn'
import BlitsBtn from '../../../../components/BlitsBtn'
import SecondaryBtn from '../../../../components/SecondaryBtn'
import MyTextInput from '../../../../components/MyTextInput'

// Libraries
import { Gravatar, GravatarApi } from 'react-native-gravatar'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import { ASSETS } from '../../../../../crypto/index'
import BigNumber from 'bignumber.js'
import Modal from 'react-native-modal'
import ImageLoad from 'react-native-image-placeholder'
import { API } from "@env"

// Actions
import { updatePreTxData } from '../../../../../actions/prepareTx'

class ConfirmCreateRequestModal extends Component {

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
            isVisible, onClose, onConfirmBtn,
            tx, ammSettings, defiSettings, prepareTx
        } = this.props

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


                <SafeAreaView style={styles.wrapper}>
                    <View style={styles.draggerWrapper}>
                        <View style={styles.dragger} />
                    </View>
                    {/* <View style={{ alignItems: 'center', paddingVertical: 10, marginTop: 10 }}>
                                <Image style={{ height: 60, width: 60 }} source={
                                    image === 'CAKE'
                                        ? require('../../../../../assets/images/cake_logo.png')
                                        : image === 'Horizon'
                                            ? require('../../../../../assets/images/vaporwave.png')
                                            : require('../../../../../assets/images/blits_sym.png')} />
                            </View> */}
                    <View style={styles.titleWrapper}>
                        <Text style={styles.title}>
                            Loan Request Details
                        </Text>

                        {/* <View style={{ paddingHorizontal: 28, marginTop: 10 }}>
                            <Text style={{ fontFamily: 'Poppins-Light', fontSize: 12, textAlign: 'center' }}>
                                Output is estimated. If the price changes by more than {ammSettings?.userSlippageTolerance}% your transaction will revert.
                            </Text>
                        </View> */}
                    </View>


                    <View style={styles.txDetailsContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Loan Principal</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <ImageLoad
                                    source={{ uri: `${API}/static/logo/FIL` }}
                                    placeholderSource={require('../../../../../../assets/images/ERC20.png')}
                                    placeholderStyle={{ height: 24, width: 24, }}
                                    // borderRadius={25}
                                    style={{ height: 24, width: 24, borderRadius: 25 }}
                                />
                                <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
                                    <Text style={{ fontFamily: 'Poppins-Regular' }}>{parseFloat(prepareTx.principalAmount).toFixed(6)} FIL</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Interest</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <ImageLoad
                                    source={{ uri: `${API}/static/logo/FIL` }}
                                    placeholderSource={require('../../../../../../assets/images/ERC20.png')}
                                    placeholderStyle={{ height: 24, width: 24, }}
                                    // borderRadius={25}
                                    style={{ height: 24, width: 24, borderRadius: 25 }}
                                />
                                <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
                                    <Text style={{ fontFamily: 'Poppins-Regular' }}>{parseFloat(prepareTx?.interestAmount).toFixed(6)} FIL</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Collateral</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <ImageLoad
                                    source={{ uri: `${API}/static/logo/${prepareTx.collateralAsset}` }}
                                    placeholderSource={require('../../../../../../assets/images/ERC20.png')}
                                    placeholderStyle={{ height: 24, width: 24, }}
                                    // borderRadius={25}
                                    style={{ height: 24, width: 24, borderRadius: 25 }}
                                />
                                <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
                                    <Text style={{ fontFamily: 'Poppins-Regular' }}>{parseFloat(prepareTx.collateralAmount).toFixed(6)} {prepareTx.collateralAsset}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: '#e1e4e8', marginVertical: 10 }}></View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Duration</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontFamily: 'Poppins-Regular' }}>{prepareTx?.loanDuration}d</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Collateralization Ratio</Text>
                            </View>
                            <Text style={{ fontFamily: 'Poppins-Regular' }}>150%</Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Liquidation Price</Text>
                            </View>
                            <Text style={{ fontFamily: 'Poppins-Regular' }}>${parseFloat(prepareTx?.liquidationPrice).toFixed(2)} </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 15, marginTop: 15 }}>
                        <View style={{ flex: 1 }}>
                            <SecondaryBtn title="Cancel" onPress={() => onClose()} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <BlitsBtn title="Continue" onPress={() => onConfirmBtn()} style={{ backgroundColor: '#0062FF' }} />
                        </View>
                    </View>
                </SafeAreaView>


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
        marginTop: 20,
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
        marginTop: 20,
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

function mapStateToProps({ loanRequest, tokens, shared, wallet, prepareTx, balances, prices, defiSettings, ammSettings }) {
    return {
        loanRequest,
        tokens,
        shared,
        wallet: wallet && wallet.wallet,
        publicKeys: wallet && wallet.publicKeys,
        prepareTx,
        balances,
        prices,
        defiSettings,
        ammSettings
    }
}

export default connect(mapStateToProps)(ConfirmCreateRequestModal)