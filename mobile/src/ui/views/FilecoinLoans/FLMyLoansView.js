import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Keyboard, TouchableOpacity, Alert, ScrollView } from 'react-native'

import Header from '../../components/Header'



// Components 
import TextInputWithBtn from '../../components/TextInputWithBtn'
import PrimaryBtn from '../../components/PrimaryBtn'
import ConfirmTxModal from '../../components/ConfirmTxModal'
import Loading from '../../components/Loading'
import { TabView, TabBar } from 'react-native-tab-view'
import LoansList from '../../components/LoansList'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import ETH from '../../../crypto/ETH'
import { CONTRACTS } from '../../../crypto/index'
import { ETH_CHAIN_NAME } from "@env"
import currencyFormatter from 'currency-formatter'
import BigNumber from 'bignumber.js'
import { Switch } from 'react-native-paper'
// Actions


// API
import { getAccountLoans } from '../../../utils/filecoin_loans'


const WIDTH = Dimensions.get('window').width

class FLMyLoansView extends Component {

    state = {
        index: 0,
        routes: [
            { key: 'borrow', title: 'Borrowed' },
            { key: 'lend', title: 'Lent' }
        ],
        loanType: 'FIL',
        accountLoans: ''
    }

    modalizeRef = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        const { dispatch, publicKeys } = this.props

        getAccountLoans({ account: publicKeys?.BNB })
            .then(data => data.json())
            .then((res) => {
                console.log(res)
                if (res?.status === 'OK') {
                    const accountLoans = res?.payload
                    this.setState({
                        accountLoans,
                        filBorrowed: accountLoans?.filLoans?.filter((l, i) => l?.collateralLock?.borrower?.toUpperCase() == publicKeys?.BNB?.toUpperCase()),
                        filLent: accountLoans?.filLoans?.filter((l, i) => l?.collateralLock?.lender?.toUpperCase() == publicKeys?.BNB?.toUpperCase()),
                        erc20Borrowed: accountLoans?.erc20Loans?.filter((l) => l?.borrower?.toUpperCase() == publicKeys?.BNB?.toUpperCase()),
                        erc20Lent: accountLoans?.erc20Loans?.filter((l) => l?.lender?.toUpperCase() == publicKeys?.BNB?.toUpperCase()),
                    })
                }
            })

    }

    setIndex = (value) => this.setState({ index: value })

    renderScene = ({ route, }) => {
        const { navigation, filecoinLoans, loanDetails } = this.props
        const { loanType, filBorrowed, filLent, erc20Borrowed, erc20Lent } = this.state

        switch (route.key) {
            case 'borrow':
                if ((loanType === 'FIL' && filBorrowed?.length == 0) || (loanType === 'ERC20' && erc20Borrowed?.length == 0)) {
                    return (
                        <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ opacity: 0.4 }}>No loans found</Text>
                        </View>
                    )
                } else {
                    return (
                        <FlatList
                            contentContainerStyle={{ width: WIDTH - 40 }}
                            data={loanType === 'FIL' ? filBorrowed : erc20Borrowed}
                            renderItem={({ item, index }) => {


                                let interestAmount, apr, loanDuration, principalAsset, collateralAsset, status, collateralAmount, principalAmount

                                if (loanType === 'FIL') {
                                    principalAmount = BigNumber(item?.collateralLock?.principalAmount).toString()                                    
                                    loanDuration = parseInt(BigNumber(item?.collateralLock?.loanExpirationPeriod).dividedBy(86400).minus(3))
                                    interestAmount = parseFloat(BigNumber(principalAmount).multipliedBy(item?.collateralLock?.interestRate).dividedBy(365).multipliedBy(loanDuration)).toFixed(5)
                                    apr = parseFloat(BigNumber(item?.collateralLock?.interestRate).multipliedBy(100)).toFixed(2)
                                    status = status = FIL_LOAN_STATUS?.[loanDetails?.collateralLock?.state ? loanDetails?.collateralLock?.state : '0'][loanDetails?.filLoan?.state ? loanDetails?.filLoan?.state : '0'][loanDetails?.filPayback?.state ? loanDetails?.filPayback?.state : '0']
                                    principalAsset = { symbol: 'FIL' }
                                    collateralAsset = filecoinLoans?.loanAssets?.[item?.token]
                                    collateralAmount = parseFloat(BigNumber(item?.collateralLock?.collateralAmount)).toFixed(4)
                                }
                                else if (loanType === 'ERC20') {
                                    principalAmount = item?.principalAmount
                                    loanDuration = parseInt((BigNumber(item?.loanExpirationPeriod).dividedBy(86400)).minus(3)).toString()
                                    apr = parseFloat(BigNumber(item?.interestAmount).dividedBy(item?.principalAmount).multipliedBy(BigNumber(365).dividedBy(loanDuration)).multipliedBy(100)).toFixed(2)
                                    interestAmount = parseFloat(item?.interestAmount).toFixed(4)
                                    status = ERC20_LOAN_STATUS?.[item?.state ? item?.state : '0'][item?.collateralLock?.state ? item?.collateralLock?.state : '0']
                                    principalAsset = filecoinLoans?.loanAssets?.[item?.token]
                                    collateralAsset = { symbol: 'FIL' }
                                    collateralAmount = parseFloat(BigNumber(item?.collateralAmount).dividedBy(1e18)).toFixed(4)
                                }

                                return (
                                    <TouchableOpacity key={index}
                                        onPress={() => loanType === 'FIL' ? this.props.navigation.navigate('FILLoanDetails', { loanId: item?.collateralLock?.id }) : this.props.navigation.navigate('ERC20LoanDetails', { loanId: item?.id })}
                                        style={styles.btnContainer}>
                                        <View style={styles.cardHeader}>
                                            <View>
                                                <Text style={styles.cardTitle}>ID #{item?.id}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.cardTitle}>{status}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.cardBody, { marginTop: 5 }]}>
                                            <View style={{ flex: 2 }}>
                                                <Text style={styles.cardDataTitle}>Amount</Text>
                                                <Text style={styles.cardDataValue}>{principalAmount} {principalAsset?.symbol}</Text>
                                            </View>
                                            <View style={{ flex: 2, }}>
                                                <Text style={styles.cardDataTitle}>Interest</Text>
                                                <Text style={styles.cardDataValue}>{interestAmount} {principalAsset?.symbol}</Text>
                                            </View>
                                            <View style={{ flex: 1, }}>
                                                <Text style={styles.cardDataTitle}>APR</Text>
                                                <Text style={styles.cardDataValue}>{apr}%</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.cardBody, { marginBottom: 5 }]}>
                                            <View style={{ flex: 2 }}>
                                                <Text style={styles.cardDataTitle}>Collateral</Text>
                                                <Text style={styles.cardDataValue}>{collateralAmount} {collateralAsset?.symbol}</Text>
                                            </View>
                                            <View style={{ flex: 2 }}>
                                                <Text style={styles.cardDataTitle}>Coll. Ratio</Text>
                                                <Text style={styles.cardDataValue}>150%</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.cardDataTitle}>Duration</Text>
                                                <Text style={styles.cardDataValue}>{loanDuration}d</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    )
                }

            case 'lend':
                
                if ((loanType === 'FIL' && filLent?.length == 0) || (loanType === 'ERC20' && erc20Lent?.length == 0)) {
                    return (
                        <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ opacity: 0.4 }}>No loans found</Text>
                        </View>
                    )
                } else {
                    return (
                        <FlatList
                            contentContainerStyle={{ width: WIDTH - 40 }}
                            data={loanType === 'FIL' ? filLent : erc20Lent}
                            renderItem={({ item, index }) => {

                                let interestAmount, apr, loanDuration, principalAsset, collateralAsset, status, collateralAmount, principalAmount
                                if (loanType === 'FIL') {
                                    principalAmount = BigNumber(item?.collateralLock?.principalAmount).toString()                                   
                                    loanDuration = parseInt(BigNumber(item?.collateralLock?.loanExpirationPeriod).dividedBy(86400).minus(3))
                                    interestAmount = parseFloat(BigNumber(principalAmount).multipliedBy(item?.collateralLock?.interestRate).dividedBy(365).multipliedBy(loanDuration)).toFixed(5)
                                    apr = parseFloat(BigNumber(item?.interestRate).multipliedBy(100)).toFixed(2)
                                    status = FIL_LOAN_STATUS?.[loanDetails?.collateralLock?.state ? loanDetails?.collateralLock?.state : '0'][loanDetails?.filLoan?.state ? loanDetails?.filLoan?.state : '0'][loanDetails?.filPayback?.state ? loanDetails?.filPayback?.state : '0']
                                    principalAsset = { symbol: 'FIL' }
                                    collateralAsset = filecoinLoans?.loanAssets?.[item?.token]
                                    collateralAmount = parseFloat(BigNumber(item?.collateralAmount).dividedBy(1e18)).toFixed(4)
                                }
                                else if (loanType === 'ERC20') {
                                    principalAmount = item?.principalAmount
                                    loanDuration = parseInt((BigNumber(item?.loanExpirationPeriod).dividedBy(86400)).minus(3)).toString()
                                    apr = parseFloat(BigNumber(item?.interestAmount).dividedBy(item?.principalAmount).multipliedBy(BigNumber(365).dividedBy(loanDuration)).multipliedBy(100)).toFixed(2)
                                    interestAmount = parseFloat(item?.interestAmount).toFixed(4)
                                    status = ERC20_LOAN_STATUS?.[item?.state ? item?.state : '0'][item?.collateralLock?.state ? item?.collateralLock?.state : '0']
                                    principalAsset = filecoinLoans?.loanAssets?.[item?.token]
                                    collateralAsset = { symbol: 'FIL' }
                                    collateralAmount = parseFloat(BigNumber(item?.collateralAmount).dividedBy(1e18)).toFixed(4)
                                }

                                return (
                                    <TouchableOpacity key={index}
                                        onPress={() => loanType === 'FIL' ? this.props.navigation.navigate('FILLoanDetails', { loanId: item?.id }) : this.props.navigation.navigate('ERC20LoanDetails', { loanId: item?.id })}
                                        style={styles.btnContainer}>
                                        <View style={styles.cardHeader}>
                                            <View>
                                                <Text style={styles.cardTitle}>ID #{item?.id}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.cardTitle}>{status}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.cardBody, { marginTop: 5 }]}>
                                            <View style={{ flex: 2 }}>
                                                <Text style={styles.cardDataTitle}>Amount</Text>
                                                <Text style={styles.cardDataValue}>{principalAmount} {principalAsset?.symbol}</Text>
                                            </View>
                                            <View style={{ flex: 2, }}>
                                                <Text style={styles.cardDataTitle}>Interest</Text>
                                                <Text style={styles.cardDataValue}>{interestAmount} {principalAsset?.symbol}</Text>
                                            </View>
                                            <View style={{ flex: 1, }}>
                                                <Text style={styles.cardDataTitle}>APR</Text>
                                                <Text style={styles.cardDataValue}>{apr}%</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.cardBody, { marginBottom: 5 }]}>
                                            <View style={{ flex: 2 }}>
                                                <Text style={styles.cardDataTitle}>Collateral</Text>
                                                <Text style={styles.cardDataValue}>{collateralAmount} {collateralAsset?.symbol}</Text>
                                            </View>
                                            <View style={{ flex: 2 }}>
                                                <Text style={styles.cardDataTitle}>Coll. Ratio</Text>
                                                <Text style={styles.cardDataValue}>150%</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.cardDataTitle}>Duration</Text>
                                                <Text style={styles.cardDataValue}>{loanDuration}d</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    )
                }
        }
    }

    renderTabBar = (props) => {
        return (
            <TabBar
                {...props}
                renderLabel={this.renderLabel}
                indicatorStyle={{ backgroundColor: 'transparent' }}
                style={{ backgroundColor: 'transparent' }}

            />
        )
    }

    renderLabel = (props) => {
        if (props.route.title === 'Borrowed') {
            return <View style={{ borderBottomWidth: props.focused ? 2 : 0 }}>
                <Text
                    textBreakStrategy='simple'
                    style={styles.tabLabel}>Borrow</Text>
            </View>
        }
        if (props.route.title === 'Lent') {
            return <View style={{ borderBottomWidth: props.focused ? 2 : 0 }}>
                <Text
                    textBreakStrategy='simple'
                    style={styles.tabLabel}>Lend</Text>
            </View>
        }
    }

    onToggleSwitch = () => {
        const { loanType } = this.state
        if (loanType === 'FIL') this.setState({ loanType: 'ERC20' })
        else if (loanType === 'ERC20') this.setState({ loanType: 'FIL' })
    }

    render() {

        const {
            loading, loadingMsg, accountLoans
        } = this.state
        const { publicKeys } = this.props

        if (loading) {
            return <Loading message={loadingMsg} />
        }



        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <View style={{ marginTop: 20, backgroundColor: 'white' }}>
                    <Header
                        title="My Loans"
                        navigation={this.props.navigation}
                        customLeftComponent={true}
                    // centerComponentStyle={{ fontSize: 20 }}
                    />
                </View>

                <View style={styles.container}>
                    {/* <View style={{ marginTop: 20 }}>
                        <Text style={styles.text_desc}>
                            Please confirm the details of your loan to broadcast your request to the network
                        </Text>
                    </View> */}

                    <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <Text style={{ fontFamily: 'Poppins-Regular' }}>Loan Type: </Text>
                            <Text style={{ fontFamily: 'Poppins-SemiBold' }}>{this.state.loanType}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Switch
                                value={this.state.loanType === 'FIL' ? true : false}
                                onValueChange={this.onToggleSwitch}
                                color='#0062FF'
                            />
                        </View>
                    </View>

                    <TabView
                        style={{ backgroundColor: 'white' }}
                        swipeEnabled={true}
                        renderTabBar={this.renderTabBar}
                        navigationState={{ index: this.state.index, routes: this.state.routes }}
                        renderScene={this.renderScene}
                        onIndexChange={this.setIndex}
                        initialLayout={{ width: WIDTH }}
                        lazy={true}
                    />

                </View>


            </SafeAreaView>
        )
    }
}

const FIL_LOAN_STATUS = {
    '0': {
        '0': { '0': 'Collateral Locked' }
    },
    '0.5': {
        '0': { '0': 'Approve Offer' }
    },
    '1': {
        '0': { '0': 'Sign Voucher' },
        '1': { '0': 'Withdraw Principal' },
        '2': { '0': 'Withdraw Principal' },
        '3': { '0': 'Withdraw Principal' },
        '4': {
            '0': 'Repay Loan',
            '1': 'Accept Payback',
            '2': 'Accept Payback',
            '3': 'Accept Payback',
            '4': 'Unlock Collateral'
        }
    },
    '2': {
        '3': {
            '0': 'Loan Closed'
        }
    },
    '3': {
        '4': {
            '2': 'Accept Payback',
            '3': 'Accept Payback',
            '4': 'Loan Closed'
        }
    },
    '4': {
        '0': {
            '0': 'Loan Canceled'
        }
    }
}

const ERC20_LOAN_STATUS = {
    '0': {
        '0': 'Lock Collateral',
    },
    '0.5': {
        '1': 'Approve Request'
    },
    '1': {
        '1': 'Approve Request',
        '2': 'Withdraw Principal',
        '3': 'Withdraw Principal',

    },
    '2': {
        '2': 'Repay Loan',
        '6': 'Seize Collateral',
        '7': 'Seize Collateral'
    },
    '3': {
        '2': 'Accept Payback',
    },
    '5': {
        '2': 'Unlock Collateral',
        '3': 'Unlock Collateral',
        '4': 'Unlock Collateral'
    },
    '6': {
        '0': 'Loan Canceled',
        '1': 'Loan Canceled',
        '4': 'Loan Canceled',
        '5': 'Loan Canceled'
    }
}

const styles = StyleSheet.create({
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0
    },
    safeArea: {
        flex: 1,

        backgroundColor: 'white'
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        // height: HEIGHT,
        marginHorizontal: 20,
        // paddingHorizontal: 20,
        paddingVertical: 0,
    },
    tabLabel: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        color: "#000",
        // fontWeight: 'bold'
    },
    text: {
        fontFamily: 'Poppins-Regular'
    },
    sm_text: {
        fontFamily: 'Poppins-Light',
        fontSize: 10
    },
    cardHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderColor: 'rgb(229, 229, 229)',
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: 12
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    cardDataTitle: {
        fontFamily: 'Poppins-Light',
        fontSize: 10
    },
    cardDataValue: {
        fontFamily: 'Poppins-SemiBold'
    },
    cardTitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12
    }

})

function mapStateToProps({ loanRequest, tokens, shared, wallet, prepareTx, collateralLockTxs, filecoinLoans }) {
    return {
        loanRequest,
        tokens,
        shared,
        wallet: wallet && wallet.wallet,
        publicKeys: wallet && wallet.publicKeys,
        prepareTx,
        collateralLockTxs,
        filecoinLoans,
    }
}

export default connect(mapStateToProps)(FLMyLoansView)