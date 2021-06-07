import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar,
    StyleSheet, Keyboard, TouchableOpacity, Alert, ScrollView,
} from 'react-native'

// Components 
import Header from '../../../components/Header'
import TextInputWithBtn from '../../../components/TextInputWithBtn'
import PrimaryBtn from '../../../components/PrimaryBtn'
import ConfirmTxModal from '../../../components/ConfirmTxModal'
import Loading from '../../../components/Loading'
import MyTextInput from '../../../components/MyTextInput'

// Libraries
import Web3 from 'web3'
import SplashScreen from 'react-native-splash-screen'
import ETH from '../../../../crypto/ETH'
import { CONTRACTS } from '../../../../crypto/index'
import { ETH_CHAIN_NAME } from "@env"
import currencyFormatter from 'currency-formatter'
import BigNumber from 'bignumber.js'
import Modal from 'react-native-modal'
import ImageLoad from 'react-native-image-placeholder'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Slider from '@react-native-community/slider'
import FilecoinLogo from '../../../../../assets/images/filecoin-logo.svg'

// Modals
import LendFILModal from './Modals/LendFILModal'
import AcceptOfferModal from './Modals/AcceptOfferModal'
import SignWithdrawVoucherModal from './Modals/SignWithdrawVoucherModal'
import WithdrawPrincipalModal from './Modals/WithdrawPrincipalModal'
import RepayLoanModal from './Modals/RepayLoanModal'
import AcceptPaybackModal from './Modals/AcceptPaybackModal'
import UnlockCollateralModal from './Modals/UnlockCollateralModal'
import SeizeCollateralModal from './Modals/SeizeCollateralModal'
import CancelLoanModal from './Modals/CancelLoanModal'

// API
import { getLoanDetails } from '../../../../utils/filecoin_loans'

// Actions
import { saveLoanDetails } from '../../../../actions/filecoinLoans'
const web3 = new Web3()

class FILLoanDetails extends Component {

    state = {
        loading: true,
        currentModal: ''
    }

    componentDidMount() {
        SplashScreen.hide()

        const { route, dispatch, shared, tokens, loanRequest } = this.props
        const loanId = route?.params?.loanId

        if (!loanId) this.props.navigation.goBack()

        getLoanDetails({ loanType: 'FIL', loanId })
            .then(data => data.json())
            .then((res) => {
                console.log(res)

                if (res.status === 'OK') {
                    dispatch(saveLoanDetails({ type: 'FIL', loanDetails: res?.payload, id: loanId }))

                    this.setState({
                        loading: false
                    })

                    this.checkLoanStatus(loanId)
                }
            })
    }

    componentWillUnmount() {
        clearInterval(this.loanDetailsInterval)
    }

    checkLoanStatus = () => {
        const { loanId, dispatch } = this.props
        this.loanDetailsInterval = setInterval(async () => {
            getLoanDetails({ loanType: 'FIL', loanId })
                .then(data => data.json())
                .then((res) => {
                    if (res?.status === 'OK') {
                        dispatch(saveLoanDetails({ type: 'FIL', loanDetails: res?.payload, id: loanId }))
                    }
                })
        }, 10000)
    }

    handleAmountChange = (value) => {
        this.checkAmount(value)
    }

    render() {

        const { loanDetails, filecoinLoans, loanId, publicKeys } = this.props

        const {
            loading, loadingMsg, currentModal
        } = this.state

        if (loading) {
            return <Loading message={loadingMsg} />
        }

        const principalAmount = BigNumber(loanDetails?.collateralLock?.principalAmount).toString()
        const collateralAmount = BigNumber(loanDetails?.collateralLock?.collateralAmount).toString()
        const interestRate = BigNumber(loanDetails?.collateralLock?.interestRate).multipliedBy(100).toString()
        const loanDuration = parseInt(BigNumber(loanDetails?.collateralLock?.loanExpirationPeriod).dividedBy(86400).minus(3))

        const emptyAddress = '0x0000000000000000000000000000000000000000'
        const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
        const filBorrower = loanDetails?.collateralLock?.filBorrower && loanDetails?.collateralLock?.filBorrower != '0x' ? web3.utils.toUtf8(loanDetails?.collateralLock?.filBorrower) : '-'
        const filLender = loanDetails?.collateralLock?.filLender && loanDetails?.collateralLock?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.collateralLock?.filLender) : '-'
        const lender = loanDetails?.collateralLock?.lender && loanDetails?.collateralLock?.lender != emptyAddress ? loanDetails?.collateralLock?.lender : '-'
        const borrower = loanDetails?.collateralLock?.borrower && loanDetails?.collateralLock?.borrower != emptyAddress ? loanDetails?.collateralLock.borrower : '-'
        const secretHashA1 = loanDetails?.collateralLock?.secretHashA1 && loanDetails?.collateralLock?.secretHashA1 != emptyHash ? loanDetails?.collateralLock?.secretHashA1 : '-'
        const secretA1 = loanDetails?.filLoan?.secretA1 && loanDetails?.filLoan?.secretA1 != '0x' ? loanDetails?.filLoan?.secretA1 : '-'
        const secretHashB1 = loanDetails?.collateralLock?.secretHashB1 && loanDetails?.collateralLock?.secretHashB1 != emptyHash ? loanDetails?.collateralLock?.secretHashB1 : '-'
        const secretB1 = loanDetails?.filPayback?.secretB1 && loanDetails?.filPayback?.secretB1 != '0x' ? loanDetails?.filPayback?.secretB1 : '-'

        const status = STATUS?.[loanDetails?.collateralLock?.state ? loanDetails?.collateralLock?.state : '0'][loanDetails?.filLoan?.state ? loanDetails?.filLoan?.state : '0'][loanDetails?.filPayback?.state ? loanDetails?.filPayback?.state : '0']
        const activeStep = STEPS?.[loanDetails?.collateralLock?.state ? loanDetails?.collateralLock?.state : '0']?.[loanDetails?.filLoan?.state ? loanDetails?.filLoan?.state : '0']?.[loanDetails?.filPayback?.state ? loanDetails?.filPayback?.state : '0']

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <View style={{ paddingHorizontal: 0, paddingTop: 20, backgroundColor: 'white' }}>
                    <Header
                        title="Loan Details"
                        navigation={this.props.navigation}
                        customLeftComponent={true}
                        centerComponentStyle={{ fontSize: 18 }}
                    />
                </View>

                <View style={styles.container}>



                    <ScrollView>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                            <Text style={{ fontFamily: 'Poppins-SemiBold' }}>FIL Loan / </Text>
                            <Text style={{ fontFamily: 'Poppins-Regular' }}>ID #23</Text>
                        </View>

                        {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View>
                                    <FilecoinLogo height={35} width={35} />
                                </View>
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={{ fontFamily: 'Poppins-Light', fontSize: 12 }}>Principal</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular', }}>1.65 FIL</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 30 }}>
                                <View>
                                    <FilecoinLogo height={35} width={35} />
                                </View>
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={{ fontFamily: 'Poppins-Light', fontSize: 12 }}>Collateral</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular', }}>300 DAI</Text>
                                </View>
                            </View>
                        </View> */}

                        <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgb(229, 229, 229)', paddingBottom: 5 }}>
                            <Text style={{ fontFamily: 'Poppins-Light', fontSize: 12 }}>Principal</Text>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>{principalAmount} FIL</Text>
                        </View>
                        <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgb(229, 229, 229)', paddingBottom: 5 }}>
                            <Text style={{ fontFamily: 'Poppins-Light', fontSize: 12 }}>Required Collateral</Text>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>{parseFloat(collateralAmount).toFixed(6)} FIL</Text>
                        </View>
                        <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgb(229, 229, 229)', paddingBottom: 5 }}>
                            <Text style={{ fontFamily: 'Poppins-Light', fontSize: 12 }}>Interest Rate</Text>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>{parseFloat(interestRate).toFixed(2)}%</Text>
                        </View>
                        <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgb(229, 229, 229)', paddingBottom: 5 }}>
                            <Text style={{ fontFamily: 'Poppins-Light', fontSize: 12 }}>Loan Duration</Text>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>{loanDuration} Days</Text>
                        </View>                        
                        <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgb(229, 229, 229)', paddingBottom: 5 }}>
                            <Text style={{ fontFamily: 'Poppins-Light', fontSize: 12 }}>Status</Text>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>{status}</Text>
                        </View>
                    </ScrollView>
                    <View style={{ width: '100%', marginBottom: 20 }}>

                        {
                            loanDetails?.collateralLock?.state == 0 && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'FIL_LOAN_LEND' })} title='Lend' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            loanDetails?.collateralLock?.state == 0.5 && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'FIL_LOAN_ACCEPT_OFFER' })} title='Approve Offer' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            (status == 'Sign Voucher (Lender)' && loanDetails?.filLoan?.filLender === publicKeys?.FIL) && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'FIL_LOAN_SIGN_WITHDRAW_VOUCHER' })} title='Sign Voucher' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            (status == 'Withdraw Principal (Borrower)' && loanDetails?.filLoan?.filBorrower === publicKeys?.FIL) && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'FIL_LOAN_WITHDRAW_PRINCIPAL' })} title='Withdraw Principal' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            (status == 'Repay Loan (Borrower)' && loanDetails?.filLoan?.filBorrower === publicKeys?.FIL) && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'FIL_LOAN_REPAY' })} title='Repay Loan' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            (status == 'Accept Payback (Lender)') && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'FIL_LOAN_ACCEPT_PAYBACK' })} title='Accept Payback' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            (loanDetails?.filPayback?.secretB1 && loanDetails?.collateralLock?.state == 1) && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'FIL_LOAN_UNLOCK_COLLATERAL' })} title='Unlock Collateral' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            (loanDetails?.collateralLock?.state == 0 && loanDetails?.erc20Loan?.borrower?.toUpperCase() === publicKeys?.[loanDetails?.collateralLock?.blockchain]?.toUpperCase()) && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'FIL_LOAN_CANCEL' })} title='Cancel Loan Request' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            (
                                loanDetails?.collateralLock?.state == 1 &&
                                parseInt(loanDetails?.collateralLock?.loanExpiration) < Math.floor(Date.now() / 1000)
                                && loanDetails?.filLoan?.filLender?.toUpperCase() === publicKeys?.[loanDetails?.collateralLock?.blockchain]?.toUpperCase()
                            ) && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'FIL_LOAN_SEIZE_COLLATERAL' })} title='Seize Collateral' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {/* {
                            (filecoinLoans?.email?.account?.toUpperCase() !== publicKeys?.[loanDetails?.collateralLock?.blockchain]?.toUpperCase() || !filecoinLoans?.email?.email) && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'EMAIL_NOTIFICATIONS_MODAL' })} title='Receive Email Notifications'  />
                            )
                        } */}

                    </View>
                </View>

                {
                    currentModal === 'FIL_LOAN_LEND' &&
                    <LendFILModal
                        isVisible={currentModal === 'FIL_LOAN_LEND'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'FIL_LOAN_ACCEPT_OFFER' &&
                    <AcceptOfferModal
                        isVisible={currentModal === 'FIL_LOAN_ACCEPT_OFFER'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'FIL_LOAN_SIGN_WITHDRAW_VOUCHER' &&
                    <SignWithdrawVoucherModal
                        isVisible={currentModal === 'FIL_LOAN_SIGN_WITHDRAW_VOUCHER'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'FIL_LOAN_WITHDRAW_PRINCIPAL' &&
                    <WithdrawPrincipalModal
                        isVisible={currentModal === 'FIL_LOAN_WITHDRAW_PRINCIPAL'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'FIL_LOAN_REPAY' &&
                    <RepayLoanModal
                        isVisible={currentModal === 'FIL_LOAN_REPAY'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'FIL_LOAN_ACCEPT_PAYBACK' &&
                    <AcceptPaybackModal
                        isVisible={currentModal === 'FIL_LOAN_ACCEPT_PAYBACK'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'FIL_LOAN_UNLOCK_COLLATERAL' &&
                    <UnlockCollateralModal
                        isVisible={currentModal === 'FIL_LOAN_UNLOCK_COLLATERAL'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'FIL_LOAN_SEIZE_COLLATERAL' &&
                    <SeizeCollateralModal
                        isVisible={currentModal === 'FIL_LOAN_SEIZE_COLLATERAL'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'FIL_LOAN_CANCEL' &&
                    <CancelLoanModal
                        isVisible={currentModal === 'FIL_LOAN_CANCEL'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

            </SafeAreaView>
        )
    }
}



const styles = StyleSheet.create({
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0
    },
    // 
    safeArea: {
        flex: 1,

    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        // height: HEIGHT,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    btnContainer: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 0,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 5,
        height: 90,
        marginTop: 5,
        // borderColor: '#D6D6D6',
        // borderWidth: 1,
        elevation: 2,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 0 },
        // shadowOpacity: 0.1,
        // shadowRadius: 5,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.5,
        // shadowRadius: 1,
        // position: 'absolute',
        // flex: 1,
    },
    formLabel: {
        fontFamily: 'Poppins-SemiBold'
    },
    text: {
        fontFamily: 'Poppins-Regular'
    },
    sm_text: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10
    },
    detailsContainer: {
        borderTopColor: '#f9f9f9',
        borderTopWidth: 1,
        paddingTop: 10,
        marginTop: 20,
        width: '100%',
        backgroundColor: 'white',
        justifyContent: 'space-between',
        // marginBottom: 20,
    },
    formControl: {
        marginTop: 10
    },
    sm_text: {
        fontFamily: 'Poppins-Light',
        fontSize: 12
    }
})

const STATUS = {
    '0': {
        '0': { '0': 'Collateral Locked' }
    },
    '0.5': {
        '0': { '0': 'Approve Offer (Borrower)' }
    },
    '1': {
        '0': { '0': 'Sign Voucher (Lender)' },
        '1': { '0': 'Withdraw Principal (Borrower)' },
        '2': { '0': 'Withdraw Principal (Borrower)' },
        '3': { '0': 'Withdraw Principal (Borrower)' },
        '4': {
            '0': 'Repay Loan (Borrower)',
            '1': 'Accept Payback (Lender)',
            '2': 'Accept Payback (Lender)',
            '3': 'Accept Payback (Lender)',
            '4': 'Unlock Collateral (Borrower)'
        }
    },
    '2': {
        '3': {
            '0': 'Loan Closed'
        },
        '4': {
            '0': 'Collateral Seized'
        }
    },
    '3': {
        '4': {
            '2': 'Accept Payback (Lender)',
            '3': 'Accept Payback (Lender)',
            '4': 'Loan Closed'
        }
    },
    '4': {
        '0': {
            '0': 'Loan Canceled'
        }
    }
}
const STEPS = {
    '0': {
        '0': { '0': '2' }
    },
    '0.5': {
        '0': { '0': '3' }
    },
    '1': {
        '0': { '0': '4' },
        '1': { '0': '5' },
        '2': { '0': '5' },
        '3': { '0': '5' },
        '4': {
            '0': '6',
            '1': '7',
            '2': '7',
            '3': '7',
            '4': '8'
        }
    },
    '2': {
        '3': { '0': '8' },
        '4': { '0': '8' }
    },
    '3': {
        '4': { '2': '7' },
        '4': { '3': '7' },
        '4': { '4': '8' }
    },
    '4': {
        '0': { '0': '8' }
    }
}

function mapStateToProps({ tokens, shared, wallet, prepareTx, filecoinLoans }, ownProps) {

    const loanId = ownProps?.route?.params?.loanId

    return {
        loanDetails: filecoinLoans?.loanDetails['FIL'][loanId],
        loanId,
        filecoinLoans,
        tokens,
        shared,
        wallet: wallet && wallet.wallet,
        publicKeys: wallet?.publicKeys,
        prepareTx,
    }
}

export default connect(mapStateToProps)(FILLoanDetails)