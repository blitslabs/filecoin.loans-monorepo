import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Alert,
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
import { confirmERC20LoanOperation, confirmSignUnlockCollateralVoucher } from '../../../../../utils/filecoin_loans'

// Actions
import { saveFLTx } from '../../../../../actions/filecoinLoans'

const web3 = new Web3()

class ERC20ApproveRequestModal extends Component {

    state = {
        modalState: 0,
        txLoading: false,
        lendLoading: false,
        secretHashB1: '',
    }


    componentDidMount() {
        const { loanDetails, prices } = this.props
        let modalState = 0
        if (loanDetails?.erc20Loan?.state == 0) modalState = 0
        else if (loanDetails?.erc20Loan?.state == 1) modalState = 3
        this.setState({ modalState })
    }

    handleApproveBtn = async () => {

        const { loanDetails, wallet, filecoinLoans, chainId, blockchain, dispatch } = this.props
        const erc20LoansContract = filecoinLoans?.contracts?.[chainId]?.ERC20Loans?.address

        this.setState({ modalState: 1 })

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

        // Get Gas Data
        const gasData = await eth.getGasData()
        const gasLimit = '800000' // TODO
        console.log('Gas Data: ', gasData)

        const response = await erc20Loans.approveRequest(
            loanDetails?.erc20Loan?.contractLoanId,
            loanDetails?.filCollateral?.ethBorrower,
            loanDetails?.filCollateral?.filBorrower,
            loanDetails?.filCollateral?.secretHashA1,
            loanDetails?.filCollateral?.paymentChannelId,
            loanDetails?.filCollateral?.amount,
            gasLimit,
            gasData?.gasPrice,
            wallet?.[blockchain]
        )

        console.log(response)

        if (response?.status !== 'OK') {
            // show toast
            Alert.alert('Error', response?.message ? response?.message : 'Error approving request', [{ text: 'OK' }])
            this.setState({ modalState: 0 })
            return
        }

        dispatch(saveFLTx({
            receipt: response?.payload,
            txHash: response?.payload?.transactionHash,
            from: response?.payload?.from,
            summary: `Accept Loan Request with ${loanDetails?.filCollateral?.amount} FIL as collateral`,
            networkId: chainId
        }))

        const params = {
            operation: 'ApproveRequest',
            networkId: chainId,
            txHash: response?.payload?.transactionHash
        }

        this.intervalId = setInterval(async () => {
            confirmERC20LoanOperation(params)
                .then(data => data.json())
                .then((res) => {
                    if (res.status === 'OK') {
                        clearInterval(this.intervalId)
                        // show toast
                        this.setState({ modalState: 2 })
                        return
                    }
                })
        }, 3000)
    }

    handleSignVoucherBtn = async () => {

        const { wallet, loanDetails, dispatch, } = this.props

        this.setState({ signLoading: true })

        const filecoin_signer = new FilecoinSigner()

        // TODO
        // Add Min/Max Redeem time
        let voucher
        try {
            voucher = await filecoin_signer.paych.createVoucher(
                loanDetails?.filCollateral?.paymentChannelId, // paymentChannelId
                0, // timeLockMin
                0, // timeLockMax = loanExpiration?
                loanDetails?.erc20Loan?.secretHashB1?.replace('0x', ''), // secretHash
                BigNumber(0), // amount
                0, // lane
                1, // voucherNonce
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
            signedVoucher = await filecoin_signer?.paych.signVoucher(voucher, wallet?.FIL?.privateKey)
        } catch (e) {
            Alert.alert('Error', 'Error signing voucher', [{ text: 'OK' }])
            this.setState({ signLoading: false })
            return
        }

        // Save Signed Voucher
        this.confirmOpInterval = setInterval(async () => {
            confirmSignUnlockCollateralVoucher({ signedVoucher: signedVoucher, paymentChannelId: loanDetails?.filCollateral?.paymentChannelId })
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

                        this.setState({ modalState: 4 })
                    }
                })
        }, 3000)
    }

    render() {

        const {
            isVisible, onClose, loanDetails,
            handleCloseModal, handleConfirmBtn
        } = this.props

        const {
            modalState, txLoading, txHash, signLoading,
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
                            <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                <Text style={styles.title}>
                                    Approve Request
                                </Text>
                            </View>
                            <View style={{ marginBottom: 130 }}>
                                <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                    <ProgressStep label="Approve Request" removeBtnRow={true} >
                                        <View style={{ alignItems: 'center' }}>
                                            <Text>Approve Request</Text>
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
                                <View style={{ borderBottomWidth: 0.5, borderColor: 'rgb(229, 229, 229)', paddingBottom: 10 }}>
                                    <Text style={styles.description}>The Borrower has locked collateral as part of the loan request process.</Text>
                                    <Text style={styles.description}>You need to approve the request to enable the Borrower to withdraw the loan's principal.</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataDescription}>You are accepting a request.</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Borrower's FIL Account</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.filCollateral?.filBorrower}</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Borrower's ETH Account</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.filCollateral?.ethBorrower}</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Secret Hash A1</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.filCollateral?.secretHashA1}</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Locked Collateral</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.filCollateral?.amount} FIL</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Payment Channel Address</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.filCollateral?.paymentChannelAddress}</Text>
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
                                        onPress={() => this.handleApproveBtn()} />
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
                                            Approve Request
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ height: 200, marginTop: 20 }}>
                                    <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                                </View>
                                <View style={{ alignItems: 'center', marginBottom: 50, marginHorizontal: 40 }}>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Waiting For Confirmations</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular' }}>Accepting Loan Request</Text>
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
                                                Approve Request
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
                                        <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have accepted the Borrower's request. Now you need to create and sign a FIL voucher to allow the Borrower to unlock his collateral if the successfully repays the loan before the expiration date.</Text>
                                        {/* <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text> */}
                                    </View>
                                    <View style={styles.btnsContainer}>
                                        <View style={{ flex: 1 }}>
                                            <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Next" onPress={() => this.setState({ modalState: 3 })} />
                                        </View>
                                    </View>
                                </SafeAreaView>
                                :
                                modalState === 3
                                    ?
                                    <SafeAreaView style={styles.wrapper}>
                                        <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                            <Text style={styles.title}>
                                                Approve Request
                                            </Text>
                                        </View>
                                        <View style={{ marginBottom: 130 }}>
                                            <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                                <ProgressStep label="Approve Request" removeBtnRow={true}>
                                                    <View style={{ alignItems: 'center' }}>
                                                        <Text>Approve Request</Text>
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

                                            <View style={{ marginTop: 0 }}>
                                                <Text style={[styles.dataDescription, { fontSize: 12 }]}>You are signing a FIL Voucher to enable the Borrower to unlock his collateral only if the successfully repays the loan before expiration date.</Text>
                                            </View>

                                            <Text style={styles.dataValue}>• The Borrower needs a signed voucher to unlock his collateral when he repays the loan.</Text>
                                            <Text style={styles.dataValue}>• The Voucher will only be redeemable when you accept the Borrower's payback (reveal secretB1).</Text>
                                            <Text style={styles.dataValue}>• The Borrower will not be able to redeem the voucher (and unlock his collateral) if he fails to repay the loan on time and you don't accept the payback.</Text>

                                            <View style={{ marginTop: 10 }}>
                                                <Text style={styles.dataTitle}>Voucher's secret hash (secretB1)</Text>
                                                <Text style={styles.dataValue}>{loanDetails?.erc20Loan?.secretHashB1}</Text>
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
                                                    onPress={() => this.handleSignVoucherBtn()} />
                                            </View>
                                        </View>
                                    </SafeAreaView>
                                    :
                                    <SafeAreaView style={styles.wrapper}>

                                        <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                            <View style={{ alignItems: 'center' }}>
                                                <Text style={styles.title}>
                                                    Approve Request
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                            <TxSubmitted width={100} height={100} />
                                        </View>
                                        <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Voucher Signed</Text>
                                            <TouchableOpacity
                                                onPress={() => Linking.openURL(ASSETS?.[this.props?.blockchain]?.explorer_url + this.state.txHash)}
                                            >
                                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#0062FF', marginVertical: 5 }}>View on Explorer</Text>
                                            </TouchableOpacity>
                                            <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have signed a voucher as part of the approval process. The Borrower is now able to withdraw the principal and he has until the expiration date to pay back the loan; otherwise, you'll be able to seize part of his collateral.</Text>
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

export default connect(mapStateToProps)(ERC20ApproveRequestModal)