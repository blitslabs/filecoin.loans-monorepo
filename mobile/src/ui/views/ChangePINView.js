import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Image, StyleSheet, Text, View, Button,
    StatusBar, Dimensions, SafeAreaView, Platform,
    Keyboard, BackHandler
} from 'react-native'
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
import * as Animatable from 'react-native-animatable'

// Actions
import { savePinHash } from '../../actions/auth'

class ChangePinView extends Component {

    state = {
        pin: '',
        newPIN: '',
        confirmNewPIN: '',
        error: false,
        loading: true,
    }

    pinInput = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick)
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    handlePinChange = (pin) => {
        this.setState({ pin })
    }

    handlePinDone = async (pin) => {
        console.log('PIN_DONE')
        const { newPIN, confirmNewPIN } = this.state
        const { navigation, dispatch } = this.props

        if (!newPIN) {
            this.setState({ newPIN: pin, pin: '' })
            return
        }

        // Dismiss Keyboard
        // Keyboard.dismiss()

        if (newPIN != pin) {
            this.pinInput.current.shake(800).then(() => this.setState({ pin: '' }))
            return
        }

        const hash = crypto.createHash('sha256').update(pin.toString()).digest('base64')
        dispatch(savePinHash(hash))
        navigation.pop(2)
    }

    handleBackBtn = () => {
        const { navigation } = this.props
        navigation.pop(2)
    }

    handleBackButtonClick = () => {
        const { navigation } = this.props
        navigation.pop(2)
        return true
    }

    render() {

        const { pin, newPIN, error } = this.state

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
                    <Text style={styles.pageTitle}>{!newPIN ? 'New PIN' : 'Confirm New PIN'}</Text>
                    <Text style={styles.pageSubtitle}>The 6-digit PIN works as 2-factor authentication. Please don't forget it.</Text>

                    <Animatable.View ref={this.pinInput} style={{ marginTop: 15 }}>
                        <PinCodeInput pin={pin} onTextChange={this.handlePinChange} onFulfill={this.handlePinDone} autofocus={true} error={error} />
                    </Animatable.View>
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

export default connect(mapStateToProps)(ChangePinView)