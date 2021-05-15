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

class DoneView extends Component {

    componentDidMount() {
        SplashScreen.hide()
    }

    handleReturnBtn = () => {
        console.log('RETURN_BTN')
        const { navigation } = this.props
        navigation.replace('Wallet')
    }

    render() {
        const { route } = this.props
        const { title, message } = route.params

        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" />
                <View style={{ flex: 1, paddingHorizontal: 40, }}>
                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 24, paddingTop: 50, textAlign: 'center', zIndex: 200 }}>{title ? title : 'Transaction Sent'}</Text>
                </View>
                <View style={{ backgroundColor: 'transparent', flex: 4 }}>
                    <Animatable.View duration={5500} animation="rubberBand" iterationCount="infinite" style={{ zIndex: 20 }}>
                        <Image style={[{ ...styles.img }, { position: 'absolute', zIndex: 20, top: -140 }]} resizeMode="contain" source={require('../../../assets/images/astronaut.png')} />
                    </Animatable.View>
                    <Animatable.View duration={3500} animation="pulse" easing="ease-out" iterationCount="infinite">
                        <Image style={styles.img} resizeMode="contain" source={require('../../../assets/images/black_hole.png')} />
                    </Animatable.View>
                </View>
                <View style={{ flex: 1, backgroundColor: 'transparent', width: '100%', justifyContent: 'center' }}>
                    <PrimaryBtn title="Return to Wallet" onPress={this.handleReturnBtn} />
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

export default connect(mapStateToProps)(DoneView)
