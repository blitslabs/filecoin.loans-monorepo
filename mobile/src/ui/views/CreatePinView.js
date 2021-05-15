import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, StyleSheet, Text, View, Button, StatusBar, Dimensions, SafeAreaView, Platform } from 'react-native'
// import { SafeAreaView } from 'react-navigation'

// Components
import PrimaryBtn from '../components/PrimaryBtn'
import SecondaryBtn from '../components/SecondaryBtn'
import BlitsBtn from '../components/BlitsBtn'
import PinCodeInput from '../components/PinCodeInput'
import Header from '../components/Header'

// Libraries
import crypto from 'crypto'
import SplashScreen from 'react-native-splash-screen'

// Actions
import { savePinHash } from '../../actions/auth'

class CreatePinView extends Component {

    state = {
        pin: '',
        loading: true,
    }

    componentDidMount() {
        SplashScreen.hide()

    }

    handlePinChange = (pin) => {
        console.log(pin)
        this.setState({ pin })
    }

    handlePinDone = async (pin) => {
        console.log('PIN_DONE')
        const { navigation, dispatch } = this.props
        const hash = crypto.createHash('sha256').update(pin.toString()).digest('base64')
        console.log(hash)
        dispatch(savePinHash(hash))
        navigation.navigate('ConfirmPIN')
    }

    handleBackBtn = () => {
        const { navigation } = this.props
        navigation.pop()
    }

    handleResponse = (event) => {
        console.log(event)
    }

    render() {

        const { pin } = this.state

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" />
                <View style={{ marginTop: 20 }}>
                    <Header
                        // title='Create PIN'
                        customLeftComponent={true}
                        onLeftComponentPress={() => this.handleBackBtn()}
                    />
                </View>
                <View style={styles.container}>
                    <View style={{ marginBottom: 10 }}>
                        <Image style={styles.icon} source={require('../../../assets/images/pin_icon.png')} />
                    </View>
                    <Text style={styles.pageTitle}>Create PIN</Text>
                    <Text style={styles.pageSubtitle}>The 6-digit PIN works as 2-factor authentication. Please don't forget it.</Text>

                    <View style={{ marginTop: 15 }}>
                        <PinCodeInput pin={pin} onTextChange={this.handlePinChange} onFulfill={this.handlePinDone} autofocus={true} />
                    </View>
                </View>
            </SafeAreaView >
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

function mapStateToProps({ auth }) {
    return {
        auth
    }
}

export default connect(mapStateToProps)(CreatePinView)