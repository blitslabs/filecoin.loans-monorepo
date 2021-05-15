import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar,
    StyleSheet, Keyboard, TouchableOpacity, Platform, Linking, Alert,
} from 'react-native'

import Header from '../components/Header'


const HEIGHT = Dimensions.get('window').height

// Components
import CurrencyModal from '../components/CurrencyModal'
import MyStatusBar from '../components/MyStatusBar'
import SelectAccountModal from '../components/SelectAccountModal'
import Loading from '../components/Loading'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import { List, Switch } from 'react-native-paper'
import { Gravatar } from 'react-native-gravatar'
import Rate, { AndroidMarket } from 'react-native-rate'
import DeviceInfo from 'react-native-device-info'
import Loader from "react-native-modal-loader"

// Icons
import IonIcon from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

// Actions
import { toggleBiometricAuth } from '../../actions/auth'
import { setSelectedAsset, setSelectedCurrency } from '../../actions/shared'

// API
import { getLoansSettings } from '../../utils/api'

import { ETH_CHAIN_NAME } from "@env"
import { ScrollView } from 'react-native-gesture-handler'

// SVG
import SafeIcon from '../../../assets/images/safe.svg'
import LockIcon from '../../../assets/images/lock.svg'
import FingerprintIcon from '../../../assets/images/fingerprint.svg'
import PaperMoneyIcon from '../../../assets/images/paper-money.svg'
import GeographyIcon from '../../../assets/images/geography.svg'
import WishListIcon from '../../../assets/images/wishlist.svg'
import HelpIcon from '../../../assets/images/help.svg'
import TwitterIcon from '../../../assets/images/twitter.svg'
import TelegramIcon from '../../../assets/images/telegram.svg'
import FacebookIcon from '../../../assets/images/facebook.svg'
import StarIcon from '../../../assets/images/star.svg'
import ProtectIcon from '../../../assets/images/protect.svg'
import ViewIcon from '../../../assets/images/view.svg'
import PrismIcon from '../../../assets/images/prism.svg'
import PhysicsIcon from '../../../assets/images/physics.svg'


class SettingsView extends Component {

    currencyModalRef = React.createRef()

    state = {
        isSwitchOn: false,
        version: '',
        showSelectAccountModal: false,
        loading: false
    }

    componentDidMount() {
        console.log('SETTINGS_PAGE_MOUNTED')
        SplashScreen.hide()
        Keyboard.dismiss()
        const { dispatch } = this.props
        this.setState({ version: DeviceInfo.getVersion() })


    }

    handleBackupWalletBtn = async () => {
        const { auth, navigation } = this.props

        if (auth?.wallet_backed) {
            const txConfirmationText = <View>
                <Text>Please you enter your PIN to reveal your recovery phrase</Text>
            </View>
            navigation.push('ConfirmTx', {
                txConfirmationText,
                handleSendTx: this.handlePINSuccess,
                title: 'Enter PIN to view mnemonic',
                loadingMsg: 'Loading...'
            })
            return
        }

        navigation.push('BackupWalletIntro')
    }

    handlePINSuccess = async () => {
        const { navigation } = this.props
        navigation.push('BackupWallet')
    }

    handleChangePasscodeBtn = async () => {
        const { navigation } = this.props

        const txConfirmationText = <View>
            <Text>Enter your current PIN to continue</Text>
        </View>

        navigation.push('ConfirmTx', {
            txConfirmationText,
            handleSendTx: this.handleChangePINSuccess,
            title: 'Current PIN',
            loadingMsg: 'Loading...'
        })
    }

    handleChangePINSuccess = async () => {
        const { navigation } = this.props
        navigation.push('ChangePIN')
    }

    handleBiometricToggle = () => {
        const { auth, dispatch } = this.props
        dispatch(toggleBiometricAuth(!auth?.biometric_auth))
    }

    handleRateAppBtn = async () => {
        const options = {
            // AppleAppID:"2193813192",
            GooglePackageName: "com.blits.wallet",
            preferredAndroidMarket: AndroidMarket.Google,
            preferInApp: false
        }
        Rate.rate(options, (success) => {
            console.log(success)
        })
    }

    handleCominsSoonBtn = async () => {
        Alert.alert('Alert', 'Coming soon!', [{ text: 'OK ' }])
        return
    }

    handleSelectCurrency = (currency) => {
        const { dispatch } = this.props
        dispatch(setSelectedCurrency(currency))
        this.currencyModalRef.current?.setModalVisible(false)
    }

    toggleCurrencyModal = (value) => {
        this.currencyModalRef.current?.setModalVisible(value)
    }

    render() {
        const { loading, loadingMsg } = this.state
        const { shared, auth } = this.props
        const { selectedAsset } = shared

        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" />
                <Loader loading={loading} color="#32CCDD" />
                <Header
                    title="Settings"
                    navigation={this.props.navigation}

                />
                <View style={{ backgroundColor: 'transparent', flex: 1, marginHorizontal: 0 }}>
                    <List.Section>

                        <ScrollView>

                            <List.Subheader style={{ marginBottom: 0, backgroundColor: '#f9f9f9' }}>Preferences</List.Subheader>
                            <List.Item
                                onPress={() => this.handleBackupWalletBtn()}
                                title={'Backup Mnemonic'}
                                left={() => <SafeIcon width={25} height={25} style={{ top: 5, left: 10, marginRight: 20 }} />}
                                right={() => !auth?.wallet_backed && <IonIcon name='alert-circle-outline' color='red' size={25} style={{ top: 5, right: 10 }} />}
                                titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                            />
                            <List.Item
                                onPress={() => this.handleChangePasscodeBtn()}
                                title={'Change PIN'}
                                left={() => <LockIcon width={25} height={25} style={{ top: 5, left: 10, marginRight: 20 }} />}
                                // right={() => <IonIcon name='alert-circle-outline' color='red' size={25} style={{ top: 14, right: 10 }} />}
                                titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                            />
                            <List.Item
                                // onPress={() => this.handleContactDetailsBtn()}
                                title={'Fingerprint'}
                                left={() => <FingerprintIcon width={25} height={25} style={{ top: 5, left: 10, marginRight: 20 }} />}
                                right={() => <Switch value={auth?.biometric_auth} onValueChange={this.handleBiometricToggle} color='black' style={{ right: 10 }} />}
                                titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                            />
                            <List.Item
                                onPress={() => this.toggleCurrencyModal(true)}
                                title={'Currency: ' + shared?.currency?.toUpperCase()}
                                left={() => <PaperMoneyIcon width={25} height={25} style={{ top: 5, left: 10, marginRight: 20 }} />}
                                // right={() => <MaterialIcons name='chevron-right' color='grey' size={25} style={{ top: 14 }} />}
                                titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                            />




                            <List.Subheader style={{ marginBottom: 0, backgroundColor: '#f9f9f9' }}>Community</List.Subheader>


                            <List.Item
                                onPress={() => Linking.openURL('https://twitter.com/blitslabs')}
                                title={'Twitter'}
                                left={() => <TwitterIcon width={25} height={25} style={{ top: 5, left: 10, marginRight: 20 }} />}
                                // right={() => <MaterialIcons name='chevron-right' color='grey' size={25} style={{ top: 14 }} />}
                                titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                            />
                            <List.Item
                                onPress={() => Linking.openURL('tg://resolve?domain=blits_community')}
                                title={'Telegram'}
                                left={() => <TelegramIcon width={25} height={25} style={{ top: 5, left: 10, marginRight: 20 }} />}
                                // right={() => <MaterialIcons name='chevron-right' color='grey' size={25} style={{ top: 14 }} />}
                                titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                            />
                            <List.Item
                                onPress={() => Linking.openURL('https://facebook.com/blitslabs')}
                                title={'Facebook'}
                                left={() => <FacebookIcon width={25} height={25} style={{ top: 5, left: 10, marginRight: 20 }} />}
                                // right={() => <MaterialIcons name='chevron-right' color='grey' size={25} style={{ top: 14 }} />}
                                titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                            />

                            <List.Subheader style={{ marginBottom: 0, backgroundColor: '#f9f9f9' }}>About</List.Subheader>
                            <List.Item
                                onPress={() => this.handleRateAppBtn()}
                                title={'Rate App'}
                                left={() => <StarIcon width={25} height={25} style={{ top: 5, left: 10, marginRight: 20 }} />}
                                // right={() => <MaterialIcons name='chevron-right' color='grey' size={25} style={{ top: 14 }} />}
                                titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                            />
                            <List.Item
                                onPress={() => Linking.openURL('https://blits.net/terms')}
                                title={'Terms of service'}
                                left={() => <ProtectIcon width={25} height={25} style={{ top: 5, left: 10, marginRight: 20 }} />}
                                // right={() => <MaterialIcons name='chevron-right' color='grey' size={25} style={{ top: 14 }} />}
                                titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                            />
                            <List.Item
                                onPress={() => Linking.openURL('https://blits.net/privacy')}
                                title={'Privacy policy'}
                                left={() => <ViewIcon width={25} height={25} style={{ top: 5, left: 10, marginRight: 20 }} />}
                                // right={() => <MaterialIcons name='chevron-right' color='grey' size={25} style={{ top: 14 }} />}
                                titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                            />
                            <List.Item
                                onPress={() => { }}
                                title={'Version ' + this.state.version}
                                left={() => <PrismIcon width={25} height={25} style={{ top: 5, left: 10, marginRight: 20 }} />}
                                // right={() => <MaterialIcons name='chevron-right' color='grey' size={25} style={{ top: 14 }} />}
                                titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                            />
                        </ScrollView>
                    </List.Section>
                </View>
                <CurrencyModal
                    modalRef={this.currencyModalRef}
                    onSelect={this.handleSelectCurrency}
                    onClose={() => this.toggleCurrencyModal(false)}
                />



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
        paddingTop: 20,
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
    },
    roundedProfileImage: {
        width: 40, height: 40, borderWidth: 0,
        borderColor: 'black', borderRadius: 50,
        marginLeft: 8, marginTop: 6
    },

})

function mapStateToProps({ wallet, shared, contacts, auth,  }) {
    return {
        wallet: wallet?.wallet,
        publicKeys: wallet && wallet.publicKeys,
        shared,
        contacts,
        auth,
        
    }
}

export default connect(mapStateToProps)(SettingsView)