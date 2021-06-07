import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Linking
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
import { FilecoinSigner } from '@blitslabs/filecoin-js-signer'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import FilecoinLogo from '../../../../../../assets/images/filecoin-logo.svg'

// SVG
import TxSubmitted from '../../../../../../assets/images/tx_submitted.svg'


// Actions
import { saveFLTx } from '../../../../../actions/filecoinLoans'

// API
import { confirmSignedVoucher } from '../../../../../utils/filecoin_loans'

class SignWithdrawVoucherModal extends Component {

    state = {
        modalState: 0,
        signLoading: false,
    }


    componentDidMount() {
    }

    handleConfirmBtn = async () => {

        const { loanDetails, wallet, dispatch } = this.props

        this.setState({ signLoading: true })

        const filecoin_signer = new FilecoinSigner()

        // Create Voucher
        let voucher
        try {
            voucher = await filecoin_signer.paych.createVoucher(
                loanDetails?.filLoan?.paymentChannelId,
                0, // timeLockMin
                0, // timeLockMax
                loanDetails?.collateralLock?.secretHashA1?.replace('0x', ''), // secretHash
                BigNumber(loanDetails?.filLoan?.principalAmount).multipliedBy(1e18),
                0, // lane
                0, // voucherNonce
                0, // minSettleHeight
            )
        } catch (e) {
            console.log(e)
            Alert.alert('Error', 'Error creating voucher', [{ text: 'OK' }])
            this.setState({ signLoading: false })
            return
        }

        // Sign Voucher
        let signedVoucher
        try {
            signedVoucher = await filecoin_signer.paych.signVoucher(voucher, wallet?.FIL?.privateKey)
        } catch (e) {
            console.log(e)
            Alert.alert('Error', 'Error signing voucher', [{ text: 'OK' }])
            this.setState({ signLoading: false })
            return
        }

        // Save Signed Voucher
        this.confirmOpInterval = setInterval(async () => {

            confirmSignedVoucher({ signedVoucher: signedVoucher, paymentChannelId: loanDetails?.filLoan?.paymentChannelId })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res?.status === 'OK') {

                        clearInterval(this.confirmOpInterval)

                        // Show Toast

                        // Save FL Tx
                        dispatch(saveFLTx({
                            receipt: { signedVoucher: signedVoucher, paymentChannelId: loanDetails?.filLoan?.paymentChannelId },
                            txHash: signedVoucher,
                            from: publicKeys?.FIL,
                            summary: `Signed a Voucher of ${loanDetails?.filLoan?.principalAmount} FIL for Payment Channel ${loanDetails?.filLoan?.paymentChannelId}`
                        }))

                        this.setState({ modalState: 1 })
                    }
                })

        }, 3000)

    }

    render() {

        const {
            isVisible, onClose, loanDetails, publicKeys, balances, prepareTx, prices,
            handleCloseModal, handleConfirmBtn
        } = this.props

        const {
            modalState, signLoading
        } = this.state

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
                            {/* <View style={styles.draggerWrapper}>
                                <View style={styles.dragger} />
                            </View> */}

                            <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                <Text style={styles.title}>
                                    Sign FIL Voucher
                                </Text>

                            </View>


                            <View style={styles.txDetailsContainer}>


                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataDescription}>You are signing a FIL Voucher to allow the Borrower to withdraw the loan's principal.</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataValue}>• The Borrower has linked his collateral to your offer, and you'll now be able to seize part of the collateral in case of default.</Text>
                                    <Text style={styles.dataValue}>• The Borrower needs a signed voucher to withdraw funds from the FIL Payment Channel.</Text>
                                    <Text style={styles.dataValue}>• The Voucher requires the Borrower to reveal his secretA1 in order to be redeemed.</Text>
                                    <Text style={styles.dataValue}>• The secretA1 will allow you to seize part of the Borrower's collateral if he fails to pay back the loan.</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Borrower's Secret Hash A1</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.collateralLock?.secretHashA1}</Text>
                                </View>

                            </View>

                            <View style={styles.btnsContainer}>
                                <View style={{ flex: 1 }}>
                                    <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <BlitsBtn disabled={signLoading} style={!signLoading ? { backgroundColor: '#0062FF' } : { backgroundColor: '#0062ff8c' }} title={signLoading ? 'Signing...' : "Sign Voucher"} onPress={() => this.handleConfirmBtn()} />
                                </View>
                            </View>
                        </SafeAreaView>
                        :
                        modalState === 1 ?
                            <SafeAreaView style={styles.wrapper}>

                                <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.title}>
                                            Sign Voucher
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                    <TxSubmitted width={100} height={100} />
                                </View>
                                <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Voucher Signed</Text>
                                    {/* <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#0062FF', marginVertical: 5 }}>View on Explorer</Text> */}
                                    <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have signed a voucher to allow the Borrower to withdraw the loan's principal. The Borrower will now be able to withdraw the locked FIL funds and has until the loan expiration date to pay them back.</Text>
                                    {/* <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text> */}
                                </View>
                                <View style={styles.btnsContainer}>
                                    <View style={{ flex: 1 }}>
                                        <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Close" onPress={() => onClose()} />
                                    </View>
                                </View>
                            </SafeAreaView>
                            : <View></View>


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
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
    },
    btnsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 15,
        marginTop: 15,
        borderTopWidth: 0.5,
        borderColor: 'rgb(229, 229, 229)',
        paddingTop: 20
    },
    description: {
        fontFamily: 'Poppins-Light',
        fontSize: 12
    }
})


function mapStateToProps({ tokens, balances, wallet, prepareTx, prices, filecoinLoans }, ownProps) {
    return {
        tokens,
        balances,
        publicKeys: wallet?.publicKeys,
        wallet: wallet?.wallet,
        prepareTx,
        prices,
        filecoinLoans,
        loanDetails: filecoinLoans?.loanDetails['FIL'][ownProps?.loanId],
        chainId: filecoinLoans?.loanDetails['FIL'][ownProps?.loanId]?.collateralLock?.networkId,
        blockchain: filecoinLoans?.loanDetails['FIL'][ownProps?.loanId]?.collateralLock?.blockchain,
    }
}

export default connect(mapStateToProps)(SignWithdrawVoucherModal)