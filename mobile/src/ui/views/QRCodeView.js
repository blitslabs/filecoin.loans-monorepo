import React, { Component } from 'react';
import { connect } from 'react-redux'
import { View, Dimensions, TextInput, Text, Image, Pressable, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
// import Header from '../../components/header';

// Components
import TextInputWithBtn from '../components/TextInputWithBtn'
import PrimaryBtn from '../components/PrimaryBtn'
import MyStatusBar from '../components/MyStatusBar'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import Slider from '@react-native-community/slider'
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import Blits from '../../crypto/index'

// Icons
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'


// Actions


class QRCodeView extends Component {

    render() {

        const { route } = this.props
        const { onQRRead } = route.params

        return (
            <View style={styles.container}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" />
                <QRCodeScanner
                    cameraStyle={{ height: Dimensions.get('window').height, position: 'absolute', top: 0, bottom: 0 }}
                    containerStyle={{ height: Dimensions.get('window').height, position: 'absolute', }}
                    fadeIn={false}
                    showMarker={true}
                    markerStyle={{ borderColor: '#3ACCDC', borderRadius: 25, borderWidth: 3 }}
                    onRead={onQRRead}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                />
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        // paddingHorizontal: 20,
        // paddingBottom: 20,
        // paddingTop: 10,
        // backgroundColor: 'red',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },


})

function mapStateToProps({ }) {
    return {

    }
}

export default connect(mapStateToProps)(QRCodeView)

