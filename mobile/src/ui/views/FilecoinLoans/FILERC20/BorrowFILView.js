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
import ConfirmCreateRequestModal from './Modals/ConfirmCreateRequestModal'
import ConfirmTxModal from '../../../components/ConfirmTxModal'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import ETH from '../../../../crypto/ETH'
import ERC20CollateralLock from '../../../../crypto/filecoinLoans/ERC20CollateralLock'
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
import { confirmERC20CollateralLockOperation } from '../../../../utils/filecoin_loans'

// Test
import { saveToken } from '../../../../actions/tokens'


class BorrowFILView extends Component {

    state = {
        // Principal
        principal: '',
        principalErrorMsg: '',
        principalIsInvalid: false,

        // Collateral Asset
        collateralAsset: '',
        collateralAssetAddress: '',

        // Collateral Amount
        collateralAmount: '',
        collateralAmountErrorMsg: '',
        collateralAmountIsInvalid: false,

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

    modalizeRef = React.createRef()

    componentDidMount() {
        SplashScreen.hide()

        const { dispatch, shared, tokens, loanRequest } = this.props

        // const token = tokens[shared.selectedToken]

        this.modalizeRef.current?.open();


        this.checkAllowance()


    }

    loadTestData = async () => {
        const { dispatch } = this.props
    }

    handlePrincipalChange = (value) => {
        const { prices } = this.props
        const { collaterallizationRatio } = this.state
        const principal = value

        if (!(principal === '' || (/^\d*\.?\d*$/).test(principal))) return

        if (!principal || principal === '.') {
            this.setState({ principal, collateralAmount: '' })
            return
        }

        const filValue = BigNumber(prices?.FIL?.usd).multipliedBy(principal)
        const collateralRequired = filValue.multipliedBy(collaterallizationRatio).dividedBy(100)

        this.setState({
            principal,
            collateralAmount: parseFloat(collateralRequired).toFixed(4),
            principalIsInvalid: false
        })
    }

    handleCollateralAmountChange = (value) => {
        const { prices } = this.props
        const collateralAmount = value

        if (!(collateralAmount === '' || (/^\d*\.?\d*$/).test(collateralAmount))) return

        if (!collateralAmount || collateralAmount == '.') {
            this.setState({ principal: '', collateralAmount })
            return
        }

        const principal = BigNumber(collateralAmount).dividedBy(prices?.FIL?.usd).multipliedBy(100).dividedBy(150)

        this.setState({ collateralAmount, principal: parseFloat(principal).toFixed(4), collateralAmountIsInvalid: false })
    }

    onAssetSelect = async (symbol, contractAddress) => {
        await this.setState({
            collateralAsset: symbol,
            collateralAssetAddress: contractAddress,
            selectAssetModalIsOpen: false
        })
        this.checkAllowance()
    }

    handleLoanDurationClick = (loanDuration) => {
        this.setState({ loanDuration })
    }

    checkAllowance = async () => {
        const { filecoinLoans, wallet } = this.props
        const { collateralAssetAddress } = this.state

        if (!collateralAssetAddress) return

        const asset = filecoinLoans?.loanAssets?.[collateralAssetAddress]
        const collateralLockContract = filecoinLoans?.contracts?.[ASSETS[asset?.blockchain].chainId]?.ERC20CollateralLock?.address

        // Instantiate ETH
        const eth = new ETH(asset?.blockchain, 'mainnet')

        // Get allowance
        const allowanceRes = await eth.getAllowance(collateralLockContract, collateralAssetAddress, wallet?.[asset?.blockchain])
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
        const { collateralAssetAddress, collateralAsset } = this.state

        const asset = filecoinLoans?.loanAssets?.[collateralAssetAddress]

        // Get Gas Data
        const eth = new ETH(asset?.blockchain, 'mainnet')
        const gasData = await eth.getGasData()
        console.log('Gas Data: ', gasData)

        await dispatch(prepareTxData({
            contractName: 'Filecoin Loans',
            operation: 'Approve',
            description: `Allow Filecoin Loans to spend your ${collateralAsset}`,
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
        const { collateralAssetAddress, collateralAsset } = this.state

        // Prepare contracts
        const asset = filecoinLoans?.loanAssets?.[collateralAssetAddress]
        const collateralLockContract = filecoinLoans?.contracts?.[ASSETS[asset?.blockchain].chainId]?.ERC20CollateralLock?.address

        this.setState({ loading: true, loadingMsg: `Approving ${collateralAsset}` })

        const allowanceAmount = '100000000000'

        // Instantiate ETH
        const eth = new ETH(asset?.blockchain, 'mainnet')

        // Send Approve Tx
        const response = await eth.approveAllowance(
            collateralLockContract,
            allowanceAmount,
            collateralAssetAddress,
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
            summary: `Approve ${collateralAsset}`,
            blockchain: asset?.blockchain,
            protocolName: 'Filecoin Loans'
        }))

        // Show Toast
        Toast.show({
            text1: `Approve ${collateralAsset}`,
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
            principal, collateralAmount, collateralAsset, collateralAssetAddress,
            loanDuration, interestRate, collateralizationRatio
        } = this.state
        const { dispatch, filecoinLoans, prices, tokens } = this.props

        try {
            if (!principal || BigNumber(principal).lte(0) || isNaN(principal)) {
                Alert.alert('Error', 'Enter a valid principal', [{ text: 'OK' }])
                return
            }

            if (!collateralAmount || BigNumber(collateralAmount).lte(0) || isNaN(collateralAmount)) {
                Alert.alert('Error', 'Enter a valid collateral amount', [{ text: 'OK' }])
                return
            }

            const collateralBalance = BigNumber(tokens[collateralAssetAddress]?.balance)

            if (collateralBalance.lt(collateralAmount)) {
                Alert.alert('Error', 'Insufficient balance', [{ text: 'OK' }])
                return
            }

            let interestOwedAnnual = BigNumber(principal).multipliedBy(interestRate).dividedBy(100)
            let interestOwedPeriod = interestOwedAnnual.dividedBy(365).multipliedBy(loanDuration)
            const repaymentAmount = interestOwedPeriod.plus(principal).toString()
            let liquidationPrice = BigNumber(prices?.FIL?.usd).multipliedBy(1.5).toString()
            const interestAmount = BigNumber(repaymentAmount).minus(principal).toString()

            dispatch(prepareTxData({
                principalAmount: principal,
                collateralAmount,
                collateralAsset,
                collateralAssetAddress,
                loanDuration,
                interestRate,
                collateralizationRatio,
                repaymentAmount,
                interestAmount,
                liquidationPrice
            }))

            this.setState({ confirmModalIsOpen: true })
        } catch (e) {
            console.log(e)
        }
    }

    handleSignBtn = async () => {
        const { collateralAssetAddress, collateralAsset, collateralAmount } = this.state
        const { wallet, filecoinLoans, dispatch } = this.props
        const asset = filecoinLoans?.loanAssets?.[collateralAssetAddress]

        const chainId = ASSETS[asset?.blockchain]?.chainId

        // ERC20CollateralLock contract
        const collateralLockContract = filecoinLoans?.contracts?.[chainId]?.ERC20CollateralLock?.address

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

        // Instantiate ERC20CollateralLock
        let collateralLock
        try {
            collateralLock = new ERC20CollateralLock(eth.web3, collateralLockContract, eth.CHAIN_ID)
        } catch (e) {
            console.log(e)
            this.setState({ loading: false, loadingMsg: '' })
            return
        }

        // Get user loans count
        const keys = wallet?.[asset?.blockchain]
        const userLoansCount = await collateralLock.getUserLoansCount(keys?.publicKey)
        console.log(userLoansCount)

        if (userLoansCount?.status !== 'OK') {
            this.setState({ loading: false, loadingMsg: '' })
            return
        }

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to create the request. Nonce: ${parseInt(userLoansCount?.payload) + 1}. Contract: ${collateralLockContract}`
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
            secretHashA1: secretData?.payload?.secretHash,
            contractName: 'Filecoin Loans',
            operation: 'Lock Collateral',
            description: `Lock ${collateralAmount} ${collateralAsset} as collateral to request a FIL Loan`,
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

        // ERC20CollateralLock contract
        const collateralLockContract = filecoinLoans?.contracts?.[chainId]?.ERC20CollateralLock?.address

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

        // Instantiate ERC20CollateralLock
        let collateralLock
        try {
            collateralLock = new ERC20CollateralLock(eth.web3, collateralLockContract, eth.CHAIN_ID)
        } catch (e) {
            console.log(e)
            this.setState({ loading: false, loadingMsg: '' })
            return
        }

        // Send Transaction
        const response = await collateralLock.createBorrowRequest(
            prepareTx?.secretHashA1,
            wallet?.FIL?.publicKey,
            prepareTx?.collateralAmount,
            prepareTx?.collateralAssetAddress,
            prepareTx?.principalAmount,
            prepareTx?.interestAmount,
            prepareTx?.loanDuration,
            prepareTx?.gasLimit,
            prepareTx?.gasPrice,
            wallet?.[prepareTx?.blockchain]
        )

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
            summary: `Lock ${prepareTx?.collateralAmount} ${prepareTx?.collateralAsset} as collateral.`,
            blockchain: prepareTx?.blockchain,
            protocolName: 'Filecoin Loans',
        }))

        // Show Toast
        Toast.show({
            text1: `Lock Collateral`,
            text2: 'Successfull Transaction',
            type: 'success'
        })

        // API call
        const params = {
            operation: 'CreateBorrowRequest',
            networkId: chainId,
            txHash: response?.payload?.transactionHash
        }

        this.intervalId = setInterval(async () => {
            confirmERC20CollateralLockOperation(params)
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
            principal, principalErrorMsg, principalIsInvalid,
            collateralAmount, collateralAmountErrorMsg, collateralAmountIsInvalid,
            collateralAsset, collateralAssetAddress,
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

        let tokenBalance = tokens[collateralAssetAddress]?.balance
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
                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>How much FIL would you like to borrow?</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 9 }}>
                                    <MyTextInput
                                        onChangeText={this.handlePrincipalChange}
                                        value={principal}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        style={{ borderTopLeftRadius: 12, borderBottomLeftRadius: 12, borderTopRightRadius: 0, borderBottomRightRadius: 0, backgroundColor: 'whitesmoke', borderWidth: 0 }}
                                    />
                                </View>
                                <View

                                    style={{ backgroundColor: 'whitesmoke', flex: 3, justifyContent: 'space-evenly', alignItems: 'center', flexDirection: 'row', borderColor: 'whitesmoke', borderWidth: 1, borderLeftWidth: 0, borderRadius: 12, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                    <View style={{ flexDirection: 'row', }}>
                                        <Fragment>
                                            <View>
                                                <FilecoinLogo height={20} width={20} />
                                            </View>
                                            <View style={{ marginLeft: 5 }}>
                                                <Text style={{ fontFamily: 'Poppins-SemiBold' }}>FIL</Text>
                                            </View>
                                        </Fragment>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={{ paddingTop: 15, paddingBottom: 5, borderRadius: 12, marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 5 }}>
                                <View style={{ marginRight: 10, width: 25, height: 25, backgroundColor: '#0062ff', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'white' }}>2</Text></View>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>Enter the collateral amount and asset</Text>
                            </View>
                            <View style={{ backgroundColor: 'whitesmoke', paddingTop: 15, paddingBottom: 2.5, borderRadius: 12, marginTop: 10 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 5 }}>
                                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}>Input</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}>{collateralAsset != '' ? `Balance: ${tokenBalance != '0' ? parseFloat(tokenBalance).toFixed(3) : '0'}` : '-'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 8 }}>
                                        <MyTextInput
                                            onChangeText={this.handleCollateralAmountChange}
                                            value={collateralAmount}
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
                                                collateralAsset
                                                    ?
                                                    <Fragment>
                                                        <View>
                                                            <ImageLoad
                                                                style={{ height: 20, width: 20 }}
                                                                source={{ uri: `${API}/static/logo/${collateralAsset}` }}
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
                                <View style={{ marginRight: 10, width: 25, height: 25, backgroundColor: '#0062ff', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'white' }}>3</Text></View>
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
                                <View style={{ marginRight: 10, width: 25, height: 25, backgroundColor: '#0062ff', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'white' }}>4</Text></View>
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
                                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}>5% Few Lenders</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}>25% More Lenders</Text>
                                </View>
                                <Text style={{ fontFamily: 'Poppins-Light', fontSize: 12, textAlign: 'justify', marginTop: 10 }}>Even though you can select the interest rate, lenders still have to fund your request. Lower interest rates, might take longer times to find a lender.</Text>
                            </View>
                        </View>

                    </ScrollView>
                    <View style={{ width: '100%', marginBottom: 20 }}>
                        {
                            (BigNumber(tokenAllowance).lt(collateralAmount)) && BigNumber(collateralAmount).lte(tokenBalance)
                                ?
                                <PrimaryBtn
                                    disabled={!principal || !collateralAmount || !collateralAsset ? true : false}
                                    onPress={this.handleOpenApproveModalBtn}
                                    title={`Approve ${collateralAsset}`}
                                />
                                : <PrimaryBtn
                                    disabled={!principal || !collateralAmount || !collateralAsset ? true : false}
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

export default connect(mapStateToProps)(BorrowFILView)