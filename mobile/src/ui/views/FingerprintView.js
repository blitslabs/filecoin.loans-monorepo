import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Dimensions, TextInput, Text, Image, Pressable, SafeAreaView, StyleSheet, Alert, Platform } from 'react-native'

// Components
import PrimaryBtn from '../components/PrimaryBtn'
import SecondaryBtn from '../components/SecondaryBtn'
import MyStatusBar from '../components/MyStatusBar'

// Libraries
import * as Animatable from 'react-native-animatable'
import SplashScreen from 'react-native-splash-screen'
import FingerprintScanner from 'react-native-fingerprint-scanner'

// Actions
import { toggleBiometricAuth } from '../../actions/auth'

class FingerprintView extends Component {

    componentDidMount() {
        SplashScreen.hide()
    }

    componentWillUnmount() {
        FingerprintScanner.release();
    }

    handleFingerprintBtn = () => {
        console.log('FINGERPRINT_BTN')
        const { dispatch } = this.props
        this.biometricAuth()
        // this.props.navigation.navigate('Congratulations')
    }

    handleSkipBtn = () => {
        console.log('SKIP_BTN')
        this.props.navigation.navigate('Congratulations')
    }

    biometricAuth = async () => {
        const { dispatch } = this.props

        try {
            const isSendorAvailable = await FingerprintScanner.isSensorAvailable()

            if (!isSendorAvailable) {
                Alert.alert('Error', 'Biometric authentication not supported', [{ text: "OK", onPress: () => console.log('OK pressed') }])
                return
            }

            if (Platform.OS === 'android') {
                console.log('ANDROID_BIOMETRICS')
                await FingerprintScanner.authenticate({ title: 'Wallet Access' })
                console.log('authenticated!')
                dispatch(toggleBiometricAuth(true))
                this.props.navigation.reset({
                    routes: [{ name: 'Congratulations' }]
                })
            } else if (Platform.OS === 'ios') {
                await FingerprintScanner.authenticate({ description: ' Wallet Access' })
                dispatch(toggleBiometricAuth(true))
                this.props.navigation.reset({
                    routes: [{ name: 'Congratulations' }]
                })
            }

        } catch (e) {
            console.log(e)
            FingerprintScanner.release()
            Alert.alert('Error', e.message, [{ text: 'OK', onPress: () => console.log('OK pressed') }])
            return
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" />
                <View style={{ flex: 1, paddingHorizontal: 40, }}>
                    <Text style={[styles.text], { fontWeight: 'bold', fontSize: 24, paddingTop: 50, textAlign: 'center', zIndex: 200 }}>Use your fingerprint for quick unlock</Text>

                </View>
                <View style={{ backgroundColor: 'transparent', flex: 4 }}>
                    <Animatable.View duration={3500} animation="fadeInLeft" iterationCount="infinite" style={{ zIndex: 20 }}>
                        <Image style={[{ ...styles.img }, { position: 'absolute', zIndex: 20, top: -280 }]} resizeMode="contain" source={require('../../../assets/images/fingerprint_hand.png')} />
                    </Animatable.View>
                    <Animatable.View duration={3500} animation="zoomIn" easing="ease-out" iterationCount="infinite">
                        {/* <Image style={styles.img} resizeMode="contain" source={require('../../../assets/images/fingerprint.png')} /> */}
                        <Image style={styles.img} resizeMode="contain" source={require('../../../assets/images/fingerprint_bg.png')} />

                    </Animatable.View>
                </View>
                {/* <Text style={[styles.text], { marginTop: 5 }}>one1yxxxxxu7vtgfff65mcqvhsjxpadrygwc25k37zx</Text> */}
                <View style={{ flex: 1, backgroundColor: 'transparent', width: '100%', justifyContent: 'center' }}>
                    <PrimaryBtn title="Use Fingerprint" onPress={this.handleFingerprintBtn} />
                    <SecondaryBtn title="Skip" onPress={this.handleSkipBtn} />
                </View>

            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'white',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    text: {
        fontFamily: 'Poppins-Regular'
    },
    imgContainer: {
        // alignItems: 'flex-start',
        // marginTop: 30,
        // width: Dimensions.get('window').width,
        backgroundColor: 'red',

    },
    img: {
        width: Dimensions.get('window').width + 40,
        // position: 'absolute',
        flex: 1,

    },
    btnsContainer: {
        backgroundColor: 'transparent',
        width: 200,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20
    },
    textBtn: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14
    }
})

function mapStateToProps({ }) {
    return {

    }
}

export default connect(mapStateToProps)(FingerprintView)
