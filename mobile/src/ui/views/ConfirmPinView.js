import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, StyleSheet, Text, View, Button, StatusBar, Dimensions, SafeAreaView, Keyboard } from 'react-native'
// import { SafeAreaView } from 'react-navigation'

// Components
import PrimaryBtn from '../components/PrimaryBtn'
import SecondaryBtn from '../components/SecondaryBtn'
import BlitsBtn from '../components/BlitsBtn'
import PinCodeInput from '../components/PinCodeInput'
import Loading from '../components/Loading'
import Header from '../components/Header'

// Actions
import { savePublicKeys, saveEncryptedWallet, saveWallet, removeTempMnemonic } from '../../actions/wallet'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import crypto from 'crypto'
import CryptoJS from 'crypto-js'
import * as Animatable from 'react-native-animatable'
import { Wallet as Harmony } from '@harmony-js/account'

import ETH from '../../crypto/ETH'
import FIL from '../../crypto/FIL'

import BackgroundTimer from 'react-native-background-timer'


class ConfirmPinView extends Component {

    state = {
        pin: '',
        error: false,
        loading: true,

    }

    pinInput = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        this.setState({ loading: false })

        // console.log(this.props.navigation)        
    }

    createWallet = async (pin) => {
        const { temp_mnemonic, dispatch } = this.props
        let mnemonic

        if (temp_mnemonic && temp_mnemonic !== '') {
            console.log('USING_IMPORTED_MNEMONIC')
            mnemonic = temp_mnemonic
            dispatch(removeTempMnemonic())
        } else {
            console.log('CREATING_NEW_MNEMONIC')
            mnemonic = new Harmony().newMnemonic()
        }

        const wallet = {                          
            ETH: ETH.createWallet(mnemonic, 0),
            BNB: ETH.createWallet(mnemonic, 1),
            FIL: FIL.createWallet(mnemonic, 0),
        }

        const publicKeys = {                      
            ETH: wallet.ETH.publicKey,            
            BNB: wallet.BNB.publicKey,
            FIL: wallet.FIL.publicKey,
        }

        // const encryptedWallet = CryptoJS.AES.encrypt(JSON.stringify({ ...wallet, mnemonic }), pin.toString()).toString()

        dispatch(savePublicKeys(publicKeys))
        // dispatch(saveEncryptedWallet(encryptedWallet))
        dispatch(saveWallet({ ...wallet, mnemonic }))
    }

    handlePinChange = (pin) => {
        console.log(pin)
        this.setState({ pin })
    }

    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    handlePinDone = async (pinConfirmation) => {
        console.log('CONFIRM_PIN_DONE')
        const { pin, dispatch, navigation } = this.props
        // Dismiss Keyboard
        Keyboard.dismiss()
        await this.sleep(100)
        this.setState({ loading: true, })

        // Generate PIN's Hash
        const hash = crypto.createHash('sha256').update(pinConfirmation.toString()).digest('base64')

        if (hash === pin) {
            // Create Wallet
            BackgroundTimer.setTimeout(async () => {
                await this.createWallet(pinConfirmation)
                this.setState({ loading: false })
                // Go to Main Wallet Page
                this.props.navigation.reset({
                    routes: [{ name: 'Fingerprint' }]
                })

            }, 1000)
            return
        }

        // Error
        this.setState({ loading: false })
        this.pinInput.current.shake(800).then(() => this.setState({ pin: '' }))
    }

    render() {

        const { pin, error, loading } = this.state


        if (loading) {
            return <Loading message={'Creating Wallet'} />
        }

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" />
                <View style={{ marginTop: 20 }}>
                    <Header navigation={this.props.navigation} customLeftComponent={true} />
                </View>
                <View style={styles.container}>
                    <View style={{ marginBottom: 10 }}>
                        <Image style={styles.icon} source={require('../../../assets/images/pin_icon.png')} />
                    </View>
                    <Text style={styles.pageTitle}>Repeat PIN</Text>
                    <Text style={styles.pageSubtitle}>The 6-digit PIN works as 2-factor authentication. Please don't forget it.</Text>

                    <Animatable.View ref={this.pinInput} style={{ marginTop: 15 }}>
                        <PinCodeInput pin={pin} onTextChange={this.handlePinChange} onFulfill={this.handlePinDone} error={error} autofocus={true} />
                    </Animatable.View>

                </View>
            </SafeAreaView >
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',

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
    }


})

function mapStateToProps({ auth, wallet, }) {
    return {
        pin: auth && auth.pin,
        temp_mnemonic: wallet && 'temp_mnemonic' in wallet ? wallet.temp_mnemonic : '',
    }
}

export default connect(mapStateToProps)(ConfirmPinView)