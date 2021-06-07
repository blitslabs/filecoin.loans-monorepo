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
import moment from 'moment'
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps'
import {
    WaveIndicator,
} from 'react-native-indicators'
import { FilecoinClient, FilecoinSigner } from '@blitslabs/filecoin-js-signer'
import ETH from '../../../../../crypto/ETH'
import ERC20CollateralLock from '../../../../../crypto/filecoinLoans/ERC20CollateralLock'
import { generateSecret, decodeVoucher } from '../../../../../crypto/filecoinLoans/utils'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import FilecoinLogo from '../../../../../../assets/images/filecoin-logo.svg'

// SVG
import TxSubmitted from '../../../../../../assets/images/tx_submitted.svg'

// API
import { confirmRedeemPaybackVoucher, confirmSettlePayback, confirmCollectPayback } from '../../../../../utils/filecoin_loans'

// Actions
import { saveFLTx } from '../../../../../actions/filecoinLoans'

class AcceptPaybackModal extends Component {

    state = {
        modalState: 0,
        redeemLoading: false,
        signLoading: false,
        secretHashB1: '',
        amount: '',
        secretB1: ''
    }


    async componentDidMount() {
        const { loanDetails } = this.props


        let response
        try {
            response = decodeVoucher(loanDetails?.filLoan?.signedVoucher)
        } catch (e) {
            console.log(e)
        }
        console.log(response)

        this.setState({
            secretHashB1: response?.secretHash,
            amount: BigNumber(response.amount).dividedBy(1e18).toString()
        })

        let modalState = 0
        if (loanDetails?.filPayback?.state == 1) modalState = 0
        else if (loanDetails?.filPayback?.state == 2) modalState = 4
        else if (loanDetails?.filPayback?.state == 3) modalState = 7
        this.setState({ modalState })
    }

    handleSignBtn = async () => {

        const { loanDetails, dispatch, chainId, blockchain, wallet, filecoinLoans } = this.props

        const collateralLockContract = filecoinLoans?.contracts?.[chainId]?.ERC20CollateralLock?.address

        this.setState({ signLoading: true })

        let eth
        try {
            eth = new ETH(blockchain, 'mainnet')
        } catch (e) {
            console.log(e)
            this.setState({ signLoading: false })
            return
        }

        let collateralLock
        try {
            collateralLock = new ERC20CollateralLock(eth.web3, collateralLockContract, chainId)
        } catch (e) {
            console.log(e)
            this.setState({ signLoading: false })
            return
        }

        this.setState({ signLoading: true })

        const accountLoans = await collateralLock.getAccountLoans(wallet?.[blockchain]?.publicKey)

        if (accountLoans?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        let userLoansCount = 0
        for (let l of accountLoans?.payload) {
            userLoansCount++
            if (l == loanDetails?.collateralLock?.contractLoanId) break;
        }
        console.log(userLoansCount)

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to lend. Nonce: ${userLoansCount + 1}. Contract: ${collateralLockContract}`
        const secretData = await generateSecret(message, wallet?.[blockchain])
        console.log(secretData)

        if (secretData?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        this.setState({
            secretB1: secretData?.payload.secret?.replace('0x', ''),
            signLoading: false,
            modalState: 1
        })
    }

    handleRedeemBtn = async () => {
        const { secretB1 } = this.state
        const { loanDetails, dispatch, wallet } = this.props

        this.setState({ modalState: 2 })

        const filecoin_client = new FilecoinClient(ASSETS?.FIL?.mainnet_endpoints?.http, ASSETS?.FIL?.token)

        let response
        try {
            response = await filecoin_client.paych.updatePaymentChannel(
                loanDetails?.filPayback?.paymentChannelId, // paymentChannelId
                wallet?.FIL?.publicKey,
                loanDetails?.filPayback?.signedVoucher, // signedVoucher
                Buffer.from(secretB1), // secretB1
                wallet?.FIL?.privateKey, // privateKey
                true
            )
        } catch (e) {
            console.log(e)
            this.setState({ modalState: 1 })
            return
        }

        // Confirm
        this.confirmOpInterval = setInterval(async () => {
            confirmRedeemPaybackVoucher({ CID: response?.Message['/'], network: ASSETS?.FIL?.network })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // show toast

                        // Save Tx
                        dispatch(saveFLTx({
                            receipt: { ...response },
                            txHash: response?.Message['/'],
                            from: wallet?.FIL?.publicKey,
                            summary: `Redeem Payback Voucher`
                        }))

                        this.setState({ modalState: 3, txHash: response?.Message['/'] })
                    }
                })
        }, 3000)
    }

    handleSettleBtn = async () => {
        const { wallet, loanDetails, dispatch, loanId } = this.props

        // Loading
        this.setState({ modalState: 5 })

        // Settle Payment Channel
        const filecoin_client = new FilecoinClient(ASSETS?.FIL?.mainnet_endpoints?.http, ASSETS?.FIL?.token)

        let response
        try {
            response = await filecoin_client.paych.settlePaymentChannel(
                loanDetails?.filPayback?.paymentChannelId, // paymentChannelId  
                wallet?.FIL?.publicKey, // publicKey          
                wallet?.FIL?.privateKey, // privateKey
                true
            )
            console.log(response)
        } catch (e) {
            console.log(e)
            this.setState({ modalState: 4 })
            return
        }

        // Save Settle Tx
        this.confirmOpInterval = setInterval(async () => {
            confirmSettlePayback({ CID: response?.Message['/'], network: ASSETS?.FIL?.network })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // Show Toast

                        // Save Tx
                        dispatch(saveFLTx({
                            receipt: { ...response },
                            txHash: response?.Message['/'],
                            from: wallet?.FIL?.publicKey,
                            summary: `Settle Payback Payment Channel`
                        }))

                        this.setState({ modalState: 6 })
                    }
                })
        }, 3000)
    }

    handleCollectBtn = async () => {
        const { wallet, loanDetails, dispatch, loanId } = this.props

        // Loading
        this.setState({ modalState: 8 })

        // Settle Payment Channel
        const filecoin_client = new FilecoinClient(ASSETS?.FIL?.mainnet_endpoints?.http, ASSETS?.FIL?.token)

        let response
        try {
            response = await filecoin_client.paych.collectPaymentChannel(
                loanDetails?.filPayback?.paymentChannelId, // paymentChannelId            
                wallet?.FIL?.publicKey, // publicKey
                wallet?.FIL?.privateKey, // privateKey
                true
            )
            console.log(response)
        } catch (e) {
            console.log(e)
            this.setState({ modalState: 7 })
            return
        }

        // Save Settle Tx
        this.confirmOpInterval = setInterval(async () => {
            confirmCollectPayback({ CID: response?.Message['/'], network: ASSETS?.FIL?.network })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // Show Toast

                        // Save Tx
                        dispatch(saveFLTx({
                            receipt: { ...response },
                            txHash: response?.Message['/'],
                            from: wallet?.FIL?.publicKey,
                            summary: `Collect Funds from Payment Channel`
                        }))

                        this.setState({ modalState: 9, })
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
            modalState, amount, secretHashB1, secretB1, txHash,
            redeemLoading, signLoading, settleLoading,
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
                                    Accept Payback
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
                                    <Text style={styles.dataDescription}>You are accepting the borrowers's payback ({loanDetails?.filPayback?.amount} FIL).</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataValue}>• The Borrower has signed a voucher to allow you to withdraw the loan's payback from the FIL Payment Channel.</Text>
                                    <Text style={[styles.dataValue, { fontFamily: 'Poppins-SemiBold' }]}>• Make sure the voucher amount is correct before redeeming the voucher; otherwise, you'll reveal your preimage (secretB1) and withdraw an incorrect amount.</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Voucher Amount</Text>
                                    <Text style={styles.dataValue}>{amount} FIL</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Voucher's Secret Hash (secretHashB1)</Text>
                                    <Text style={styles.dataValue}>{`0x${secretHashB1}`}</Text>
                                </View>
                            </View>

                            <View style={styles.btnsContainer}>
                                <View style={{ flex: 1 }}>
                                    <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <BlitsBtn disabled={signLoading} style={!signLoading ? { backgroundColor: '#0062FF' } : { backgroundColor: '#0062ff8c' }} title={signLoading ? 'Signing...' : "Sign Voucher"} onPress={() => this.handleSignBtn()} />
                                </View>
                            </View>
                        </SafeAreaView>
                        :
                        modalState === 1 ?
                            <SafeAreaView style={styles.wrapper}>

                                <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                    <Text style={styles.title}>
                                        Accept Payback
                                    </Text>
                                </View>

                                <View style={{ marginBottom: 130, marginHorizontal: 25 }}>
                                    <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
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
                                        <Text style={styles.dataDescription}>You are accepting the Borrower's payback ({loanDetails?.filPayback?.amount} FIL).</Text>
                                    </View>

                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataValue}>• The Borrower has signed a voucher to allow you to withdraw the payback amount from the FIL Payment Channel.</Text>
                                        <Text style={[styles.dataValue, { fontFamily: 'Poppins-SemiBold' }]}>• Make sure the voucher amount is correct before redeeming the voucher; otherwise, you'll reveal your preimage (secretB1) and withdraw an incorrect amount.</Text>
                                    </View>

                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataTitle}>Voucher Amount</Text>
                                        <Text style={styles.dataValue}>{amount} FIL</Text>
                                    </View>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataTitle}>Voucher's Secret Hash (secretHashB1)</Text>
                                        <Text style={styles.dataValue}>{`0x${secretHashB1}`}</Text>
                                    </View>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataTitle}>Your secret (secretB1)</Text>
                                        <Text style={styles.dataValue}>{`${secretB1}`}</Text>
                                    </View>
                                </View>

                                <View style={styles.btnsContainer}>

                                    <View style={{ flex: 1 }}>
                                        <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Redeem Voucher" onPress={() => this.handleRedeemBtn()} />
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
                                                Accept Payback
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ height: 200, marginTop: 20 }}>
                                        <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                                    </View>
                                    <View style={{ alignItems: 'center', marginBottom: 50, marginHorizontal: 40 }}>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Waiting For Confirmations</Text>
                                        <Text style={{ fontFamily: 'Poppins-Regular' }}>Redeeming a voucher of {loanDetails?.collateralLock?.principalAmount} FIL from Payment Channel</Text>
                                        <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text>
                                    </View>
                                </SafeAreaView>
                                :
                                modalState === 3
                                    ?
                                    <SafeAreaView style={styles.wrapper}>

                                        <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                            <View style={{ alignItems: 'center' }}>
                                                <Text style={styles.title}>
                                                    Accept Payback
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
                                            <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have withdrawn the loan's principal and you have until the loan's expiration date to pay back your debt. The Lender will be able to seize part of your collateral in case of default.</Text>
                                            {/* <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text> */}
                                        </View>
                                        <View style={styles.btnsContainer}>
                                            <View style={{ flex: 1 }}>
                                                <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Close" onPress={() => this.setState({ modalState: 4 })} />
                                            </View>
                                        </View>
                                    </SafeAreaView>

                                    : modalState === 4 ?
                                        <SafeAreaView style={styles.wrapper}>

                                            <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                                <Text style={styles.title}>
                                                    Accept Payback
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
                                                    <Text style={styles.dataDescription}>You are settling the payment channel to withdraw the loan's ({loanDetails?.filPayback?.amount} FIL).</Text>
                                                </View>

                                                <View style={{ marginTop: 10 }}>
                                                    <Text style={styles.dataValue}>• You have redeemed a voucher and you are now settling the payment channel to collect the funds in it.</Text>
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
                                        modalState == 5
                                            ?
                                            <SafeAreaView style={styles.wrapper}>

                                                <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                                    <View style={{ alignItems: 'center' }}>
                                                        <Text style={styles.title}>
                                                            Accept Payback
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

                                            modalState == 6
                                                ?
                                                <SafeAreaView style={styles.wrapper}>

                                                    <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                                        <View style={{ alignItems: 'center' }}>
                                                            <Text style={styles.title}>
                                                                Accept Payback
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
                                                            <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Next" onPress={() => this.setState({ modalState: 7 })} />
                                                        </View>
                                                    </View>
                                                </SafeAreaView>
                                                :
                                                modalState === 7
                                                    ?
                                                    <SafeAreaView style={styles.wrapper}>

                                                        <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                                            <Text style={styles.title}>
                                                                Accept Payback
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
                                                                    parseFloat(moment.duration(moment.unix(loanDetails?.filPayback?.settlingAtEstTimestamp).diff(moment())).asHours()).toFixed(2) > 0
                                                                        ?
                                                                        <Text style={[styles.dataDescription, { fontSize: 12, }]}>
                                                                            You'll be able to collect the funds in the Payment Channel in
                                                                            {` ${moment.duration(moment.unix(loanDetails?.filPayback?.settlingAtEstTimestamp).diff(moment())).hours()} hours and \
                                                                            ${moment.duration(moment.unix(loanDetails?.filPayback?.settlingAtEstTimestamp).diff(moment())).minutes()} minutes`}
                                                                            .
                                                                        </Text>
                                                                        :
                                                                        <Text style={styles.dataDescription}>
                                                                            You can now collect the funds in the Payment Channel ({loanDetails?.filPayback?.principalAmount} FIL).
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
                                                                    disabled={parseFloat(moment.duration(moment.unix(loanDetails?.filPayback?.settlingAtEstTimestamp).diff(moment())).asHours()).toFixed(2) > 0}
                                                                    style={parseFloat(moment.duration(moment.unix(loanDetails?.filPayback?.settlingAtEstTimestamp).diff(moment())).asHours()).toFixed(2) > 0 ? { backgroundColor: '#0062ff8c' } : { backgroundColor: '#0062FF' }}
                                                                    title="Collect"
                                                                    onPress={() => this.handleCollectBtn()}
                                                                />
                                                            </View>
                                                        </View>
                                                    </SafeAreaView>

                                                    :
                                                    modalState == 8
                                                        ?
                                                        <SafeAreaView style={styles.wrapper}>

                                                            <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                                                <View style={{ alignItems: 'center' }}>
                                                                    <Text style={styles.title}>
                                                                        Accept Payback
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

                                                        modalState == 9
                                                            ?
                                                            <SafeAreaView style={styles.wrapper}>

                                                                <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                                                    <View style={{ alignItems: 'center' }}>
                                                                        <Text style={styles.title}>
                                                                            Accept Payback
                                                                        </Text>
                                                                    </View>
                                                                </View>

                                                                <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                                                    <TxSubmitted width={100} height={100} />
                                                                </View>
                                                                <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                                                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Funds Collected</Text>
                                                                    <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have withdrawn the loan's principal from the FIL Payment Channel. You have until the loan's expiration date to pay back the loan.</Text>
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

export default connect(mapStateToProps)(AcceptPaybackModal)