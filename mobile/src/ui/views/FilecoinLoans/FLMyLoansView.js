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
import Modal from 'react-native-modal'
import moment from 'moment'
import { sha256 } from '@liquality-dev/crypto'

// Actions


// API


const WIDTH = Dimensions.get('window').width

class FLMyLoansView extends Component {

    state = {
        index: 0,
        routes: [
            { key: 'first', title: 'Borrowed' },
            { key: 'second', title: 'Lent' }
        ],
        showTxModal: false,
    }

    modalizeRef = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        const { dispatch, publicKeys } = this.props
        this.modalizeRef.current?.open();
        // dispatch(removeLoans())
        

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

    setIndex = (value) => this.setState({ index: value })

    renderScene = ({ route, }) => {
        const { navigation } = this.props
        switch (route.key) {
            case 'first':
                return (
                    <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <LoansList navigation={navigation} list="BORROW" />
                    </View>
                )
            case 'second':
                return (
                    <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <LoansList navigation={navigation} list="LEND" />
                    </View>
                )
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

    render() {

        const {
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
                        title="My Loans"
                        navigation={this.props.navigation}
                        customLeftComponent={true}
                        centerComponentStyle={{ fontSize: 20 }}
                    />
                </View>

                <View style={styles.container}>
                    {/* <View style={{ marginTop: 20 }}>
                        <Text style={styles.text_desc}>
                            Please confirm the details of your loan to broadcast your request to the network
                        </Text>
                    </View> */}

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


                <Modal
                    isVisible={this.state.showTxModal}
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

})

function mapStateToProps({ loanRequest, tokens, shared, wallet, prepareTx, collateralLockTxs }) {
    return {
        loanRequest,
        tokens,
        shared,
        wallet: wallet && wallet.wallet,
        publicKeys: wallet && wallet.publicKeys,
        prepareTx,
        collateralLockTxs
    }
}

export default connect(mapStateToProps)(FLMyLoansView)