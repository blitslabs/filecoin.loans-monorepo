import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Image, Linking
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
import Web3 from 'web3'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import FilecoinLogo from '../../../../../../assets/images/filecoin-logo.svg'

// SVG
import TxSubmitted from '../../../../../../assets/images/tx_submitted.svg'
import { FilecoinClient, FilecoinSigner } from '@blitslabs/filecoin-js-signer'

// Actions
import { saveFLTx } from '../../../../../actions/filecoinLoans'

// API
import { confirmPaybackPaymentChannel, confirmPaybackVoucher } from '../../../../../utils/filecoin_loans'

const web3 = new Web3()

class LendFILModal extends Component {

    state = {
        modalState: 0,
        singLoading: false,
        paybackLoading: false,
        repayAmount: 0
    }


    componentDidMount() {
        const { loanDetails } = this.props
        const interestAmountPeYear = BigNumber(loanDetails?.collateralLock?.interestRate).multipliedBy(loanDetails?.collateralLock?.principalAmount)
        const loanExpirationPeriod = BigNumber(loanDetails?.collateralLock?.loanExpirationPeriod).dividedBy(86400).minus(3)
        const interestAmountPeriod = interestAmountPeYear.dividedBy(365).multipliedBy(loanExpirationPeriod)
        const repayAmount = interestAmountPeriod.plus(loanDetails?.collateralLock?.principalAmount)
        console.log(parseFloat(repayAmount).toFixed(8))
        let modalState = 0
        if (!loanDetails?.filPayback?.state) modalState = 0
        else if (loanDetails?.filPayback?.state == 0) modalState = 3

        this.setState({
            repayAmount: parseFloat(repayAmount).toFixed(8),
            modalState,
        })
    }

    handleConfirmBtn = async () => {
        const { repayAmount } = this.state
        const { loanDetails, wallet, loanId, dispatch, chainId } = this.props

        this.setState({ modalState: 1 })

        // Prepare Payment Channel Data
        const filLender = loanDetails?.collateralLock?.filLender && loanDetails?.collateralLock?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.collateralLock?.filLender) : ''

        const filecoin_client = new FilecoinClient(ASSETS?.FIL?.mainnet_endpoints?.http, ASSETS?.FIL?.token)

        let tx
        try {
            tx = await filecoin_client.paych.createPaymentChannel(
                wallet?.FIL?.publicKey,
                filLender,
                BigNumber(repayAmount).multipliedBy(1e18),
                wallet?.FIL?.privateKey,
                ASSETS?.FIL?.network,
                true,
            )
            console.log(tx)
        } catch (e) {
            console.log(e)
            this.setState({ modalState: 0 })
            return
        }

        const paymentChannelId = tx?.ReturnDec?.IDAddress
        const paymentChannelAddress = tx?.ReturnDec?.RobustAddress

        let message, signature
        try {
            message = {
                loanId: loanId,
                contractLoanId: loanDetails?.collateralLock?.contractLoanId,
                erc20CollateralLock: loanDetails?.collateralLock?.collateralLockContractAddress,
                CID: tx?.Message,
                paymentChannelId,
                paymentChannelAddress,
                filLender,
                filBorrower: wallet?.FIL?.publicKey,
                secretHashB1: loanDetails?.collateralLock?.secretHashB1,
                repayAmount,
                network: ASSETS?.FIL?.network,
                collateralNetwork: loanDetails?.collateralLock?.networkId
            }

            const filecoin_signer = new FilecoinSigner()
            signature = filecoin_signer.utils.signMessage(JSON.stringify(message), wallet?.FIL?.privateKey)
        } catch (e) {
            console.log(e)
            Alert.alert('Error', 'Error signing message', [{ text: 'OK' }])
            this.setState({ modalState: 0 })
            return
        }
        console.log('message: ', message)
        console.log('signature: ', signature)

        this.confirmOpInterval = setInterval(async () => {
            confirmPaybackPaymentChannel({ assetType: 'FIL', message, signature })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // Show Toast

                        // Save Tx
                        dispatch(saveFLTx({
                            receipt: tx,
                            txHash: tx?.Message['/'],
                            from: wallet?.FIL?.publicKey,
                            summary: `Create a Payment Channel with ${filLender} to pay back ${repayAmount} FIL`
                        }))

                        // Send Message & signature to API
                        this.setState({ modalState: 2, txHash: tx?.Message['/'] })
                    }
                })
        }, 3000)
    }

    handleSignVoucherBtn = async () => {
        const { loanDetails, wallet, loanId, dispatch } = this.props
        const { repayAmount } = this.state

        this.setState({ signLoading: true })

        const filecoin_signer = new FilecoinSigner()

        const loanExpiration = BigNumber(loanDetails?.collateralLock?.loanExpiration).minus(259200).toString()

        let voucher
        try {
            // Create Voucher with TimeLockMax < LoanExpiration
            // TimeLockMax sets a max epoch beyond which the voucher cannot be redeemed
            voucher = await filecoin_signer.paych.createVoucher(
                loanDetails?.filPayback?.paymentChannelId, // paymentChannelId
                0, // timeLockMin
                parseInt(loanExpiration), // timeLockMax = loanExpiration
                loanDetails?.collateralLock?.secretHashB1?.replace('0x', ''), // secretHash
                BigNumber(repayAmount).multipliedBy(1e18), // amount
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
            confirmPaybackVoucher({ signedVoucher: signedVoucher, paymentChannelId: loanDetails?.filPayback?.paymentChannelId })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // Save Tx
                        dispatch(saveFLTx({
                            receipt: { signedVoucher: signedVoucher, paymentChannelId: loanDetails?.filPayback?.paymentChannelId },
                            txHash: signedVoucher,
                            from: wallet?.FIL?.publicKey,
                            summary: `Signed a Voucher of ${loanDetails?.filPayback?.amount} FIL for Payment Channel ${loanDetails?.filPayback?.paymentChannelId}`
                        }))

                        this.setState({ modalState: 4 })
                    }
                })
        }, 3000)
    }

    render() {

        const {
            isVisible, onClose, loanDetails,
            handleCloseModal, handleConfirmBtn,
        } = this.props

        const {
            modalState, repayAmount, paybackLoading, signLoading, txHash
        } = this.state

        const filLender = loanDetails?.collateralLock?.filLender && loanDetails?.collateralLock?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.collateralLock?.filLender) : '-'

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
                                    <Text style={styles.dataDescription}>You are creating a Payment Channel with the Lender to pay off your debt of {parseFloat(repayAmount).toFixed(8)} FIL</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataValue}>• You are transferring and locking {parseFloat(repayAmount).toFixed(8)} FIl into a Payment Channel contract.</Text>
                                    <Text style={styles.dataValue}>• Once created, you'll have to create and sign a Voucher to allow the Lender to accept the payback.</Text>
                                    <Text style={styles.dataValue}>• When the payback is accepted, the Lender will reveal secretB1, which will allow you to unlock your collateral.</Text>
                                    <Text style={styles.dataValue}>• If the Borrower fails to accept the payback before the loan's expiration date, you'll be able to refund the payback and unlock part of your collateral.</Text>
                                </View>
                            </View>

                            <View style={styles.btnsContainer}>
                                <View style={{ flex: 1 }}>
                                    <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <BlitsBtn disabled={paybackLoading} style={!signLoading ? { backgroundColor: '#0062FF' } : { backgroundColor: '#0062ff8c' }} title="Confirm" onPress={() => this.handleConfirmBtn()} />
                                </View>
                            </View>
                        </SafeAreaView>
                        :

                        modalState === 1 ?
                            <SafeAreaView style={styles.wrapper}>

                                <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.title}>
                                            Repay Loan
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ height: 200, marginTop: 20 }}>
                                    <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                                </View>
                                <View style={{ alignItems: 'center', marginBottom: 50, marginHorizontal: 40 }}>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Waiting For Confirmations</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>Creating a Payment Channel with {parseFloat(repayAmount).toFixed(8)} FIL</Text>
                                    <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text>
                                </View>
                            </SafeAreaView>
                            :

                            modalState === 2 ?
                                <SafeAreaView style={styles.wrapper}>

                                    <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.title}>
                                                Repay Loan
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                        <TxSubmitted width={100} height={100} />
                                    </View>
                                    <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Transaction Submitted</Text>
                                        <TouchableOpacity
                                            onPress={() => Linking.openURL(ASSETS?.FIL?.explorer_url + this.state.txHash)}
                                        >
                                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#0062FF', marginVertical: 5 }}>View on Explorer</Text>
                                        </TouchableOpacity>
                                        <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have crated a Payment Channel with the Lender, and now you need to create a voucher to complete the payback process.</Text>
                                        {/* <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text> */}
                                    </View>
                                    <View style={styles.btnsContainer}>
                                        <View style={{ flex: 1 }}>
                                            <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Next" onPress={() => this.setState({ modalState: 3 })} />
                                        </View>
                                    </View>
                                </SafeAreaView>
                                :
                                modalState === 3 ?
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
                                                <Text style={styles.dataValue}>{loanDetails?.collateralLock?.secretHashB1}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.btnsContainer}>
                                            <View style={{ flex: 1 }}>
                                                <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <BlitsBtn disabled={signLoading} style={!signLoading ? { backgroundColor: '#0062FF' } : { backgroundColor: '#0062ff8c' }} title="Confirm" onPress={() => this.handleSignVoucherBtn()} />
                                            </View>
                                        </View>
                                    </SafeAreaView>
                                    :
                                    modalState === 4 &&
                                    <SafeAreaView style={styles.wrapper}>

                                        <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                            <View style={{ alignItems: 'center' }}>
                                                <Text style={styles.title}>
                                                    Repay Loan
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                            <TxSubmitted width={100} height={100} />
                                        </View>
                                        <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Voucher Signed</Text>

                                            <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have signed a voucher to allow the Lender to accept the loan's payback. When the Lender redeems the voucher, the secretB1 will be revealed, which will allow you to unlock your collateral. If the Lender fails to redeem the voucher before the loan's expiration date, then you will be able to refund the payback and unlock part of your collateral.</Text>
                                            {/* <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text> */}
                                        </View>
                                        <View style={styles.btnsContainer}>
                                            <View style={{ flex: 1 }}>
                                                <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Close" onPress={() => onClose()} />
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
        fontFamily: 'Poppins-SemiBold',
        fontSize: 12
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
export default connect(mapStateToProps)(LendFILModal)