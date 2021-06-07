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
import Web3 from 'web3'
import ETH from '../../../../../crypto/ETH'
import { FilecoinClient, FilecoinSigner } from '@blitslabs/filecoin-js-signer'
import ERC20Loans from '../../../../../crypto/filecoinLoans/ERC20Loans'
import { generateSecret } from '../../../../../crypto/filecoinLoans/utils'


// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import FilecoinLogo from '../../../../../../assets/images/filecoin-logo.svg'

// SVG
import TxSubmitted from '../../../../../../assets/images/tx_submitted.svg'

// API
import { confirmFILCollateralLock, confirmSignSeizeCollateralVoucher } from '../../../../../utils/filecoin_loans'

// Actions
import { saveFLTx } from '../../../../../actions/filecoinLoans'

const web3 = new Web3()

class ERC20LoanLockCollateralModal extends Component {

    state = {
        modalState: 0,
        signLoading: false,
        paybackLoading: false,
        repayAmount: 0,
        secretHashA1: ''
    }


    componentDidMount() {
        const { loanDetails, prices } = this.props
        const lockAmount = parseFloat(BigNumber(loanDetails?.erc20Loan?.principalAmount).dividedBy(prices?.FIL?.usd).multipliedBy(1.5)).toFixed(8)
        let modalState = 0
        if (!loanDetails?.filCollateral?.state) modalState = 0
        else if (loanDetails?.filCollateral?.state == 0) modalState = 4

        this.setState({
            lockAmount,
            modalState
        })
    }

    handleSignBtn = async () => {

        const { filecoinLoans, wallet, dispatch, chainId, blockchain } = this.props
        const erc20LoansContract = filecoinLoans?.contracts?.[chainId]?.ERC20Loans?.address

        this.setState({ signLoading: true })

        let eth
        try {
            eth = new ETH(blockchain, 'mainnet')
        } catch (e) {
            console.log(e)
            return
        }

        let erc20Loans
        try {
            erc20Loans = new ERC20Loans(eth.web3, erc20LoansContract, chainId)
        } catch (e) {
            console.log(e)
            this.setState({ signLoading: false })
            return
        }

        const account = wallet?.[blockchain]?.publicKey

        let userLoansCount
        try {
            userLoansCount = await erc20Loans.getUserLoansCount(account)
            console.log(userLoansCount)
        } catch (e) {
            console.log(e)
            return
        }

        if (userLoansCount?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to create the request. Nonce: ${parseInt(userLoansCount?.payload) + 1}. Contract: ${erc20LoansContract}`
        const secretData = await generateSecret(message, wallet?.[blockchain])
        console.log(secretData)

        if (secretData?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        this.setState({
            ethBorrower: account,
            secretHashA1: secretData?.payload?.secretHash,
            secretA1: secretData?.payload?.secret,
            modalState: 1,
            signLoading: false
        })
    }

    handleConfirmBtn = async () => {

        const { filecoinLoans, loanDetails, dispatch, loanId, wallet, blockchain } = this.props
        const { lockAmount, secretHashA1, ethBorrower } = this.state

        this.setState({ modalState: 2 })

        // Prepare Payment Channel Data
        const filLender = loanDetails?.erc20Loan?.filLender && loanDetails?.erc20Loan?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.filLender) : ''

        const filecoin_client = new FilecoinClient(ASSETS?.FIL?.mainnet_endpoints?.http, ASSETS?.FIL?.token)

        let tx
        try {
            tx = await filecoin_client.paych.createPaymentChannel(
                wallet?.FIL?.publicKey, // from
                filLender, // to
                BigNumber(lockAmount).multipliedBy(1e18), // amount
                wallet?.FIL?.privateKey, // privateKey
                ASSETS?.FIL?.network,
                true
            )
            console.log(tx)
        } catch (e) {
            console.log(tx)
            this.setState({ modalState: 1 })
            return
        }

        const paymentChannelId = tx?.ReturnDec?.IDAddress
        const paymentChannelAddress = tx?.ReturnDec?.RobustAddress

        let message
        try {
            message = {
                loanId: loanId,
                contractLoanId: loanDetails?.erc20Loan?.contractLoanId,
                erc20LoansContract: loanDetails?.erc20Loan?.erc20LoansContract,
                CID: tx?.Message,
                paymentChannelId,
                paymentChannelAddress,
                ethBorrower,
                ethLender: loanDetails?.erc20Loan?.lender,
                filLender,
                filBorrower: wallet?.FIL?.publicKey,
                secretHashA1,
                lockAmount,
                network: ASSETS?.FIL?.network,
                erc20LoansNetworkId: loanDetails?.erc20Loan?.networkId
            }
        } catch (e) {
            console.log(e)
            return
        }

        const filecoin_signer = new FilecoinSigner()
        const signature = filecoin_signer.utils.signMessage(JSON.stringify(message), wallet?.FIL?.privateKey)

        console.log('message: ', message)
        console.log('signature: ', signature)

        this.confirmOpInterval = setInterval(async () => {
            confirmFILCollateralLock({ message, signature })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // show toast

                        // Save Tx
                        dispatch(saveFLTx({
                            receipt: tx,
                            txHash: tx?.Message['/'],
                            from: wallet?.FIL?.publicKey,
                            summary: `Create a Payment Channel with ${filLender} to lock ${lockAmount} FIL as collateral`
                        }))

                        // Send Message & signature to API
                        this.setState({ modalState: 3, txHash: tx?.Message['/'] })
                    }
                })
        }, 3000)
    }

    handleSignVoucherBtn = async () => {

        const { filecoinLoans, loanDetails, dispatch, chainId, wallet } = this.props
        const { lockAmount, } = this.state

        this.setState({ signLoading: true })

        const filecoin_signer = new FilecoinSigner()

        // TODO
        // Add Min/Max Redeem time
        const loanExpiration = BigNumber(loanDetails?.collateralLock?.loanExpiration).minus(259200).toString()

        // Create Voucher with TimeLockMax < LoanExpiration
        // TimeLockMax sets a max epoch beyond which the voucher cannot be redeemed
        let voucher
        try {
            voucher = await filecoin_signer.paych.createVoucher(
                loanDetails?.filCollateral?.paymentChannelId, // paymentChannelId
                0, // timeLockMin
                0, // timeLockMax = loanExpiration?
                loanDetails?.filCollateral?.secretHashA1?.replace('0x', ''), // secretHash
                BigNumber(lockAmount).multipliedBy(1e18), // amount
                0, // lane
                0, // voucherNonce
                0, // minSettleHeight
            )
        } catch (e) {
            console.log(e)
            this.setState({ signLoading: false })
            return
        }

        let signedVoucher
        try {
            signedVoucher = await filecoin_signer.paych.signVoucher(voucher, wallet?.FIL?.privateKey)
        } catch (e) {
            console.log(e)
            this.setState({ signLoading: false })
            return
        }

        // Save Signed Voucher
        this.confirmOpInterval = setInterval(async () => {
            confirmSignSeizeCollateralVoucher({ signedVoucher: signedVoucher, paymentChannelId: loanDetails?.filCollateral?.paymentChannelId })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // show toast

                        // Save Tx
                        dispatch(saveFLTx({
                            receipt: { signedVoucher: signedVoucher, paymentChannelId: loanDetails?.filCollateral?.paymentChannelId },
                            txHash: signedVoucher,
                            from: wallet?.FIL?.publicKey,
                            summary: `Signed a Voucher of ${loanDetails?.filCollateral?.amount} FIL for Payment Channel ${loanDetails?.filCollateral?.paymentChannelId}`
                        }))

                        this.setState({ modalState: 5 })
                    }
                })
        }, 3000)
    }

    render() {

        const {
            isVisible, onClose, loanDetails, filecoinLoans,
            handleCloseModal, handleConfirmBtn
        } = this.props

        const {
            modalState, signLoading, paybackLoading, txHash,
            repayAmount, lockAmount, secretHashA1
        } = this.state

        const emptyAddress = '0x0000000000000000000000000000000000000000'
        const lender = loanDetails?.erc20Loan?.lender && loanDetails?.erc20Loan?.lender != emptyAddress ? loanDetails?.erc20Loan.lender : '-'
        const filLender = loanDetails?.erc20Loan?.filLender && loanDetails?.erc20Loan?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.filLender) : '-'
        const asset = filecoinLoans?.loanAssets?.[loanDetails?.erc20Loan?.token]

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
                                    Withdraw Principal
                                </Text>

                            </View>

                            <View style={{ marginBottom: 130 }}>
                                <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                    <ProgressStep label="Sign Message" removeBtnRow={true} >
                                        <View style={{ alignItems: 'center' }}>
                                            <Text>Sign Message</Text>
                                        </View>
                                    </ProgressStep>
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
                                    <Text style={styles.dataDescription}>You are borrowing 300 DAI from:</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Lender's FIL Account</Text>
                                    <Text style={styles.dataValue}>{filLender}</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Lender's ETH Account</Text>
                                    <Text style={styles.dataValue}>{lender}</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Principal</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.erc20Loan?.principalAmount}</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Collateralization Ratio</Text>
                                    <Text style={styles.dataValue}>150%</Text>
                                </View>
                            </View>

                            <View style={styles.btnsContainer}>
                                <View style={{ flex: 1 }}>
                                    <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <BlitsBtn
                                        disabled={signLoading}
                                        style={!signLoading ? { backgroundColor: '#0062FF' } : { backgroundColor: '#0062ff8c' }}
                                        title={signLoading ? 'Signing...' : "Sign Voucher"}
                                        onPress={() => this.handleSignBtn()}
                                    />
                                </View>
                            </View>
                        </SafeAreaView>
                        :
                        modalState === 1
                            ?
                            <SafeAreaView style={styles.wrapper}>

                                <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                    <Text style={styles.title}>
                                        Lock Collateral
                                    </Text>
                                </View>

                                <View style={{ marginBottom: 130 }}>
                                    <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                        <ProgressStep label="Sign Message" removeBtnRow={true} >
                                            <View style={{ alignItems: 'center' }}>
                                                <Text>Sign Message</Text>
                                            </View>
                                        </ProgressStep>
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
                                        <Text style={[styles.dataDescription, { fontSize: 12 }]}>You are creating a Payment Channel with the Lender to lock the required collateral for the loan.</Text>
                                    </View>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataValue}>• You are transferring and locking {parseFloat(lockAmount).toFixed(8)} FIl into a Payment Channel contract.</Text>
                                        <Text style={styles.dataValue}>• Once created, you'll have to create and sign a Voucher to allow the Lender to seize part of your collateral in case you fail to repay the loan.</Text>
                                        <Text style={styles.dataValue}>• When the principal is withdrawn, you will reveal secretA1, which will allow the Lender to redeem the voucher.</Text>
                                        <Text style={styles.dataValue}>• Once the Lender accepts the payback, he will reveal secretB1, which will allow you to unlock your collateral from the Payment Channel.</Text>
                                    </View>

                                </View>

                                <View style={styles.btnsContainer}>
                                    <View style={{ flex: 1 }}>
                                        <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Confirm" onPress={() => this.handleConfirmBtn()} />
                                    </View>
                                </View>
                            </SafeAreaView>
                            :
                            modalState === 2 ?
                                <SafeAreaView style={styles.wrapper}>

                                    <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.title}>
                                                Lock Collateral
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ height: 200, marginTop: 20 }}>
                                        <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                                    </View>
                                    <View style={{ alignItems: 'center', marginBottom: 50, marginHorizontal: 40 }}>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Waiting For Confirmations</Text>
                                        <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>Creating a Payment Channel with {parseFloat(lockAmount).toFixed(8)} FIL</Text>
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
                                                    Lock Collateral
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                            <TxSubmitted width={100} height={100} />
                                        </View>
                                        <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Transaction Submitted</Text>
                                            <TouchableOpacity
                                                onPress={() => Linking.openURL(ASSETS?.[this.props?.blockchain]?.explorer_url + this.state.txHash)}
                                            >
                                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#0062FF', marginVertical: 5 }}>View on Explorer</Text>
                                            </TouchableOpacity>
                                            <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have crated a Payment Channel with the Lender, and now you need to create a voucher to complete the collateral locking process.</Text>
                                            {/* <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text> */}
                                        </View>
                                        <View style={styles.btnsContainer}>
                                            <View style={{ flex: 1 }}>
                                                <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Next" onPress={() => this.setState({ modalState: 4 })} />
                                            </View>
                                        </View>
                                    </SafeAreaView>
                                    :
                                    modalState === 4
                                        ?
                                        <SafeAreaView style={styles.wrapper}>


                                            <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                                <Text style={styles.title}>
                                                    Lock Collateral
                                                </Text>
                                            </View>

                                            <View style={{ marginBottom: 130 }}>
                                                <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                                    <ProgressStep label="Sign Message" removeBtnRow={true} >
                                                        <View style={{ alignItems: 'center' }}>
                                                            <Text>Sign Message</Text>
                                                        </View>
                                                    </ProgressStep>
                                                    <ProgressStep label="Create Pay. Channel" removeBtnRow={true} >
                                                        <View style={{ alignItems: 'center' }}>
                                                            <Text>Create Pay. Channel</Text>
                                                        </View>
                                                    </ProgressStep>
                                                    <ProgressStep label="Sign Voucher" removeBtnRow={true}>
                                                        <View style={{ alignItems: 'center' }}>
                                                            <Text>Sign Voucher</Text>
                                                        </View>
                                                    </ProgressStep>

                                                </ProgressSteps>
                                            </View>

                                            <View style={styles.txDetailsContainer}>
                                                <Text style={styles.dataValue}>• The Lender needs a signed voucher to seize the funds from the FIL Payment Channel in case you fail to repay the loan on time.</Text>
                                                <Text style={styles.dataValue}>• The Voucher will only be redeemable when you withdraw the loan's principal (reveal secretA1) and you fail to pay back the loan on time.</Text>
                                                <Text style={styles.dataValue}>• You will be able to unlock your collateral once the Lender accept the repayment (reveals secretB1).</Text>
                                                <View style={{ marginTop: 10 }}>
                                                    <Text style={styles.dataTitle}>Voucher's secret hash (secretA1)</Text>
                                                    <Text style={styles.dataValue}>{secretHashA1 ? secretHashA1 : loanDetails?.filCollateral?.secretHashA1}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.btnsContainer}>
                                                <View style={{ flex: 1 }}>
                                                    <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <BlitsBtn disabled={signLoading} style={!signLoading ? { backgroundColor: '#0062FF' } : { backgroundColor: '#0062ff8c' }} title={signLoading ? 'Signing...' : "Sign Voucher"} onPress={() => this.handleSignVoucherBtn()} />
                                                </View>
                                            </View>
                                        </SafeAreaView>
                                        :
                                        modalState === 5 &&
                                        <SafeAreaView style={styles.wrapper}>

                                            <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                                <View style={{ alignItems: 'center' }}>
                                                    <Text style={styles.title}>
                                                        Lock Collateral
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                                <TxSubmitted width={100} height={100} />
                                            </View>
                                            <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Transaction Submitted</Text>
                                                <TouchableOpacity
                                                    onPress={() => Linking.openURL(ASSETS?.[this.props?.blockchain]?.explorer_url + this.state.txHash)}
                                                >
                                                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#0062FF', marginVertical: 5 }}>View on Explorer</Text>
                                                </TouchableOpacity>
                                                <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have signed a voucher as part of the collateral locking process. The Lender will be able to seize part of your collateral with this voucher if you fail to repay the loan before the expiration date.</Text>
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

export default connect(mapStateToProps)(ERC20LoanLockCollateralModal)