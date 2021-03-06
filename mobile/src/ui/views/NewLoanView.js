import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar, StyleSheet, Keyboard, TouchableOpacity, Alert, ScrollView } from 'react-native'

import Header from '../components/Header'



// Components 
import TextInputWithBtn from '../components/TextInputWithBtn'
import PrimaryBtn from '../components/PrimaryBtn'
import ConfirmTxModal from '../components/ConfirmTxModal'
import Loading from '../components/Loading'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import BlitsLoans from '../../crypto/BlitsLoans'
import ETH from '../../crypto/ETH'
import { CONTRACTS } from '../../crypto/index'
import { ETH_CHAIN_NAME } from "@env"
import currencyFormatter from 'currency-formatter'
import BigNumber from 'bignumber.js'
import Modal from 'react-native-modal'


// Actions
import { saveLoanRequest } from '../../actions/loanRequest'
import { prepareTxData, updatePreTxData } from '../../actions/prepareTx'

//
const HEIGHT = Dimensions.get('window').height


class NewLoanView extends Component {

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
        this.loadData()
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
                <View style={{ paddingHorizontal: 12, paddingTop: 20, backgroundColor: 'white' }}>
                    <Header
                        title="New Loan"
                        navigation={this.props.navigation}
                        customLeftComponent={true}
                        centerComponentStyle={{ fontSize: 18 }}
                    />
                </View>

                <View style={styles.container}>


                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.formLabel}>Available balance</Text>
                        <View style={{ flexDirection: 'row', }}>
                            <Text style={styles.text}>{currencyFormatter.format(this.state.balance, { code: 'USD' }).replace('$', '')} {assetSymbol} </Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.formLabel}>Amount to Lend ({assetSymbol})</Text>
                        <TextInputWithBtn
                            placeholder="Amount"
                            value={amount}
                            onChangeText={this.handleAmountChange}
                            icon={<Text style={{ ...styles.formLabel, paddingTop: 4 }}>MAX</Text>}
                            onIconBtnPressed={this.handleMaxBtn}
                            isInvalid={amountIsInvalid}
                            keyboardType="numeric"
                        />
                        {amountIsInvalid && <Text style={{ ...styles.sm_text, color: 'red', marginTop: 2 }}>{amountErrorMsg}</Text>}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginHorizontal: 2 }}>
                            <Text style={styles.sm_text}>Min {minLoanAmount} {token?.symbol}</Text>
                            <Text style={styles.sm_text}>Max {maxLoanAmount} {token?.symbol}</Text>
                        </View>
                    </View>
                    <ScrollView>
                        <View style={styles.detailsContainer}>
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
                            {/* <View style={styles.formControl}>
                                <Text style={styles.formLabel}>Collateralization Ratio</Text>
                                <Text style={styles.text}>150%</Text>
                            </View>
                            <View style={styles.formControl}>
                                <Text style={styles.formLabel}>Loan Term</Text>
                                <Text style={styles.text}>30 days</Text>
                            </View>
                            <View style={styles.formControl}>
                                <Text style={styles.formLabel}>Total Repayment Amount</Text>
                                <Text style={styles.text}>0 {assetSymbol}</Text>
                            </View> */}

                        </View>
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

export default connect(mapStateToProps)(NewLoanView)