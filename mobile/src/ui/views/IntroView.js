import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, StyleSheet, Text, View, Button, StatusBar, SafeAreaView, AppState } from 'react-native'



// Components
import PrimaryBtn from '../components/PrimaryBtn'
import SecondaryBtn from '../components/SecondaryBtn'
import BlitsBtn from '../components/BlitsBtn'
import MyStatusBar from '../components/MyStatusBar'

// Librarires
import SplashScreen from 'react-native-splash-screen'
import BackgroundTimer from 'react-native-background-timer'
import * as RootNavigation from '../../navigation/RootNavigation'


class IntroView extends Component {

    componentDidMount() {
        SplashScreen.hide()
    }

    

    handleCreateBtn = () => {
        console.log('CREATE_WALLET_BTN')
        const { navigation } = this.props
        navigation.navigate('CreatePIN')
    }

    handleRecoverBtn = () => {
        console.log('RECOVER_WALLET_BTN')
        const { navigation } = this.props
        navigation.navigate('RecoverWallet')
    }

    render() {
        return (
            <SafeAreaView style={styles.safeArea}>
                <MyStatusBar backgroundColor="black" />
                <View style={styles.container}>

                    <View style={{ marginTop: 5, alignItems: 'center' }}>
                        <Image style={styles.logo} source={require('../../../assets/images/blits_logo.png')} />
                    </View>
                    <View>
                        <Image style={styles.rocket} source={require('../../../assets/images/blits_rocket.png')} />
                    </View>
                    <View>
                        <BlitsBtn onPress={this.handleCreateBtn} title="Create Wallet" />
                        <PrimaryBtn onPress={this.handleRecoverBtn} title="Recover Wallet" />

                        <Text style={styles.termsText}>
                            Blits is a Non custodial wallet. This means all transactions are processed on this device and broadcast to the respective blockchain and your private keys never leave your device.
                            You are responsible for managing your private keys and backup phrases which can be used in other crypto wallets. If you lose your private keys, Blits can do nothing to help you recover them, so please backup your seed phrases and/or  private keys.
                        </Text>
                    </View>

                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,

    },
    logo: {
        width: 11263 * 0.015,
        height: 3225 * 0.015,
        resizeMode: 'contain',
    },
    rocket: {
        height: 756 * 0.25,
        width: 668 * 0.25
    },

    termsText: {
        color: '#919191',
        textAlign: 'justify',
        fontFamily: 'Poppins-Light',
        fontSize: 10,
        marginTop: 10,
    },

})

function mapStateToProps({ auth }) {
    return {
        auth
    }
}

export default connect(mapStateToProps)(IntroView)