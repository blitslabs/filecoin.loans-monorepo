import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar,
    StyleSheet, Keyboard, TouchableOpacity, Platform, Alert
} from 'react-native'

// Components
import Header from '../../components/Header'
import { Divider } from 'react-native-paper'

// FIL / ERC20 Loans
// import LendFILModal from './FILERC20/Modals/LendFILModal'
// import CancelModal from './FILERC20/Modals/CancelModal'
// import AcceptOfferModal from './FILERC20/Modals/AcceptOfferModal'
// import SignWithdrawVoucherModal from './FILERC20/Modals/SignWithdrawVoucherModal'
// import WithdrawPrincipalModal from './FILERC20/Modals/WithdrawPrincipalModal'
// import RepayLoanModal from './FILERC20/Modals/RepayLoanModal'
// import AcceptPaybackModal from './FILERC20/Modals/AcceptPaybackModal'
// import UnlockCollateralModal from './FILERC20/Modals/UnlockCollateralModal'

// ERC20 / FIL Loans
import CancelModal from './ERC20FIL/Modals/CancelModal'
import ERC20LoanLockCollateralModal from './ERC20FIL/Modals/ERC20LoanLockCollateralModal'
import ERC20ApproveRequestModal from './ERC20FIL/Modals/ERC20ApproveRequestModal'
import ERC20LoanWithdrawModal from './ERC20FIL/Modals/ERC20LoanWithdrawModal'
import ERC20LoanRepayModal from './ERC20FIL/Modals/ERC20LoanRepayModal'
import ERC20LoanAcceptModal from './ERC20FIL/Modals/ERC20LoanAcceptModal'
import ERC20UnlockCollateralModal from './ERC20FIL/Modals/ERC20UnlockCollateralModal'

// Libraries
import SplashScreen from 'react-native-splash-screen'

// Actions
import { setSelectedAsset } from '../../../actions/shared'


// API
import { getLoansSettings } from '../../../utils/api'

import { ETH_CHAIN_NAME } from "@env"

const HEIGHT = Dimensions.get('window').height
class FLIntroView extends Component {

    cardStackRef = React.createRef()

    state = {
        lendFILModalIsVisible: true
    }

    componentDidMount() {
        SplashScreen.hide()
        Keyboard.dismiss()
        const { dispatch } = this.props

        const network = ETH_CHAIN_NAME === 'mainnet' ? 'mainnet' : 'testnet'

        getLoansSettings({ network })
            .then(data => data.json())
            .then((res) => {
                // console.log(res)
                if (res.status === 'OK') {
                    dispatch(saveLoanRequest(res.payload))
                   
                }
            })
    }

    handleLoanRequestType = (loanRequestType) => {
        // Coming Soon
        Alert.alert('Coming soon!', 'We are migrating this feature to the mainnet.', [{ text: 'OK' }])
        return

        const { dispatch, navigation } = this.props
        dispatch(saveLoanRequest({ loanRequestType }))
        if (loanRequestType === 'BORROW') {
            navigation.navigate('AvailableLoans')
            return
        } else if (loanRequestType === 'LEND') {
            navigation.navigate('SelectAsset')
            return
        }
    }

    handleMyLoansBtn = () => {
        console.log('MY_LOANS_BTN')
        const { navigation } = this.props
        navigation.navigate('MyLoans', { transition: 'SlideFromRight' })
    }

    render() {

        const { lendFILModalIsVisible } = this.state
        const { shared, } = this.props
        const { selectedAsset } = shared

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <Header
                    navigation={this.props.navigation}
                    title="Filecoin Loans"
                    centerComponentStyle={{ fontSize: 18, }}
                    customLeftComponent={true}
                />
                <View style={{ backgroundColor: 'transparent', flex: 1, paddingHorizontal: 20 }}>
                    <View style={{}}>
                        <Text style={styles.mainText}>FIL / ERC20 Market</Text>
                        <Text style={styles.secondaryText}>FIL Loans with ERC20 tokens as collateral.</Text>
                    </View>

                    <TouchableOpacity onPress={() => this.handleLoanRequestType('BORROW')} style={styles.btnContainer}>
                        <View style={{ width: '100%' }}>
                            <Text style={styles.btnTitle}>Borrow FIL</Text>
                            <Text style={styles.btnSubtitle}>Deposit Harmony (ONE) as collateral and borrow stablecoins on Ethereum's blockchain</Text>
                        </View>
                        <Image source={require('../../../../assets/images/bg1.jpg')} style={styles.btnBgImg} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.handleLoanRequestType('LEND')} style={styles.btnContainer}>
                        <View style={{ width: '100%' }}>
                            <Text style={styles.btnTitle}>Lend FIL</Text>
                            <Text style={styles.btnSubtitle}>Deposit stablecoins on Ethereum's blockchain to earn interest.</Text>
                        </View>
                        <Image source={require('../../../../assets/images/bg2.png')} style={styles.btnBgImg} />
                    </TouchableOpacity>

                    <Divider style={{ marginTop: 20 }} />

                    <View style={{}}>
                        <Text style={styles.mainText}>ERC20 / FIL Market</Text>
                        <Text style={styles.secondaryText}>ERC20 loans with FIL as collateral.</Text>
                    </View>

                    <TouchableOpacity onPress={() => this.handleLoanRequestType('BORROW')} style={styles.btnContainer}>
                        <View style={{ width: '100%' }}>
                            <Text style={styles.btnTitle}>Borrow Stablecoins</Text>
                            <Text style={styles.btnSubtitle}>Deposit Harmony (ONE) as collateral and borrow stablecoins on Ethereum's blockchain</Text>
                        </View>
                        <Image source={require('../../../../assets/images/bg1.jpg')} style={styles.btnBgImg} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.handleLoanRequestType('LEND')} style={styles.btnContainer}>
                        <View style={{ width: '100%' }}>
                            <Text style={styles.btnTitle}>Lend Stablecoins</Text>
                            <Text style={styles.btnSubtitle}>Deposit stablecoins on Ethereum's blockchain to earn interest.</Text>
                        </View>
                        <Image source={require('../../../../assets/images/bg2.png')} style={styles.btnBgImg} />
                    </TouchableOpacity>
                    {
                        lendFILModalIsVisible
                        &&
                        <ERC20UnlockCollateralModal
                            isVisible={lendFILModalIsVisible}
                            blockchain={'BNB'}
                            onTokenSelect={this.onTokenSelect}
                            handleCloseModal={() => this.setState({ confirmTxModalIsVisible: false })}
                        // handleConfirmBtn={() => this}
                        />
                    }
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        // height: HEIGHT,
        // paddingHorizontal: 20,
        paddingVertical: 20,
    },
    btnContainer: {
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: Platform.OS === 'ios' ? 10 : 5,
        // borderColor: 'black',
        // borderWidth: 1,
        // position: 'absolute',
        // flex: 1,
    },
    btnBgImg: {
        resizeMode: 'cover',
        width: Dimensions.get('window').width - 25,
        borderRadius: 10,
        height: 90,
        position: 'absolute',
        zIndex: -20
    },
    btnTitle: {
        fontFamily: 'Poppins-SemiBold',
        color: 'white',
        fontSize: 14
    },
    btnSubtitle: {
        fontFamily: 'Poppins-Regular',
        color: 'white',
        fontSize: 12
    },
    mainText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        marginTop: 20
    },
    secondaryText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginBottom: 10
    },
    myLoansContainer: {
        borderTopWidth: 0.5,
        borderTopColor: '#f1f1f1',
        marginTop: 20,
        paddingTop: 20,
        alignItems: 'center'
    },
    myLoansTxt: {
        fontFamily: 'Poppins-Regular',
    }

})

function mapStateToProps({ wallet, shared }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
    }
}

export default connect(mapStateToProps)(FLIntroView)