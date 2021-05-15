import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar,
    StyleSheet, Keyboard, TouchableOpacity, Alert, ScrollView,
} from 'react-native'

import Header from '../../../components/Header'



// Components 
import TextInputWithBtn from '../../../components/TextInputWithBtn'
import PrimaryBtn from '../../../components/PrimaryBtn'
import ConfirmTxModal from '../../../components/ConfirmTxModal'
import Loading from '../../../components/Loading'
import MyTextInput from '../../../components/MyTextInput'

// Libraries
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


class LendERC20View extends Component {

    state = {
        balance: '',
        amount: '',
        showAllowanceModal: false,
    }

    modalizeRef = React.createRef()

    componentDidMount() {
        SplashScreen.hide()

        const { dispatch, shared, tokens, loanRequest } = this.props

        // const token = tokens[shared.selectedToken]

        this.modalizeRef.current?.open();
    }

    loadData = async () => {
        // console.log('LOAD_DATA')
        const { loanRequest, tokens, dispatch } = this.props
        const { assetSymbol } = loanRequest

        // Get Asset Type data (Loans)
        const tokenContractAddress = ETH_CHAIN_NAME === 'mainnet' ? CONTRACTS[assetSymbol].mainnet_contract : CONTRACTS[assetSymbol].testnet_contract

        // Balance
        const token = tokens[tokenContractAddress]
        const balance = token ? parseFloat(token.balance) : 0

        // Contract Data
        const data = await BlitsLoans.ETH.getAssetTypeData(tokenContractAddress)

        this.setState({
            balance,
            interestRate: data.interestRate,
            maxLoanAmount: data.maxLoanAmount,
            minLoanAmount: data.minLoanAmount,
            enabled: data.enabled,
            tokenContractAddress,
            token,
        })
    }

    handleAmountChange = (value) => {
        this.checkAmount(value)
    }

    handleMaxBtn = () => {
        const { balance, maxLoanAmount, minLoanAmount } = this.state
        const amount = BigNumber(balance).gt(maxLoanAmount) ? maxLoanAmount : balance
        this.checkAmount(amount)
    }

    checkAmount = (value) => {
        let { balance, minLoanAmount, maxLoanAmount } = this.state

        if (!value || value == 0) {
            this.setState({
                amountIsInvalid: true,
                amountErrorMsg: 'Enter a valid amount',
                amount: '0'
            })
            return
        }

        balance = BigNumber(balance)
        const amount = BigNumber(value.replace(/\D/, ''))

        if (amount.lt(minLoanAmount) || amount.gt(maxLoanAmount)) {
            this.setState({
                amountIsInvalid: true,
                amountErrorMsg: 'Invalid loan amount',
                amount: amount.toString()
            })
        } else if (balance.lt(amount)) {
            this.setState({
                amountIsInvalid: true,
                amountErrorMsg: 'Insufficient balance',
                amount: amount.toString()
            })
        } else {
            this.setState({
                amountIsInvalid: false,
                amountErrorMsg: '',
                amount: amount.toString()
            })
        }
    }

    handleLendBtn = async () => {
        console.log('LEND_BTN')
        const { amount, balance, tokenContractAddress, token, interestRate } = this.state
        const { wallet, dispatch, navigation } = this.props

        if (!balance) {
            Alert.alert('Error', 'Error fetching balance', [{ text: 'OK' }])
            return
        }

        if (!amount) {
            Alert.alert('Error', 'Enter a valid amount', [{ text: 'OK' }])
            return
        }

        const lendAmount = BigNumber(amount)
        const tokenBalance = BigNumber(balance)

        if (lendAmount.lte(0)) {
            Alert.alert('Error', `Enter a valid amount`, [{ text: 'OK' }])
            return
        }

        if (tokenBalance.lte(0) || tokenBalance.lt(lendAmount)) {
            Alert.alert('Error', `Not enough balance`, [{ text: 'OK' }])
            return
        }

        // Check allowance
        const allowanceRes = await ETH.getAllowance(BlitsLoans.ETH_BLITS_LOANS_CONTRACT, tokenContractAddress, wallet.ETH)
        console.log('allowance:', allowanceRes)
        const allowance = BigNumber(allowanceRes.payload)

        if (allowance.lt(lendAmount)) {
            console.log('ALLOWANCE_MODAL')
            dispatch(updatePreTxData({
                contractName: 'Blits Loans',
                blockchain: 'ETH',
                operation: 'Allowance',
                description: `Allow Blits Loans to spend your ${token.symbol}`,
                amount: '0',
                gasLimit: '150000',
                gasPrice: '1',
                image: 'Blits'
            }))
            this.setState({ showAllowanceModal: true })
            return
        }

        dispatch(saveLoanRequest({ token, amount, blockchain: 'ETH', interestRate }))
        navigation.navigate('ConfirmLoan')
        return
    }

    handleCloseModal = () => this.setState({ showAllowanceModal: false })

    handleConfirmBtn = async () => {
        console.log('CONFIRM_TX_BTN')
        const { prepareTx, wallet, dispatch } = this.props
        const { gasPrice, gasLimit, } = prepareTx
        const { tokenContractAddress } = this.state

        this.setState({ loading: true, loadingMsg: 'Approving Allowance' })

        const response = await ETH.approveAllowance(
            BlitsLoans.ETH_BLITS_LOANS_CONTRACT,
            '1000000000',
            tokenContractAddress,
            gasPrice.toString(),
            gasLimit.toString(),
            wallet.ETH
        )

        console.log(response)

        this.setState({
            showAllowanceModal: false,
            loading: false,
        })

        dispatch(prepareTxData({}))
    }

    render() {

        const { loanRequest, tokens, shared } = this.props
        const { loanRequestType, assetSymbol, } = loanRequest
        const {
            balance, amount, amountIsInvalid, amountErrorMsg, interestRate,
            token, maxLoanAmount, minLoanAmount,
            loading, loadingMsg,
        } = this.state

        if (loading) {
            return <Loading message={loadingMsg} />
        }

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <View style={{ paddingHorizontal: 0, paddingTop: 20, backgroundColor: 'white' }}>
                    <Header
                        title="New Loan Offer"
                        navigation={this.props.navigation}
                        customLeftComponent={true}
                        centerComponentStyle={{ fontSize: 18 }}
                    />
                </View>

                <View style={styles.container}>



                    <ScrollView>
                        <View style={{ paddingTop: 15, paddingBottom: 5, borderRadius: 12, marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 5 }}>
                                <View style={{ marginRight: 10, width: 25, height: 25, backgroundColor: '#0062ff', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'white' }}>1</Text></View>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>How much would you like to lend?</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 8 }}>
                                    <MyTextInput
                                        onChangeText={this.handleToken0Amount}
                                        value={0}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, backgroundColor: 'whitesmoke', borderWidth: 0 }}
                                    />
                                </View>
                                <View

                                    style={{ backgroundColor: 'whitesmoke', flex: 4, justifyContent: 'space-evenly', alignItems: 'center', flexDirection: 'row', borderColor: 'whitesmoke', borderWidth: 1, borderLeftWidth: 0, borderRadius: 4, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                    <View style={{ flexDirection: 'row', }}>
                                        <Fragment>

                                            <View style={{ marginLeft: 5 }}>
                                                <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Select</Text>
                                            </View>
                                        </Fragment>
                                    </View>
                                </View>
                            </View>
                        </View>                        

                        <View style={{ paddingTop: 15, paddingBottom: 5, borderRadius: 12, marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 5 }}>
                                <View style={{ marginRight: 10, width: 25, height: 25, backgroundColor: '#0062ff', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'white' }}>2</Text></View>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>Select loan length</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 5, justifyContent: 'space-between', marginHorizontal: 5 }}>
                                <TouchableOpacity style={{ backgroundColor: '#0062FF', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 20 }}>
                                    <Text style={{ color: 'white' }}>30 Days</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ backgroundColor: 'white', borderColor: 'grey', borderWidth: 0.2, borderRadius: 5, paddingVertical: 8, paddingHorizontal: 20 }}>
                                    <Text style={{ color: 'black' }}>60 Days</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ backgroundColor: 'white', borderColor: 'grey', borderWidth: 0.2, borderRadius: 5, paddingVertical: 8, paddingHorizontal: 20 }}>
                                    <Text style={{ color: 'black' }}>90 Days</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ paddingTop: 15, paddingBottom: 5, borderRadius: 12, marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 5 }}>
                                <View style={{ marginRight: 10, width: 25, height: 25, backgroundColor: '#0062ff', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'white' }}>3</Text></View>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>Select the interest rate</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Slider
                                    style={{ width: '100%', height: 40, }}
                                    minimumValue={5}
                                    maximumValue={25}
                                    minimumTrackTintColor="#0062FF"
                                    maximumTrackTintColor="black"
                                    thumbTintColor="#0062FF"
                                    step={1}
                                />
                            </View>
                            <View style={{ marginHorizontal: 5 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}>5% More Borrowers</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}>25% Few Borrowers</Text>
                                </View>
                                <Text style={{ fontFamily: 'Poppins-Light', fontSize: 12, textAlign: 'justify', marginTop: 10 }}>Even though you can select the interest rate, borrowers still have to select your offer. Higher interest rates, might take longer times to find a borrower.</Text>
                            </View>
                        </View>
                        {/* <View style={styles.detailsContainer}>
                            <View>
                                <Text style={styles.formLabel}>Loan Details</Text>
                                <Text style={styles.text}>You are lending {amount ? amount : '0'} {assetSymbol} for 30 days</Text>
                            </View>
                            <View style={styles.formControl}>
                                <Text style={styles.formLabel}>Interest</Text>
                                <Text style={styles.text}>0 {assetSymbol}</Text>
                            </View>
                            <View style={styles.formControl}>
                                <Text style={styles.formLabel}>Duration</Text>
                                <Text style={styles.text}>30 days</Text>
                            </View>
                            <View style={styles.formControl}>
                                <Text style={styles.formLabel}>Annual Percentage Yield</Text>
                                <Text style={styles.text}>{interestRate ? (parseFloat(interestRate) * 100 * 12).toFixed(2) : '-'}%</Text>
                            </View>
                           
                        </View> */}
                    </ScrollView>
                    <View style={{ width: '100%', marginBottom: 10 }}>
                        <PrimaryBtn onPress={this.handleLendBtn} title='Lend' />
                    </View>
                </View>


                <Modal
                    isVisible={this.state.showAllowanceModal}
                    onSwipeComplete={this.handleCloseModal}
                    onBackButtonPress={this.handleCloseModal}
                    swipeDirection={'down'}
                    propagateSwipe
                    style={styles.bottomModal}
                    animationIn='slideInUp'
                    animationOut='slideOutDown'
                >
                    <ConfirmTxModal
                        handleCloseModal={this.handleCloseModal}
                        handleConfirmBtn={this.handleConfirmBtn}
                    />
                </Modal>
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
        paddingVertical: 0,
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

function mapStateToProps({ loanRequest, tokens, shared, wallet, prepareTx }) {
    return {
        loanRequest,
        tokens,
        shared,
        wallet: wallet && wallet.wallet,
        prepareTx,
    }
}

export default connect(mapStateToProps)(LendERC20View)