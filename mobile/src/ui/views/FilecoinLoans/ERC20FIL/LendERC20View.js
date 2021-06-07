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
import Loading from '../../../components/Loading'
import MyTextInput from '../../../components/MyTextInput'

// Modals
import SelectAssetModal from '../general/SelectAssetModal'
import ConfirmCreateRequestModal from './Modals/ConfirmCreateOfferModal'
import ConfirmTxModal from '../../../components/ConfirmTxModal'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import ETH from '../../../../crypto/ETH'
import ERC20Loans from '../../../../crypto/filecoinLoans/ERC20Loans'
import { generateSecret } from '../../../../crypto/filecoinLoans/utils'

import { ASSETS } from '../../../../crypto/index'
import BigNumber from 'bignumber.js'
import ImageLoad from 'react-native-image-placeholder'
import Slider from '@react-native-community/slider'
import FilecoinLogo from '../../../../../assets/images/filecoin-logo.svg'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Toast from 'react-native-toast-message'

// Actions
import { prepareTxData, updatePreTxData } from '../../../../actions/prepareTx'
import { saveFLTx } from '../../../../actions/filecoinLoans'

// API
import { API } from "@env"
import { confirmERC20LoanOperation } from '../../../../utils/filecoin_loans'

// Test
import { saveToken } from '../../../../actions/tokens'


class LendERC20View extends Component {

    state = {
        // Principal Amount
        principalAmount: '',
        principalAmountErrorMsg: '',
        principalAmountIsInvalid: false,

        // Principal Asset
        principalAsset: '',
        principalAssetAddress: '',

        // Loan Duration
        loanDuration: 30,
        interestRate: 10,
        collaterallizationRatio: 150,

        selectAssetModalIsOpen: false,
        confirmModalIsOpen: false,
        confirmApproveTxModalIsOpen: false,
        confirmCreateTxModalIsOpen: false,

        // Allowance
        tokenAllowance: '',
        loading: false
    }

    componentDidMount() {
    }

    handlePrincipalAmountChange = (value) => {
        const principalAmount = value
        if (!(principalAmount === '' || (/^\d*\.?\d*$/).test(principalAmount))) return

        if (!principalAmount || principalAmount === '.') {
            this.setState({ principalAmount })
            return
        }

        this.setState({ principalAmount, principalIsInvalid: false })
    }

    onAssetSelect = async (symbol, contractAddress) => {
        await this.setState({
            principalAsset: symbol,
            principalAssetAddress: contractAddress,
            selectAssetModalIsOpen: false
        })
        this.checkAllowance()
    }

    handleLoanDurationClick = (loanDuration) => {
        this.setState({ loanDuration })
    }

    checkAllowance = async () => {
        const { filecoinLoans, wallet } = this.props
        const { principalAssetAddress } = this.state

        if (!principalAssetAddress) return

        const asset = filecoinLoans?.loanAssets?.[principalAssetAddress]
        const erc20LoansContract = filecoinLoans?.contracts?.[ASSETS[asset?.blockchain].chainId]?.ERC20Loans?.address

        // Instantiate ETH
        const eth = new ETH(asset?.blockchain, 'mainnet')

        // Get allowance
        const allowanceRes = await eth.getAllowance(erc20LoansContract, principalAssetAddress, wallet?.[asset?.blockchain])
        console.log('allowance: ', allowanceRes)

        let tokenAllowance
        if (allowanceRes?.status !== 'OK') tokenAllowance = 0
        else tokenAllowance = allowanceRes?.payload

        this.setState({
            tokenAllowance,
        })
    }

    handleOpenApproveModalBtn = async () => {
        const { dispatch, filecoinLoans } = this.props
        const { principalAssetAddress, principalAsset } = this.state

        const asset = filecoinLoans?.loanAssets?.[principalAssetAddress]

        // Get Gas Data
        const eth = new ETH(asset?.blockchain, 'mainnet')
        const gasData = await eth.getGasData()
        console.log('Gas Data: ', gasData)

        await dispatch(prepareTxData({
            contractName: 'Filecoin Loans',
            operation: 'Approve',
            description: `Allow Filecoin Loans to spend your ${principalAsset}`,
            blockchain: asset?.blockchain,
            amount: '0',
            image: 'FILECOIN_LOANS',
            gasLimit: '55000',
            gasPrice: gasData?.gasPrice,
        }))

        this.setState({ confirmApproveTxModalIsOpen: true })
    }

    handleApproveBtn = async () => {
        const { dispatch, filecoinLoans, prepareTx, wallet } = this.props
        const { principalAssetAddress, principalAsset } = this.state

        // Prepare contracts
        const asset = filecoinLoans?.loanAssets?.[principalAssetAddress]
        const erc20LoansContract = filecoinLoans?.contracts?.[ASSETS[asset?.blockchain].chainId]?.ERC20Loans?.address

        this.setState({ loading: true, loadingMsg: `Approving ${principalAsset}` })

        const allowanceAmount = '100000000000'

        // Instantiate ETH
        const eth = new ETH(asset?.blockchain, 'mainnet')

        // Send Approve Tx
        const response = await eth.approveAllowance(
            erc20LoansContract,
            allowanceAmount,
            principalAssetAddress,
            prepareTx?.gasPrice,
            prepareTx?.gasLimit,
            wallet?.[asset?.blockchain]
        )

        console.log(response)

        if (response?.status !== 'OK') {
            Alert.alert('Error', response?.message, [{ text: 'OK' }])
            this.setState({ loading: false, loadingMsg: '' })
            return
        }

        // Update Allowance
        await this.checkAllowance()

        // Save Filecoin Loans Tx
        dispatch(saveFLTx({
            receipt: response?.payload,
            txHash: response?.payload?.transactionHash,
            from: response?.payload?.from,
            summary: `Approve ${principalAsset}`,
            blockchain: asset?.blockchain,
            protocolName: 'Filecoin Loans'
        }))

        // Show Toast
        Toast.show({
            text1: `Approve ${principalAsset}`,
            text2: 'Successfull Transaction',
            type: 'success'
        })

        // Update State
        this.setState({
            loading: false,
            loadingMsg: '',
            confirmApproveTxModalIsOpen: false
        })
    }


    handleOpenConfirmModalBtn = async () => {

        const {
            principal, principalAmount, principalAsset, principalAssetAddress,
            loanDuration, interestRate, collateralizationRatio
        } = this.state
        const { dispatch, filecoinLoans, prices, tokens } = this.props

        try {
            if (!principalAmount || BigNumber(principalAmount).lte(0) || isNaN(principalAmount)) {
                Alert.alert('Error', 'Enter a valid principal', [{ text: 'OK' }])
                return
            }

            const principalBalance = BigNumber(tokens[principalAssetAddress]?.balance)

            if (principalBalance.lt(principalAmount)) {
                Alert.alert('Error', 'Insufficient balance', [{ text: 'OK' }])
                return
            }

            let interestOwedAnnual = BigNumber(principalAmount).multipliedBy(interestRate).dividedBy(100)
            const interestAmount = interestOwedAnnual.dividedBy(365).multipliedBy(loanDuration)
            const repaymentAmount = interestAmount.plus(principalAmount).toString()

            dispatch(prepareTxData({
                principalAmount: principalAmount,
                principalAsset,
                principalAssetAddress,
                loanDuration,
                interestRate,
                collateralizationRatio,
                repaymentAmount,
                interestAmount: interestAmount.toString(),
            }))

            this.setState({ confirmModalIsOpen: true })
        } catch (e) {
            console.log(e)
        }
    }

    handleSignBtn = async () => {
        const { principalAssetAddress, principalAsset, principalAmount } = this.state
        const { wallet, filecoinLoans, dispatch } = this.props
        const asset = filecoinLoans?.loanAssets?.[principalAssetAddress]

        const chainId = ASSETS[asset?.blockchain]?.chainId

        // ERC20Loans contract
        const erc20LoansContract = filecoinLoans?.contracts?.[chainId]?.ERC20Loans?.address

        this.setState({ loading: true, loadingMsg: 'Preparing Transaction' })

        // Instantiate ETH
        let eth
        try {
            eth = new ETH(asset?.blockchain, 'mainnet')
        } catch (e) {
            console.log(e)
            this.setState({ loading: false, loadingMsg: '' })
            return
        }

        // Instantiate ERC20Loans
        let erc20Loans
        try {
            erc20Loans = new ERC20Loans(eth.web3, erc20LoansContract, eth.CHAIN_ID)
        } catch (e) {
            console.log(e)
            this.setState({ loading: false, loadingMsg: '' })
            return
        }

        // Get user loans count
        const keys = wallet?.[asset?.blockchain]
        const userLoansCount = await erc20Loans.getUserLoansCount(keys?.publicKey)
        console.log(userLoansCount)

        if (userLoansCount?.status !== 'OK') {
            this.setState({ loading: false, loadingMsg: '' })
            return
        }

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to lend. Nonce: ${parseInt(userLoansCount?.payload) + 1}. Contract: ${erc20LoansContract}`
        console.log('message: ', message)
        const secretData = await generateSecret(message, keys)
        console.log('secretData: ', secretData)

        if (secretData?.status !== 'OK') {
            this.setState({ loading: false, loadingMsg: '' })
            return
        }

        // Get Gas Data
        const gasData = await eth.getGasData()
        console.log('Gas Data: ', gasData)

        await dispatch(updatePreTxData({
            secretHashB1: secretData?.payload?.secretHash,
            contractName: 'Filecoin Loans',
            operation: 'Create Loan Offer',
            description: `Lock ${principalAmount} ${principalAsset} to create Loan Offer`,
            blockchain: asset?.blockchain,
            amount: '0',
            image: 'FILECOIN_LOANS',
            gasLimit: '850000',
            gasPrice: gasData?.gasPrice
        }))

        this.setState({
            loading: false,
            loadingMsg: '',
            confirmModalIsOpen: false,
            confirmCreateTxModalIsOpen: true
        })
    }

    handleSendTxBtn = async () => {
        const { prepareTx, filecoinLoans, wallet, dispatch, navigation } = this.props

        const chainId = ASSETS[prepareTx?.blockchain]?.chainId

        // ERC20Loans contract
        const erc20LoansContract = filecoinLoans?.contracts?.[chainId]?.ERC20Loans?.address

        this.setState({ loading: true, loadingMsg: 'Sending Transaction' })

        // Instantiate ETH
        let eth
        try {
            eth = new ETH(prepareTx?.blockchain, 'mainnet')
        } catch (e) {
            console.log(e)
            this.setState({ loading: false, loadingMsg: '' })
            return
        }

        // Instantiate ERC20Loans
        let erc20Loans
        try {
            erc20Loans = new ERC20Loans(eth.web3, erc20LoansContract, eth.CHAIN_ID)
        } catch (e) {
            console.log(e)
            this.setState({ loading: false, loadingMsg: '' })
            return
        }

        // Send Transaction
        let response
        try {
            response = await erc20Loans.createLoanOffer(
                prepareTx?.secretHashB1,
                wallet?.FIL?.publicKey,
                prepareTx?.principalAmount,
                prepareTx?.interestAmount,
                prepareTx?.principalAssetAddress,
                prepareTx?.loanDuration,
                prepareTx?.gasLimit,
                prepareTx?.gasPrice,
                wallet?.[prepareTx?.blockchain]
            )
        } catch (e) {
            console.log(e)
            Alert.alert('Error', 'Error creating transaction', [{ text: 'OK' }])
            this.setState({ loading: false, loadingMsg: '' })
            return
        }

        console.log(response)

        if (response?.status !== 'OK') {
            this.setState({ loading: false, loadingMsg: '' })
            Alert.alert('Error', response?.message, [{ text: 'OK' }])
            return
        }

        // Save Filecoin Loans Tx
        dispatch(saveFLTx({
            receipt: response?.payload,
            txHash: response?.payload?.transactionHash,
            from: response?.payload?.from,
            summary: `Lock ${prepareTx?.principalAmount} ${prepareTx?.principalAsset} to create Loan Offer.`,
            blockchain: prepareTx?.blockchain,
            protocolName: 'Filecoin Loans',
        }))

        // Show Toast
        Toast.show({
            text1: `Create Loan Offer`,
            text2: 'Successfull Transaction',
            type: 'success'
        })

        // API call
        const params = {
            operation: 'CreateLoanOffer',
            networkId: chainId,
            txHash: response?.payload?.transactionHash
        }

        this.intervalId = setInterval(async () => {
            confirmERC20LoanOperation(params)
                .then(data => data.json())
                .then((res) => {
                    console.log(res)
                    if (res?.status === 'OK') {
                        this.setState({ loading: false, loadingMsg: '', confirmCreateTxModalIsOpen: false })
                        clearInterval(this.intervalId)
                        // navigation.navigate('')
                        return
                    }
                })
        }, 3000)

    }

    render() {

        const { filecoinLoans, tokens } = this.props
        const {
            principalAmount, principalAmountErrorMsg, principalAmountIsInvalid,
            principalAsset, principalAssetAddress,
            loanDuration, loanDurationErrorMsg, loanDurationIsInvalid,
            interestRate, collaterallizationRatio,
            selectAssetModalIsOpen,
            loading, loadingMsg,
            tokenAllowance, confirmModalIsOpen, confirmApproveTxModalIsOpen,
            confirmCreateTxModalIsOpen
        } = this.state

        if (loading) {
            return <Loading message={loadingMsg} />
        }

        let tokenBalance = tokens[principalAssetAddress]?.balance
        tokenBalance = !isNaN(tokenBalance) ? tokenBalance : '0'

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <View style={{ paddingHorizontal: 0, paddingTop: 20, backgroundColor: 'white' }}>
                    <Header
                        title="New Borrow Request"
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
                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>Enter the collateral amount and asset</Text>
                            </View>
                            <View style={{ backgroundColor: 'whitesmoke', paddingTop: 15, paddingBottom: 2.5, borderRadius: 12, marginTop: 10 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 5 }}>
                                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}>Input</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}>{principalAsset != '' ? `Balance: ${tokenBalance != '0' ? parseFloat(tokenBalance).toFixed(3) : '0'}` : '-'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 8 }}>
                                        <MyTextInput
                                            onChangeText={this.handlePrincipalAmountChange}
                                            value={principalAmount}
                                            placeholder="0"
                                            keyboardType="numeric"
                                            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, backgroundColor: 'whitesmoke', borderWidth: 0 }}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => this.setState({ selectAssetModalIsOpen: true })}
                                        style={{ backgroundColor: 'whitesmoke', flex: 4, justifyContent: 'space-evenly', alignItems: 'center', flexDirection: 'row', borderColor: 'whitesmoke', borderWidth: 1, borderLeftWidth: 0, borderRadius: 4, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                        <View style={{ flexDirection: 'row', }}>
                                            {
                                                principalAsset
                                                    ?
                                                    <Fragment>
                                                        <View>
                                                            <ImageLoad
                                                                style={{ height: 20, width: 20 }}
                                                                source={{ uri: `${API}/static/logo/${principalAsset}` }}
                                                                placeholderSource={require('../../../../../assets/images/ERC20.png')}
                                                                placeholderStyle={{ height: 20, width: 20, }}
                                                            />
                                                        </View>
                                                        <View style={{ marginLeft: 5 }}>
                                                            <Text style={{ fontFamily: 'Poppins-SemiBold' }}>DAI</Text>
                                                        </View>
                                                        <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
                                                            <FontAwesome style={{ top: -2 }} name='angle-down' size={18} />
                                                        </View>
                                                    </Fragment>
                                                    :
                                                    <Fragment>
                                                        <View style={{ marginLeft: 5 }}>
                                                            <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Select</Text>
                                                        </View>
                                                        <View style={{ justifyContent: 'center', marginLeft: 5 }}>
                                                            <FontAwesome style={{ top: -2 }} name='angle-down' size={18} />
                                                        </View>
                                                    </Fragment>
                                            }

                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={{ paddingTop: 15, paddingBottom: 5, borderRadius: 12, marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 5 }}>
                                <View style={{ marginRight: 10, width: 25, height: 25, backgroundColor: '#0062ff', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'white' }}>2</Text></View>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>Select loan length</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 5, justifyContent: 'space-between', marginHorizontal: 5 }}>
                                <TouchableOpacity
                                    onPress={() => this.handleLoanDurationClick('30')}
                                    style={loanDuration == 30 ? styles.btnSelected : styles.btn}>
                                    <Text style={loanDuration == 30 ? { color: 'white' } : { color: 'black' }}>30 Days</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => this.handleLoanDurationClick('60')}
                                    style={loanDuration == 60 ? styles.btnSelected : styles.btn}>
                                    <Text style={loanDuration == 60 ? { color: 'white' } : { color: 'black' }}>60 Days</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => this.handleLoanDurationClick('90')}
                                    style={loanDuration == 90 ? styles.btnSelected : styles.btn}>
                                    <Text style={loanDuration == 90 ? { color: 'white' } : { color: 'black' }}>90 Days</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ paddingTop: 15, paddingBottom: 5, borderRadius: 12, marginTop: 20 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 5 }}>
                                <View style={{ marginRight: 10, width: 25, height: 25, backgroundColor: '#0062ff', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'white' }}>3</Text></View>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>Select the interest rate: </Text>
                                <Text style={{ fontFamily: 'Poppins-Regular', marginLeft: 5 }}>{interestRate}%</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Slider
                                    onValueChange={(value) => this.setState({ interestRate: value })}
                                    value={parseFloat(interestRate)}
                                    style={{ width: '100%', height: 40, }}
                                    minimumValue={5}
                                    maximumValue={25}
                                    minimumTrackTintColor="#0062FF"
                                    maximumTrackTintColor="black"
                                    thumbTintColor="#0062FF"
                                    step={0.5}
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

                    </ScrollView>
                    <View style={{ width: '100%', marginBottom: 20 }}>
                        {
                            (BigNumber(tokenAllowance).lt(principalAmount)) && BigNumber(principalAmount).lte(tokenBalance)
                                ?
                                <PrimaryBtn
                                    disabled={!principalAmount || !principalAsset ? true : false}
                                    onPress={this.handleOpenApproveModalBtn}
                                    title={`Approve ${principalAsset}`}
                                />
                                : <PrimaryBtn
                                    disabled={!principalAmount || !principalAsset ? true : false}
                                    onPress={this.handleOpenConfirmModalBtn}
                                    title='Continue'
                                />
                        }

                    </View>
                </View>

                <SelectAssetModal
                    isVisible={selectAssetModalIsOpen}
                    onClose={() => this.setState({ selectAssetModalIsOpen: false })}
                    onAssetSelect={this.onAssetSelect}
                    filteredTokens={filecoinLoans?.loanAssets}
                />

                <ConfirmCreateRequestModal
                    isVisible={confirmModalIsOpen}
                    onClose={() => this.setState({ confirmModalIsOpen: false })}
                    onConfirmBtn={this.handleSignBtn}
                />

                <ConfirmTxModal
                    isVisible={confirmApproveTxModalIsOpen}
                    onClose={() => this.setState({ confirmApproveTxModalIsOpen: false })}
                    onConfirmBtn={this.handleApproveBtn}
                />

                <ConfirmTxModal
                    isVisible={confirmCreateTxModalIsOpen}
                    onClose={() => this.setState({ confirmCreateTxModalIsOpen: false })}
                    onConfirmBtn={this.handleSendTxBtn}
                />

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
    btnSelected: {
        backgroundColor: '#0062FF',
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 20
    },
    btn: {
        backgroundColor: 'white',
        borderColor: 'grey',
        borderWidth: 0.2,
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 20
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
        // shadowOffset: {width: 0, height: 0 },
        // shadowOpacity: 0.1,
        // shadowRadius: 5,
        // shadowColor: '#000',
        // shadowOffset: {width: 0, height: 2 },
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

function mapStateToProps({ loanRequest, tokens, shared, wallet, prepareTx, prices, filecoinLoans }) {
    return {
        loanRequest,
        tokens,
        shared,
        wallet: wallet && wallet.wallet,
        prepareTx,
        prices,
        filecoinLoans
    }
}

export default connect(mapStateToProps)(LendERC20View)