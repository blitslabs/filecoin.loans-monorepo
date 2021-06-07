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
import ERC20LoanLockCollateralModal from './Modals/ERC20LoanLockCollateralModal'
import ERC20LoanApproveRequestModal from './Modals/ERC20ApproveRequestModal'
import ERC20LoanWithdrawModal from './Modals/ERC20LoanWithdrawModal'
import ERC20LoanPaybackModal from './Modals/ERC20LoanPaybackModal'
import ERC20LoanAcceptPaybackModal from './Modals/ERC20LoanAcceptPaybackModal'
import ERC20LoanUnlockCollateralModal from './Modals/ERC20LoanUnlockCollateralModal'
import ERC20LoanCancelModal from './Modals/ERC20LoanCancelModal'
import ERC20LoanSeizeCollateralModal from './Modals/ERC20LoanSeizeCollateralModal'
// import EmailNotificationsModal from '../general/EmailNotificationsModal'

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

        getLoanDetails({ loanType: 'ERC20', loanId })
            .then(data => data.json())
            .then((res) => {
                console.log(res)

                if (res.status === 'OK') {
                    dispatch(saveLoanDetails({ type: 'ERC20', loanDetails: res?.payload, id: loanId }))

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
            getLoanDetails({ loanType: 'ERC20', loanId })
                .then(data => data.json())
                .then((res) => {
                    if (res?.status === 'OK') {
                        dispatch(saveLoanDetails({ type: 'ERC20', loanDetails: res?.payload, id: loanId }))
                    }
                })
        }, 10000)
    }

    handleAmountChange = (value) => {
        this.checkAmount(value)
    }

    render() {

        const { loanDetails, filecoinLoans, loanId, publicKeys, prices } = this.props

        const {
            loading, loadingMsg, currentModal
        } = this.state

        if (loading) {
            return <Loading message={loadingMsg} />
        }

        const principalAsset = filecoinLoans?.loanAssets[loanDetails?.erc20Loan?.token]
        const principalAmount = BigNumber(loanDetails?.erc20Loan?.principalAmount).toString()
        const collateralAmount = BigNumber(loanDetails?.erc20Loan?.principalAmount).dividedBy(prices?.FIL?.usd).multipliedBy(1.5).toString()
        const loanDuration = parseInt(BigNumber(loanDetails?.erc20Loan?.loanExpirationPeriod).dividedBy(86400).minus(3))
        const interestRate = BigNumber(loanDetails?.erc20Loan?.interestAmount).dividedBy(principalAmount).multipliedBy(BigNumber(365).dividedBy(loanDuration)).multipliedBy(100).toString()

        const emptyAddress = '0x0000000000000000000000000000000000000000'
        const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
        const filBorrower = loanDetails?.erc20Loan?.filBorrower && loanDetails?.erc20Loan?.filBorrower != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.filBorrower) : '-'
        const filLender = loanDetails?.erc20Loan?.filLender && loanDetails?.erc20Loan?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.filLender) : '-'
        const lender = loanDetails?.erc20Loan?.lender && loanDetails?.erc20Loan?.lender != emptyAddress ? loanDetails?.erc20Loan?.lender : '-'
        const borrower = loanDetails?.erc20Loan?.borrower && loanDetails?.erc20Loan?.borrower != emptyAddress ? loanDetails?.erc20Loan.borrower : '-'
        const secretHashA1 = loanDetails?.erc20Loan?.secretHashA1 && loanDetails?.erc20Loan?.secretHashA1 != emptyHash ? loanDetails?.erc20Loan?.secretHashA1 : '-'
        const secretA1 = loanDetails?.erc20Loan?.secretA1 && loanDetails?.erc20Loan?.secretA1 != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.secretA1) : '-'
        const secretHashB1 = loanDetails?.erc20Loan?.secretHashB1 && loanDetails?.erc20Loan?.secretHashB1 != emptyHash ? loanDetails?.erc20Loan?.secretHashB1 : '-'
        const secretB1 = loanDetails?.erc20Loan?.secretB1 && loanDetails?.erc20Loan?.secretB1 != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.secretB1) : '-'

        const status = STATUS?.[loanDetails?.erc20Loan?.state ? loanDetails?.erc20Loan?.state : '0'][loanDetails?.filCollateral?.state ? loanDetails?.filCollateral?.state : '0']
        const activeStep = STEPS?.[loanDetails?.erc20Loan?.state ? loanDetails?.erc20Loan?.state : '0'][loanDetails?.filCollateral?.state ? loanDetails?.filCollateral?.state : '0']
        
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
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 10 }}>
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
                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>{principalAmount} {principalAsset?.symbol}</Text>
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
                            status === 'Lock Collateral (Borrower)' && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'ERC20_LOAN_LOCK_COLLATERAL' })} title='Lock Collateral' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            status === 'Approve Request (Lender)' && loanDetails?.erc20Loan?.lender?.toUpperCase() === publicKeys?.[loanDetails?.erc20Loan?.blockchain]?.toUpperCase() && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'ERC20_LOAN_APPROVE_REQUEST' })} title='Approve Request' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            (status === 'Lock Collateral (Borrower)' || status === 'Approve Request (Lender)') && loanDetails?.erc20Loan?.lender?.toUpperCase() === publicKeys?.[loanDetails?.erc20Loan?.blockchain]?.toUpperCase() && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'ERC20_LOAN_CANCEL' })} title='Cancel Loan Offer' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            status === 'Withdraw Principal (Borrower)' && loanDetails?.erc20Loan?.borrower?.toUpperCase() === publicKeys?.[loanDetails?.erc20Loan?.blockchain]?.toUpperCase() && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'ERC20_LOAN_WITHDRAW' })} title='Withdraw Principal' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            status === 'Repay Loan (Borrower)' && loanDetails?.erc20Loan?.borrower?.toUpperCase() === publicKeys?.[loanDetails?.erc20Loan?.blockchain]?.toUpperCase() && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'ERC20_LOAN_PAYBACK' })} title='Repay Loan' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            status === 'Accept Payback (Lender)' && loanDetails?.erc20Loan?.lender?.toUpperCase() === publicKeys?.[loanDetails?.erc20Loan?.blockchain]?.toUpperCase() && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'ERC20_LOAN_ACCEPT_PAYBACK' })} title='Accept Payback' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            (status === 'Seize Collateral (Lender)' || (status === 'Repay Loan (Borrower)' && loanDetails?.filCollateral?.filLender === publicKeys?.FIL)) && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'ERC20_LOAN_SEIZE_COLLATERAL' })} title='Seize Collateral' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            status === 'Unlock Collateral (Borrower)' && loanDetails?.filCollateral?.filBorrower === publicKeys?.FIL && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'ERC20_LOAN_UNLOCK_COLLATERAL' })} title='Unlock Collateral' style={{ backgroundColor: '#0062FF' }} />
                            )
                        }

                        {
                            status === 'Loan Canceled' && (loanDetails?.filCollateral?.state === '1' || loanDetails?.filCollateral?.state === '4') && loanDetails?.filCollateral?.filBorrower === publicKeys?.FIL && (
                                <PrimaryBtn onPress={() => this.setState({ currentModal: 'ERC20_LOAN_CANCELED_UNLOCK_COLLATERAL' })} title='Unlock Collateral' style={{ backgroundColor: '#0062FF' }} />
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
                    currentModal === 'ERC20_LOAN_LOCK_COLLATERAL' &&
                    <ERC20LoanLockCollateralModal
                        isVisible={currentModal === 'ERC20_LOAN_LOCK_COLLATERAL'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'FIL_LOAN_ACCEPT_OFFER' &&
                    <ERC20LoanApproveRequestModal
                        isVisible={currentModal === 'FIL_LOAN_ACCEPT_OFFER'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'ERC20_LOAN_WITHDRAW' &&
                    <ERC20LoanWithdrawModal
                        isVisible={currentModal === 'ERC20_LOAN_WITHDRAW'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'ERC20_LOAN_PAYBACK' &&
                    <ERC20LoanPaybackModal
                        isVisible={currentModal === 'ERC20_LOAN_PAYBACK'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'ERC20_LOAN_ACCEPT_PAYBACK' &&
                    <ERC20LoanAcceptPaybackModal
                        isVisible={currentModal === 'ERC20_LOAN_ACCEPT_PAYBACK'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'ERC20_LOAN_UNLOCK_COLLATERAL' &&
                    <ERC20LoanUnlockCollateralModal
                        isVisible={currentModal === 'ERC20_LOAN_UNLOCK_COLLATERAL'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'ERC20_LOAN_CANCEL' &&
                    <ERC20LoanCancelModal
                        isVisible={currentModal === 'ERC20_LOAN_CANCEL'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'ERC20_LOAN_CANCELED_UNLOCK_COLLATERAL' &&
                    <ERC20LoanCanceledUnlockCollateralModal
                        isVisible={currentModal === 'ERC20_LOAN_CANCELED_UNLOCK_COLLATERAL'}
                        onClose={() => this.setState({ currentModal: '' })}
                        loanId={loanId}
                    />
                }

                {
                    currentModal === 'ERC20_LOAN_SEIZE_COLLATERAL' &&
                    <ERC20LoanSeizeCollateralModal
                        isVisible={currentModal === 'ERC20_LOAN_SEIZE_COLLATERAL'}
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
        '0': 'Lock Collateral (Borrower)',
    },
    '0.5': {
        '1': 'Approve Request (Lender)'
    },
    '1': {
        '1': 'Approve Request (Lender)',
        '2': 'Withdraw Principal (Borrower)',
        '3': 'Withdraw Principal (Borrower)',

    },
    '2': {
        '2': 'Repay Loan (Borrower)',
        '6': 'Seize Collateral (Lender)',
        '7': 'Seize Collateral (Lender)'
    },
    '3': {
        '2': 'Accept Payback (Lender)',
    },
    '5': {
        '2': 'Unlock Collateral (Borrower)',
        '3': 'Unlock Collateral (Borrower)',
        '4': 'Unlock Collateral (Borrower)'
    },
    '6': {
        '0': 'Loan Canceled',
        '1': 'Loan Canceled',
        '4': 'Loan Canceled',
        '5': 'Loan Canceled'
    }
}
const STEPS = {
    '0': {
        '0': '2',
    },
    '0.5': {
        '1': '3'
    },
    '1': {
        '1': '3',
        '2': '4'
    },
    '2': {
        '2': '5',
        '6': '7',
        '7': '7'
    },
    '3': {
        '2': '6'
    },
    '5': {
        '2': '7',
        '3': '7',
        '4': '7'
    },
    '6': {
        '0': '7',
        '1': '7',
        '4': '7',
        '5': '7'
    }
}

function mapStateToProps({ tokens, shared, wallet, prepareTx, filecoinLoans, prices }, ownProps) {

    const loanId = ownProps?.route?.params?.loanId

    return {
        loanDetails: filecoinLoans?.loanDetails['ERC20'][loanId],
        loanId,
        filecoinLoans,
        tokens,
        shared,
        wallet: wallet && wallet.wallet,
        publicKeys: wallet?.publicKeys,
        prepareTx,
        prices
    }
}

export default connect(mapStateToProps)(FILLoanDetails)