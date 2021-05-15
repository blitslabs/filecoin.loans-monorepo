import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, StyleSheet, Text, View, Button, StatusBar, Dimensions, SafeAreaView, Platform, TouchableOpacity, Alert } from 'react-native'
// import { SafeAreaView } from 'react-navigation'

// Components
import PrimaryBtn from '../components/PrimaryBtn'
import SecondaryBtn from '../components/SecondaryBtn'
import BlitsBtn from '../components/BlitsBtn'
import PinCodeInput from '../components/PinCodeInput'
import Loading from '../components/Loading'
import Header from '../components/Header'

// Libraries
import crypto from 'crypto'
import SplashScreen from 'react-native-splash-screen'
import * as Animatable from 'react-native-animatable'
import FingerprintScanner from 'react-native-fingerprint-scanner'

// Actions
import { toggleWalletLock } from '../../actions/auth'

class ConfirmTxView extends Component {

    state = {
        pin: '',
        loading: true,
    }

    pinInput = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        const { route } = this.props
        const { tx } = route.params
        this.setState({ tx, loading: false, })
    }

    componentWillUnmount() {
        FingerprintScanner.release()
    }

    handlePinChange = (pin) => {
        console.log(pin)
        this.setState({ pin })
    }

    handlePinDone = async (pinDone) => {
        console.log('PIN_DONE')
        const { navigation, dispatch, pin, route } = this.props
        const { handleSendTx } = route.params

        const hash = crypto.createHash('sha256').update(pinDone.toString()).digest('base64')

        if (pin === hash) {
            this.setState({ loading: true })
            console.log('WALLET_UNLOCKED')
            handleSendTx()
            return
        }

        // Error
        this.setState({ loading: false })
        this.pinInput.current.shake(800).then(() => this.setState({ pin: '' }))
    }


    handleResponse = (event) => {
        console.log(event)
    }

    handleBiometricBtn = () => {
        console.log('BIOMETRIC_BTN')
        this.biometricAuth()
    }

    biometricAuth = async () => {
        const { dispatch, route } = this.props
        const { handleSendTx } = route.params

        try {
            const isSendorAvailable = await FingerprintScanner.isSensorAvailable()

            if (!isSendorAvailable) {
                Alert.alert('Error', 'Biometric authentication not supported', [{ text: "OK", onPress: () => console.log('OK pressed') }])
                return
            }

            if (Platform.OS === 'android') {
                this.setState({ loading: true })
                await FingerprintScanner.authenticate({ title: 'Wallet Access' })
                console.log('WALLET_UNLOCKED')
                handleSendTx()
                return
            } else if (Platform.OS === 'ios') {
                this.setState({ loading: true })
                await FingerprintScanner.authenticate({ description: ' Wallet Access' })
                console.log('WALLET_UNLOCKED')
                handleSendTx()
                return
            }

        } catch (e) {
            console.log(e)
            return
        }
    }

    render() {
        const { biometric_auth, route, navigation } = this.props
        const { loading, pin } = this.state
        const { title, txConfirmationText, loadingMsg, handleSendTx } = route.params

        if (loading) {
            return <Loading message={loadingMsg ? loadingMsg : 'Sending Transaction'} />
        }

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" />
                <Header
                    navigation={navigation}
                    customLeftComponent={true}
                    onLeftComponentPress={() => navigation.pop()}
                />
                <View style={styles.container}>
                    <View style={{ marginBottom: 10 }}>
                        <Image style={styles.icon} source={require('../../../assets/images/pin_icon.png')} />
                    </View>
                    <Text style={styles.pageTitle}>{title ? title : 'Confirm Payment'}</Text>
                    {txConfirmationText}

                    <View style={{ marginTop: 15 }}>
                        <Animatable.View ref={this.pinInput} style={{ marginTop: 15 }}>
                            <PinCodeInput pin={pin} onTextChange={this.handlePinChange} onFulfill={this.handlePinDone} />
                        </Animatable.View>

                    </View>
                    {
                        biometric_auth === true && (
                            <TouchableOpacity onPress={() => this.handleBiometricBtn()}>
                                <View style={{ backgroundColor: 'transparent', width: 200, height: 100, marginTop: 50, alignItems: 'center', justifyContent: 'center', }}>
                                    <Animatable.View duration={2000} animation="pulse" easing="ease-out" iterationCount="infinite" >

                                        <Image style={{ width: 104.85, height: 86.7, }} source={require('../../../assets/images/fingerprint_icon.png')} />
                                        {/* <Text style={{ color: 'black', backgroundColor: 'red', marginTop: -50 }}>Touch ID</Text> */}

                                    </Animatable.View>
                                </View>
                            </TouchableOpacity>
                        )
                    }

                </View>
            </SafeAreaView >
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
        // marginTop: 20
        paddingTop: 20,
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 20,
    },
    pageTitle: {
        fontSize: 22,
        fontFamily: 'Poppins-SemiBold'
    },
    pageSubtitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40
    },
    icon: {
        width: 213 * 0.4,
        height: 235 * 0.4,
        resizeMode: 'stretch',
        marginTop: 0
    },
    img: {
        width: Dimensions.get('window').width,
        // flex: 1,
    },


})

function mapStateToProps({ auth }) {
    return {
        pin: auth && auth.pin,
        biometric_auth: auth && auth.biometric_auth === true ? true : false
    }
}

export default connect(mapStateToProps)(ConfirmTxView)