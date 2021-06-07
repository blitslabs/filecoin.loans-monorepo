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
import { FilecoinClient, FilecoinSigner } from '@blitslabs/filecoin-js-signer'
import ETH from '../../../../../crypto/ETH'
import ERC20CollateralLock from '../../../../../crypto/filecoinLoans/ERC20CollateralLock'
import { generateSecret, decodeVoucher } from '../../../../../crypto/filecoinLoans/utils'
import moment from 'moment'
import Web3 from 'web3'

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
import { confirmRedeemSeizeCollateralVoucher, confirmSettleWithdraw, confirmCollectWithdraw } from '../../../../../utils/filecoin_loans'

const web3 = new Web3()

class ERC20LoanSeizeCollateralModal extends Component {

    state = {
        modalState: 0,
        redeemLoading: false,
        signLoading: false,
        secretHashA1: '',
        secretA1: '',
        amount: '',
    }


    async componentDidMount() {
        const { loanDetails } = this.props

        let response
        try {
            response = decodeVoucher(loanDetails?.filCollateral?.signedVoucher)
        } catch (e) {
            console.log(e)
        }

        this.setState({
            secretHashA1: response?.secretHash,
            // amount: BigNumber(response?.amount).dividedBy(1e18).toString()
        })

        let modalState = 0
        if (loanDetails?.filCollateral?.state == 2) modalState = 0
        else if (loanDetails?.filCollateral?.state == 6) modalState = 3
        else if (loanDetails?.filCollateral?.state == 7) modalState = 6
        this.setState({ modalState })
    }

    handleRedeemBtn = async () => {
        const { filecoinLoans, loanDetails, dispath, loanId, chainId, wallet } = this.props
        const { secretA1 } = this.state

        const collateralLockContract = filecoinLoans?.contracts?.[chainId]?.ERC20CollateralLock?.address

        this.setState({ modalState: 1 })

        const filecoin_client = new FilecoinClient(ASSETS?.FIL?.mainnet_endpoints?.http, ASSETS?.FIL?.token)

        let response
        try {
            response = await filecoin_client.paych.updatePaymentChannel(
                loanDetails?.filCollateral?.paymentChannelId, // paymentChannelId
                wallet?.FIL?.publicKey,
                loanDetails?.filCollateral?.signedVoucher, // signedVoucher
                Buffer.from(secretA1), // secretA1
                wallet?.FIL?.privateKey,
                true,
            )
            console.log(response)
        } catch (e) {
            console.log(e)
            this.setState({ modalState: 0 })
            return
        }

        this.confirmOpInterval = setInterval(async () => {
            confirmRedeemSeizeCollateralVoucher({ CID: response?.Message['/'], network: ASSETS?.FIL?.network })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // Show Toast

                        // Save Tx
                        dispatch(saveTx({
                            receipt: { ...response },
                            txHash: response?.Message['/'],
                            from: wallet?.FIL?.publicKey,
                            summary: `Redeem Seize Collateral Voucher`
                        }))

                        this.setState({ modalState: 2, txHash: response?.Message['/'] })
                    }
                })
        })
    }

    handleSettleBtn = async () => {
        const { filecoinLoans, wallet, dispatch, loanDetails } = this.props

        this.setState({ modalState: 4 })

        // Settle Payment Channel
        const filecoin_client = new FilecoinClient(ASSETS?.FIL?.mainnet_endpoints?.http, ASSETS?.FIL?.token)

        let response
        try {
            response = await filecoin_client.paych.settlePaymentChannel(
                loanDetails?.filCollateral?.paymentChannelId, // paymentChannelId
                wallet?.FIL?.publicKey, // from
                wallet?.FIL?.privateKey, // privateKey
                true
            )
            console.log(response)
        } catch (e) {
            console.log(e)
            this.setState({ modalState: 3 })
            return
        }

        // Save Settle Tx
        this.confirmOpInterval = setInterval(async () => {
            confirmSettleWithdraw({ CID: response?.Message['/'], network: ASSETS?.FIL?.network })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // Show Toast

                        // Save Tx
                        dispatch(saveTx({
                            receipt: { ...response },
                            txHash: response?.Message['/'],
                            from: wallet?.FIL?.publicKey,
                            summary: `Settle Withdraw Payment Channel`
                        }))

                        this.setState({ modalState: 5, txHash: response?.Message['/'] })
                    }
                })
        }, 3000)
    }

    handleCollectBtn = async () => {
        const { filecoinLoans, loanDetails, dispatch, wallet, } = this.props

        this.setState({ modalState: 7 })

        // Collect Payment Channel
        const filecoin_client = new FilecoinClient(ASSETS?.FIL?.mainnet_endpoints?.http, ASSETS?.FIL?.token)

        let response
        try {
            response = await filecoin_client.paych.settlePaymentChannel(
                loanDetails?.filCollateral?.paymentChannelId, // paymentChannelId
                wallet?.FIL?.publicKey, // from
                wallet?.FIL?.privateKey, // privateKey,
                true, // waitMsg
            )
            console.log(response)
        } catch (e) {
            console.log(e)
            this.setState({ modalState: 6 })
            return
        }

        // Save Settle Tx
        this.confirmOpInterval = setInterval(async () => {
            confirmCollectWithdraw({ CID: response?.Message['/'], network: ASSETS?.FIL?.network })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // Show Toast

                        // Save Tx
                        dispatch(saveTx({
                            receipt: { ...response },
                            txHash: response?.Message['/'],
                            from: wallet?.FIL?.publicKey,
                            summary: `Collect Funds from Payment Channel`
                        }))

                        this.setState({ modalState: 8, txHash: response?.Message['/'] })
                    }
                })
        }, 3000)
    }

    render() {

        const {
            isVisible, onClose, publicKeys, balances, prepareTx, prices,
            handleCloseModal, handleConfirmBtn, loanDetails
        } = this.props

        const {
            modalState, redeemLoading, signLoading, settleLoading,
            txHash, secretHashA1, secretA1, amount,
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
                                    Seize Collateral
                                </Text>

                            </View>

                            <View style={{ marginBottom: 130, marginHorizontal: 25 }}>
                                <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                    <ProgressStep label="Generate Secret" removeBtnRow={true} >
                                        <View style={{ alignItems: 'center' }}>
                                            <Text>Generate Secret</Text>
                                        </View>
                                    </ProgressStep>
                                    <ProgressStep label="Redeem Voucher" >
                                        <View style={{ alignItems: 'center' }} removeBtnRow={true}>
                                            <Text>Redeem Voucher</Text>
                                        </View>
                                    </ProgressStep>
                                    <ProgressStep label="Settle Pay. Channel" >
                                        <View style={{ alignItems: 'center' }} removeBtnRow={true}>
                                            <Text>Settle Pay. Channel</Text>
                                        </View>
                                    </ProgressStep>
                                    <ProgressStep label="Collect Funds" >
                                        <View style={{ alignItems: 'center' }} removeBtnRow={true}>
                                            <Text>Collect Funds</Text>
                                        </View>
                                    </ProgressStep>

                                </ProgressSteps>
                            </View>

                            <View style={styles.txDetailsContainer}>

                                <View style={{}}>
                                    <Text style={[styles.dataDescription, { fontSize: 12 }]}> You are redeeming a voucher to seize the borrower's collateral ({loanDetails?.filCollateral?.amount} FIL).</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataValue}>• The Borrower has failed to repay the loan before the expiration date and you are able to seize the collateral from the FIL Payment Channel.</Text>
                                    {/* <Text style={[styles.dataValue, { fontFamily: 'Poppins-SemiBold' }]}>• Make sure the voucher amount is correct before redeeming the voucher; otherwise, you'll reveal your preimage (secretA1) and withdraw an incorrect amount.</Text> */}
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Voucher's Secret Hash (secretHashA1)</Text>
                                    <Text style={styles.dataValue}>{secretHashA1}</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Secret revealed by Borrower (secretA1)</Text>
                                    <Text style={styles.dataValue}>{web3.utils.toUtf8(loanDetails?.erc20Loan?.secretA1)}</Text>
                                </View>
                            </View>

                            <View style={styles.btnsContainer}>
                                <View style={{ flex: 1 }}>
                                    <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Sign" onPress={() => this.handleSignBtn()} />
                                </View>
                            </View>
                        </SafeAreaView>
                        :

                        modalState === 1
                            ?
                            <SafeAreaView style={styles.wrapper}>

                                <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.title}>
                                            Seize Collateral
                                            </Text>
                                    </View>
                                </View>

                                <View style={{ height: 200, marginTop: 20 }}>
                                    <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                                </View>
                                <View style={{ alignItems: 'center', marginBottom: 50, marginHorizontal: 40 }}>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Waiting For Confirmations</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>Redeeming a voucher to seize {loanDetails?.filCollateral?.amount} FIL from Payment Channel</Text>
                                    <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text>
                                </View>
                            </SafeAreaView>
                            :
                            modalState === 2
                                ?
                                <SafeAreaView style={styles.wrapper}>

                                    <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.title}>
                                                Seize Collateral
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                        <TxSubmitted width={100} height={100} />
                                    </View>
                                    <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Transaction Submitted</Text>
                                        <TouchableOpacity
                                            onPress={() => Linking.openURL(ASSETS?.[this.props?.blockchain]?.explorer_url + txHash)}
                                        >
                                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#0062FF', marginVertical: 5 }}>View on Explorer</Text>
                                        </TouchableOpacity>
                                        <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have redeemed a voucher to seize the borrower's collateral. To continue with the unlocking process, you'll need to `settle` the Payment Channel.</Text>
                                        {/* <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text> */}
                                    </View>
                                    <View style={styles.btnsContainer}>
                                        <View style={{ flex: 1 }}>
                                            <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Next" onPress={() => this.setState({ modalState: 4 })} />
                                        </View>
                                    </View>
                                </SafeAreaView>

                                : modalState === 3 ?
                                    <SafeAreaView style={styles.wrapper}>

                                        <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                            <Text style={styles.title}>
                                                Seize Collateral
                                            </Text>
                                        </View>

                                        <View style={{ marginBottom: 130, marginHorizontal: 25 }}>
                                            <ProgressSteps activeStep={2} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                                <ProgressStep label="Generate Secret" removeBtnRow={true} >
                                                    <View style={{ alignItems: 'center' }}>
                                                        <Text>Generate Secret</Text>
                                                    </View>
                                                </ProgressStep>
                                                <ProgressStep label="Redeem Voucher" removeBtnRow={true}>
                                                    <View style={{ alignItems: 'center' }}>
                                                        <Text>Redeem Voucher</Text>
                                                    </View>
                                                </ProgressStep>
                                                <ProgressStep label="Settle Pay. Channel" removeBtnRow={true}>
                                                    <View style={{ alignItems: 'center' }}>
                                                        <Text>Settle Pay. Channel</Text>
                                                    </View>
                                                </ProgressStep>
                                                <ProgressStep label="Collect Funds" removeBtnRow={true}>
                                                    <View style={{ alignItems: 'center' }}>
                                                        <Text>Collect Funds</Text>
                                                    </View>
                                                </ProgressStep>

                                            </ProgressSteps>
                                        </View>

                                        <View style={styles.txDetailsContainer}>

                                            <View style={{}}>
                                                <Text style={styles.dataDescription}>You are settling the payment channel to seize the collateral ({loanDetails?.filCollateral?.amount} FIL).</Text>
                                            </View>

                                            <View style={{ marginTop: 10 }}>
                                                <Text style={styles.dataValue}>• You have redeemed a voucher and you are now settling the payment channel to seize the funds in it.</Text>
                                                <Text style={styles.dataValue}>• Once you start the Payment Channel's settling process, you'll have to wait 12 hrs before you can collect the funds.</Text>
                                            </View>


                                        </View>

                                        <View style={styles.btnsContainer}>
                                            <View style={{ flex: 1 }}>
                                                <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Settle" onPress={() => this.handleSettleBtn()} />
                                            </View>
                                        </View>
                                    </SafeAreaView>
                                    :
                                    modalState == 4
                                        ?
                                        <SafeAreaView style={styles.wrapper}>

                                            <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                                <View style={{ alignItems: 'center' }}>
                                                    <Text style={styles.title}>
                                                        Seize Collateral
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={{ height: 200, marginTop: 20 }}>
                                                <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                                            </View>
                                            <View style={{ alignItems: 'center', marginBottom: 50, marginHorizontal: 40 }}>
                                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Waiting For Confirmations</Text>
                                                <Text style={{ fontFamily: 'Poppins-Regular' }}>Settling Payment Channel</Text>
                                                <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text>
                                            </View>
                                        </SafeAreaView>
                                        :

                                        modalState == 5
                                            ?
                                            <SafeAreaView style={styles.wrapper}>

                                                <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                                    <View style={{ alignItems: 'center' }}>
                                                        <Text style={styles.title}>
                                                            Seize Collateral
                                                        </Text>
                                                    </View>
                                                </View>

                                                <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                                    <TxSubmitted width={100} height={100} />
                                                </View>
                                                <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Settle Process Started</Text>
                                                    <TouchableOpacity
                                                        onPress={() => Linking.openURL(ASSETS?.[this.props?.blockchain]?.explorer_url + txHash)}
                                                    >
                                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#0062FF', marginVertical: 5 }}>View on Explorer</Text>
                                                    </TouchableOpacity>
                                                    <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have started the Payment Channel's settling process and you'll be able to collect the funds in approximately 12 hours.</Text>
                                                    {/* <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text> */}
                                                </View>
                                                <View style={styles.btnsContainer}>
                                                    <View style={{ flex: 1 }}>
                                                        <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Next" onPress={() => this.setState({ modalState: 6 })} />
                                                    </View>
                                                </View>
                                            </SafeAreaView>
                                            :

                                            modalState == 6
                                                ?
                                                <SafeAreaView style={styles.wrapper}>

                                                    <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                                        <Text style={styles.title}>
                                                            Seize Collateral
                                                        </Text>
                                                    </View>

                                                    <View style={{ marginBottom: 130, marginHorizontal: 25 }}>
                                                        <ProgressSteps activeStep={3} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                                            <ProgressStep label="Generate Secret" removeBtnRow={true} >
                                                                <View style={{ alignItems: 'center' }}>
                                                                    <Text>Generate Secret</Text>
                                                                </View>
                                                            </ProgressStep>
                                                            <ProgressStep label="Redeem Voucher" removeBtnRow={true}>
                                                                <View style={{ alignItems: 'center' }}>
                                                                    <Text>Redeem Voucher</Text>
                                                                </View>
                                                            </ProgressStep>
                                                            <ProgressStep label="Settle Pay. Channel" removeBtnRow={true}>
                                                                <View style={{ alignItems: 'center' }}>
                                                                    <Text>Settle Pay. Channel</Text>
                                                                </View>
                                                            </ProgressStep>
                                                            <ProgressStep label="Collect Funds" removeBtnRow={true}>
                                                                <View style={{ alignItems: 'center' }}>
                                                                    <Text>Collect Funds</Text>
                                                                </View>
                                                            </ProgressStep>

                                                        </ProgressSteps>
                                                    </View>

                                                    <View style={styles.txDetailsContainer}>

                                                        <View style={{}}>

                                                            {
                                                                parseFloat(moment.duration(moment.unix(loanDetails?.filLoan?.settlingAtEstTimestamp).diff(moment())).asHours()).toFixed(2) > 0
                                                                    ?
                                                                    <Text style={[styles.dataDescription, { fontSize: 12, }]}>
                                                                        You'll be able to collect the funds in the Payment Channel in
                                                                        {` ${moment.duration(moment.unix(loanDetails?.filCollateral?.settlingAtEstTimestamp).diff(moment())).hours()} hours and \
                                                                        ${moment.duration(moment.unix(loanDetails?.filCollateral?.settlingAtEstTimestamp).diff(moment())).minutes()} minutes`}
                                                                        .
                                                                        </Text>
                                                                    :
                                                                    <Text style={styles.dataDescription}>
                                                                        You can now collect the funds in the Payment Channel ({loanDetails?.filCollateral?.principalAmount} FIL).
                                                                    </Text>
                                                            }

                                                        </View>

                                                        <View style={{ marginTop: 10 }}>
                                                            <Text style={styles.dataValue}>• You have started the settling process in the Payment Channel, and you'll be able to collect the funds once the process ends (12hrs approx).</Text>
                                                        </View>
                                                    </View>

                                                    <View style={styles.btnsContainer}>
                                                        <View style={{ flex: 1 }}>
                                                            <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <BlitsBtn
                                                                disabled={parseFloat(moment.duration(moment.unix(loanDetails?.filCollateral?.settlingAtEstTimestamp).diff(moment())).asHours()).toFixed(2) > 0}
                                                                style={parseFloat(moment.duration(moment.unix(loanDetails?.filCollateral?.settlingAtEstTimestamp).diff(moment())).asHours()).toFixed(2) > 0 ? { backgroundColor: '#0062ff8c' } : { backgroundColor: '#0062FF' }}
                                                                title="Collect"
                                                                onPress={() => this.handleCollectBtn()}
                                                            />
                                                        </View>
                                                    </View>
                                                </SafeAreaView>

                                                :
                                                modalState == 7
                                                    ?
                                                    <SafeAreaView style={styles.wrapper}>

                                                        <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                                            <View style={{ alignItems: 'center' }}>
                                                                <Text style={styles.title}>
                                                                    Seize Collateral
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <View style={{ height: 200, marginTop: 20 }}>
                                                            <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                                                        </View>
                                                        <View style={{ alignItems: 'center', marginBottom: 50, marginHorizontal: 40 }}>
                                                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Waiting For Confirmations</Text>
                                                            <Text style={{ fontFamily: 'Poppins-Regular' }}>Collecting Funds from Payment Channel</Text>
                                                            <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text>
                                                        </View>
                                                    </SafeAreaView>
                                                    :

                                                    modalState == 8
                                                        ?
                                                        <SafeAreaView style={styles.wrapper}>

                                                            <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                                                <View style={{ alignItems: 'center' }}>
                                                                    <Text style={styles.title}>
                                                                        Seize Collateral
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                                                <TxSubmitted width={100} height={100} />
                                                            </View>
                                                            <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Funds Collected</Text>
                                                                <TouchableOpacity
                                                                    onPress={() => Linking.openURL(ASSETS?.[this.props?.blockchain]?.explorer_url + txHash)}
                                                                >
                                                                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#0062FF', marginVertical: 5 }}>View on Explorer</Text>
                                                                </TouchableOpacity>
                                                                <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have seized and collected the borrower's collateral from the FIL Payment Channel and the loan is now closed.</Text>
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


function mapStateToProps({ tokens, balances, wallet, prepareTx, prices, filecoinLoans }, ownProps) {
    return {
        tokens,
        balances,
        publicKeys: wallet?.publicKeys,
        wallet: wallet?.wallet,
        prepareTx,
        prices,
        filecoinLoans,
        loanDetails: filecoinLoans?.loanDetails['ERC20'][ownProps?.loanId],
        chainId: filecoinLoans?.loanDetails['ERC20'][ownProps?.loanId].erc20Loan?.networkId,
        blockchain: filecoinLoans?.loanDetails['ERC20'][ownProps?.loanId].erc20Loan?.blockchain,
    }
}

export default connect(mapStateToProps)(ERC20LoanSeizeCollateralModal)