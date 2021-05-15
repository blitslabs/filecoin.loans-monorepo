import React, { Component, Fragment } from 'react'
import { View, AppState } from 'react-native'
import { connect } from 'react-redux'

// Navigation
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator, HeaderStyleInterpolators, TransitionSpecs, TransitionPresets } from '@react-navigation/stack'
import DrawerScreens from './DrawerScreens'

// Views
import IntroView from '../ui/views/IntroView'
import CreatePinView from '../ui/views/CreatePinView'
import ConfirmPinView from '../ui/views/ConfirmPinView'
import RecoverWalletView from '../ui/views/RecoverWalletView'
import SendView from '../ui/views/SendView'

import ReceiveView from '../ui/views/ReceiveView'
import FingerprintView from '../ui/views/FingerprintView'
import CongratulationsView from '../ui/views/CongratulationsView'
import TxSentView from '../ui/views/TxSentView'
import BackupWalletView from '../ui/views/BackupWalletView'
import SelectAssetView from '../ui/views/SelectAssetView'
import UnlockView from '../ui/views/UnlockView'
import QrCodeView from '../ui/views/QRCodeView'
import ConfirmTxView from '../ui/views/ConfirmTxView'
import TxCompleteView from '../ui/views/TxCompleteView'
import HistoryView from '../ui/views/HistoryView'

import AddTokenView from '../ui/views/AddTokenView'
import TokenDetailsView from '../ui/views/TokenDetailsView'
import SendTokenView from '../ui/views/SendTokenView'

import DoneView from '../ui/views/DoneView'

import ContactDetailsView from '../ui/views/ContactDetailsView'
import NewContactView from '../ui/views/NewContactView'
import ContactSelectAssetView from '../ui/views/ContactSelectAssetView'
import BackupWalletIntroView from '../ui/views/BackupWalletIntroView'
import PrepareBackupWalletView from '../ui/views/PrepareBackupWalletView'
import ConfirmMnemonicView from '../ui/views/ConfirmMnemonicView'
import WalletBackedView from '../ui/views/WalletBackedView'
import ChangePINView from '../ui/views/ChangePINView'
import TxDetailsView from '../ui/views/TxDetailsView'



// Filecoin Loans
import FLIntroView from '../ui/views/FilecoinLoans/FLIntroView'
import FLMyLoansView from '../ui/views/FilecoinLoans/FLMyLoansView'
import BorrowFILRequestsView from '../ui/views/FilecoinLoans/FILERC20/BorrowFILRequestsView'
import LendERC20OffersView from '../ui/views/FilecoinLoans/ERC20FIL/LendERC20OffersView'
import BorrowFILView from '../ui/views/FilecoinLoans/FILERC20/BorrowFILView'
import LendERC20View from '../ui/views/FilecoinLoans/ERC20FIL/LendERC20View'
import FILLoanDetailsView from '../ui/views/FilecoinLoans/FILERC20/FILLoanDetailsView'

// Icons
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'

import * as RootNavigation from './RootNavigation'
import SplashScreen from 'react-native-splash-screen'
import BackgroundTimer from 'react-native-background-timer'

// Actions 
import { toggleWalletLock, walletSaved } from '../actions/auth'

const Stack = createStackNavigator()


const headerOptions = ({ navigation, route }) => ({
    headerStyle: { elevation: 0 },
    headerLeft: () => (
        <View style={{ paddingLeft: 10 }}><IconMaterialCommunity name="chevron-left" size={40} color="black" onPress={() => { navigation.goBack() }} /></View>
    ),
    headerTitle: null,
})

const headerOptionsDefault = (headerTitle) => ({ navigation, route }) => ({
    headerStyle: { elevation: 0, },
    headerLeft: () => (
        <View style={{ paddingLeft: 10, }}><IconMaterialCommunity name="chevron-left" size={40} color="black" onPress={() => { navigation.goBack() }} /></View>
    ),
    headerTitleStyle: { alignSelf: 'center', fontFamily: 'Poppins-SemiBold', fontSize: 18 },
    headerRight: () => (<View />),
    headerTitle: headerTitle,
    ...MyTransition
})


// https://callstack.com/blog/custom-screen-transitions-in-react-navigation/
const MyTransition = {
    gestureDirection: 'horizontal',
    transitionSpec: {
        open: TransitionSpecs.TransitionIOSSpec,
        close: TransitionSpecs.TransitionIOSSpec,
    },
    headerStyleInterpolator: HeaderStyleInterpolators.forFade,
    cardStyleInterpolator: ({ current, next, layouts }) => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                        }),
                    },
                    {
                        rotate: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0],
                        }),
                    },
                    {
                        scale: next
                            ? next.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0.9],
                            })
                            : 1,
                    },
                ],
            },
            overlayStyle: {
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                }),
            },
        };
    },
}

class Navigation extends Component {

    state = {
        appState: AppState.currentState,
        loading: true,
    }

    componentDidMount() {
        // SplashScreen.hide()
        const { dispatch } = this.props
        // dispatch(walletSaved(false))
        this.setState({ loading: false })

        AppState.addEventListener('change', this.handleAppStateChange)
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange)
    }

    handleAppStateChange = (nextAppState) => {
        const { appState } = this.state
        const { dispatch } = this.props

        if (nextAppState !== 'active') {
            dispatch(toggleWalletLock(true))

            BackgroundTimer.setTimeout(() => {

                dispatch(toggleWalletLock(true))

            }, 100)
        }

        this.setState({ appState: nextAppState })
    }

    render() {

        const { auth, wallet } = this.props
        const { wallet_saved, wallet_lock } = auth


        return (
            <NavigationContainer ref={RootNavigation.navigationRef}>
                <Stack.Navigator initialRouteName="Wallet">
                    {
                        (!wallet || !wallet_saved || wallet_saved == false) ? (
                            <Fragment>
                                <Stack.Screen name="Intro" component={IntroView} options={{ header: () => null }} />
                                <Stack.Screen name="CreatePIN" component={CreatePinView} options={{ header: () => null }} />
                                <Stack.Screen name="ConfirmPIN" component={ConfirmPinView} options={{ header: () => null }} />
                                <Stack.Screen name="RecoverWallet" component={RecoverWalletView} options={headerOptionsDefault('Import Wallet')} />
                                <Stack.Screen name="Fingerprint" component={FingerprintView} options={{ header: () => null }} />
                                <Stack.Screen name="Congratulations" component={CongratulationsView} options={{ header: () => null }} />
                            </Fragment>
                        ) :
                            wallet_lock === true && wallet_saved === true ? (
                                <Stack.Screen name="UnlockWallet" component={UnlockView} options={{ header: () => null }} />
                            )
                                :
                                <Fragment >
                                    <Stack.Screen name="Wallet" component={DrawerScreens} options={{ headerShown: false }} />
                                    <Stack.Screen name="Send" component={SendView} options={headerOptionsDefault('Send')} />
                                    <Stack.Screen name="QRCode" component={QrCodeView} options={headerOptionsDefault('Scan')} />
                                    <Stack.Screen name="Receive" component={ReceiveView} options={headerOptionsDefault('Receive')} />
                                    <Stack.Screen name="ConfirmTx" component={ConfirmTxView} options={{ header: () => null, ...MyTransition }} />
                                    <Stack.Screen name="TxComplete" component={TxCompleteView} options={{ header: () => null, ...MyTransition }} />
                                    <Stack.Screen name="TxSent" component={TxSentView} options={{ header: () => null, ...MyTransition }} />
                                    <Stack.Screen name="BackupWallet" component={BackupWalletView} options={{ header: () => null, ...MyTransition }} />
                                    <Stack.Screen name="SelectAsset" component={SelectAssetView} options={{ header: () => null, ...MyTransition }} />
                                    <Stack.Screen name="History" component={HistoryView} options={headerOptionsDefault('History')} />
                                    <Stack.Screen name="AddToken" component={AddTokenView} options={headerOptionsDefault('Add Token')} />
                                    <Stack.Screen name="TokenDetails" component={TokenDetailsView} options={{ header: () => null, ...MyTransition }} />
                                    <Stack.Screen name="SendToken" component={SendTokenView} options={headerOptionsDefault('Send Token')} />
                                    <Stack.Screen name="DoneView" component={DoneView} options={{ headerShown: false }} />
                                   
                                   
                                    <Stack.Screen name="NewContact" component={NewContactView} options={headerOptionsDefault('New Contact')} />
                                    <Stack.Screen name="ContactDetails" component={ContactDetailsView} options={{ header: () => null }} />
                                    <Stack.Screen name="ContactSelectAsset" component={ContactSelectAssetView} options={{ header: () => null }} />
                                    <Stack.Screen name="BackupWalletIntro" component={BackupWalletIntroView} options={{ header: () => null }} />
                                    <Stack.Screen name="PrepareBackupWallet" component={PrepareBackupWalletView} options={{ header: () => null }} />
                                    <Stack.Screen name="ConfirmMnemonic" component={ConfirmMnemonicView} options={{ header: () => null }} />
                                    <Stack.Screen name="WalletBacked" component={WalletBackedView} options={{ header: () => null }} />
                                    <Stack.Screen name="ChangePIN" component={ChangePINView} options={{ header: () => null }} />
                                    <Stack.Screen name="TxDetails" component={TxDetailsView} options={{ header: () => null }} />
                                    

                                    <Stack.Screen name="FilecoinLoansIntro" component={FLIntroView} options={{ header: () => null }} />
                                    <Stack.Screen name="FLMyLoans" component={FLMyLoansView} options={{ header: () => null }} />
                                    <Stack.Screen name="BorrowFILRequests" component={BorrowFILRequestsView} options={{ header: () => null }} />
                                    <Stack.Screen name="LendERC20Offers" component={LendERC20OffersView} options={{ header: () => null }} />
                                    <Stack.Screen name="BorrowFIL" component={BorrowFILView} options={{ header: () => null }} />
                                    <Stack.Screen name="LendERC20" component={LendERC20View} options={{ header: () => null }} />
                                    <Stack.Screen name="FILLoanDetails" component={FILLoanDetailsView} options={{ header: () => null }} />
                                </Fragment>
                    }
                </Stack.Navigator>
            </NavigationContainer >
        )
    }
}

function mapStateToProps({ auth, wallet }) {
    return {
        auth,
        wallet
    }
}

export default connect(mapStateToProps)(Navigation)


