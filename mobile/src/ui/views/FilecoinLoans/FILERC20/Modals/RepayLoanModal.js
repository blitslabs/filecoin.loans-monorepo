import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Image
} from 'react-native'

// Components
import BlitsBtn from '../../../../components/BlitsBtn'
import SecondaryBtn from '../../../../components/SecondaryBtn'
import MyTextInput from '../../../../components/MyTextInput'

// Libraries
import Modal from 'react-native-modal'
import ImageLoad from 'react-native-image-placeholder'
import { ASSETS } from '../../../../../crypto/index'
import { Gravatar } from 'react-native-gravatar'
import BigNumber from 'bignumber.js'
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps'
import {
    WaveIndicator,
} from 'react-native-indicators'
// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import FilecoinLogo from '../../../../../../assets/images/filecoin-logo.svg'

// SVG
import TxSubmitted from '../../../../../../assets/images/tx_submitted.svg'

class LendFILModal extends Component {

    state = {
        gasLimit: '',
        gasPrice: '',
        total: '',
        fee: '',
        gasIsInvalid: false,
        gasErrorMsg: 'Invalid gas price',
        saveGasBtnDisable: false,
        showTxDetailsScreen: true,
        modalState: 1
    }


    componentDidMount() {
        const { prepareTx } = this.props
        const { gasLimit, gasPrice } = prepareTx



    }


    test = async () => {
        // const filecoin_signer = 
        const privateKey = Buffer.from('ilyMrATTpGhtEpZ4zbyA+FiTH3JcgvL7ela/uqDzcIs=', 'base64')
        const recoveredKey = filecoin_signer.keyRecover(privateKey, true)
        console.log(recoveredKey.address)
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

    render() {

        const {
            isVisible, onClose, publicKeys, balances, prepareTx, prices,
            handleCloseModal, handleConfirmBtn
        } = this.props

        const {
            fee, gasLimit, gasPrice, gasIsInvalid, gasErrorMsg, showTxDetailsScreen, modalState
        } = this.state

        const {
            contractName, operation, description, blockchain, amount, image
        } = prepareTx

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
                    modalState === 0
                        ?
                        <SafeAreaView style={styles.wrapper}>

                            <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                <Text style={styles.title}>
                                    Repay Loan
                                </Text>
                            </View>

                            <View style={{ marginBottom: 130 }}>
                                <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                    <ProgressStep label="Create Pay. Channel" removeBtnRow={true} >
                                        <View style={{ alignItems: 'center' }}>
                                            <Text>Create Pay. Channel</Text>
                                        </View>
                                    </ProgressStep>
                                    <ProgressStep label="Sign Voucher" >
                                        <View style={{ alignItems: 'center' }} removeBtnRow={true}>
                                            <Text>Sign Voucher</Text>
                                        </View>
                                    </ProgressStep>

                                </ProgressSteps>
                            </View>

                            <View style={styles.txDetailsContainer}>
                                <View style={{}}>
                                    <Text style={styles.dataDescription}>You are creating a Payment Channel with the Lender to pay off your debt of 1.00827752 FIL</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataValue}>• You are transferring and locking 1.00827752 FIl into a Payment Channel contract.</Text>
                                    <Text style={styles.dataValue}>• Once created, you'll have to create and sign a Voucher to allow the Lender to accept the payback.</Text>
                                    <Text style={styles.dataValue}>• When the payback is accepted, the Lender will reveal secretB1, which will allow you to unlock your collateral.</Text>
                                    <Text style={styles.dataValue}>• If the Borrower fails to accept the payback before the loan's expiration date, you'll be able to refund the payback and unlock part of your collateral.</Text>
                                </View>
                            </View>

                            <View style={styles.btnsContainer}>
                                <View style={{ flex: 1 }}>
                                    <SecondaryBtn title="Reject" onPress={() => handleCloseModal()} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Confirm" onPress={() => handleConfirmBtn()} />
                                </View>
                            </View>
                        </SafeAreaView>
                        :
                        modalState === 1 ?
                            <SafeAreaView style={styles.wrapper}>

                                <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                    <Text style={styles.title}>
                                        Repay Loan
                                    </Text>
                                </View>

                                <View style={{ marginBottom: 130 }}>
                                    <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                        <ProgressStep label="Create Pay. Channel" removeBtnRow={true} >
                                            <View style={{ alignItems: 'center' }}>
                                                <Text>Create Pay. Channel</Text>
                                            </View>
                                        </ProgressStep>
                                        <ProgressStep label="Sign Voucher" removeBtnRow={true}>
                                            <View style={{ alignItems: 'center' }} >
                                                <Text>Sign Voucher</Text>
                                            </View>
                                        </ProgressStep>

                                    </ProgressSteps>
                                </View>

                                <View style={styles.txDetailsContainer}>
                                    <View style={{}}>
                                        <Text style={styles.dataDescription}>You are creating a Payment Channel with the Lender to pay off your debt of 1.00827752 FIL</Text>
                                    </View>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataValue}>• The Lender needs a signed voucher to withdraw funds from the FIL Payment Channel.</Text>
                                        <Text style={styles.dataValue}>• The Voucher requires the Lender to reveal his secretB1 in order to be redeemed.</Text>
                                        <Text style={styles.dataValue}>• The secretB1 will allow you to unlock your collateral.</Text>
                                    </View>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataTitle}>Lender's Hash B1</Text>
                                        <Text style={styles.dataValue}>0xf2031411b6437ee0f2d9e3067dde760c96a34b08335c6cccca344974194fb34d</Text>
                                    </View>
                                </View>

                                <View style={styles.btnsContainer}>
                                    <View style={{ flex: 1 }}>
                                        <SecondaryBtn title="Reject" onPress={() => handleCloseModal()} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Confirm" onPress={() => handleConfirmBtn()} />
                                    </View>
                                </View>
                            </SafeAreaView>
                            :
                            modalState === 2
                                ?
                                <SafeAreaView style={styles.wrapper}>

                                    <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.title}>
                                                Lend FIL
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ height: 200, marginTop: 20 }}>
                                        <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                                    </View>
                                    <View style={{ alignItems: 'center', marginBottom: 50, marginHorizontal: 40 }}>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Waiting For Confirmations</Text>
                                        <Text style={{ fontFamily: 'Poppins-Regular' }}>Creating a Payment Channel of X FIL</Text>
                                        <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text>
                                    </View>
                                </SafeAreaView>
                                :
                                <SafeAreaView style={styles.wrapper}>

                                    <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.title}>
                                                Lend FIL
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                        <TxSubmitted width={100} height={100} />
                                    </View>
                                    <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Transaction Submitted</Text>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#0062FF', marginVertical: 5 }}>View on Explorer</Text>
                                        <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have created a Payment Channel with the Borrower.</Text>
                                        {/* <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text> */}
                                    </View>
                                    <View style={styles.btnsContainer}>
                                        <View style={{ flex: 1 }}>
                                            <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Close" onPress={() => handleConfirmBtn()} />
                                        </View>
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
    closeBtnContainer: {
        position: 'absolute',
        right: 10,
        top: 10,
        // backgroundColor: 'red',

    },
    modalTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18
    },
    wrapper: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: 'white',
        // height: '100%'
    },
    draggerWrapper: {
        width: '100%',
        height: 33,
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        // borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: 'grey'
    },
    dragger: {
        width: 48,
        height: 5,
        borderRadius: 4,
        backgroundColor: 'grey',
        opacity: 0.5
    },
    titleWrapper: {
        marginTop: 10,
        alignItems: 'center'
    },
    title: {
        fontFamily: 'Poppins-SemiBold',
        color: 'black',
        fontSize: 18,
        flexDirection: 'row',
        alignSelf: 'center'
    },
    tokenContainer: {
        flexDirection: 'row', alignItems: 'center',
        borderColor: 'transparent', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 10,
        paddingVertical: 8,
        marginVertical: 5
    },
    accountContainer: {
        flexDirection: 'row', alignItems: 'center',
        borderColor: 'grey', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 10,
        paddingVertical: 8,
        marginVertical: 10
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
        width: 50, height: 50, borderWidth: 3,
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

        // borderColor: 'grey', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 0
    },
    textLink: {
        fontFamily: 'Poppins-SemiBold',
        color: '#32CCDD',
        fontSize: 12,
    },
    dataTitle: {
        fontFamily: 'Poppins-Light',
        color: '#6F6F6F',
        fontSize: 12
    },
    dataValue: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
    },
    dataDescription: {
        fontFamily: 'Poppins-SemiBold'
    },
    btnsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 15,
        marginTop: 15,
        borderTopWidth: 0.5,
        borderColor: 'rgb(229, 229, 229)',
        paddingTop: 20
    }
})


function mapStateToProps({ tokens, balances, wallet, prepareTx, prices }) {
    return {
        tokens,
        balances,
        publicKeys: wallet?.publicKeys,
        prepareTx,
        prices
    }
}

export default connect(mapStateToProps)(LendFILModal)