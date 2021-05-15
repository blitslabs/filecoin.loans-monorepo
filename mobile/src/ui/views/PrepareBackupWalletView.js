import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View, Dimensions, TextInput, Text, Image, Pressable,
    SafeAreaView, StyleSheet, StatusBar, FlatList
} from 'react-native';

// Components
import Header from '../components/Header'
import MyStatusBar from '../components/MyStatusBar'

// Libraries
import * as Animatable from 'react-native-animatable'
import BlitsBtn from '../components/BlitsBtn'
import PrimaryBtn from '../components/PrimaryBtn'

class PrepareBackupWalletView extends Component {

    state = {
        
    }

    componentDidMount() {
       
    }

    handleStartBtn = async () => {
        const { navigation } = this.props
        const txConfirmationText = <View>
            <Text>Start wallet back up procedure</Text>
        </View>
        navigation.push('ConfirmTx', { 
            txConfirmationText, 
            handleSendTx: this.handleSuccess, 
            title: 'Enter PIN to back up',
            loadingMsg: 'Loading...'
        })
    }

    handleSuccess = async () => {
        const { navigation } = this.props
        navigation.push('BackupWallet')
    }

    render() {

        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" />
                <Header                    
                    navigation={this.props.navigation}
                    centerComponentStyle={{ fontSize: 18 }}
                    customLeftComponent={true}
                />
                <View style={styles.imageContainer}>
                    <Animatable.View duration={1000} animation="zoomIn" style={{ zIndex: 20 }}>
                        <Image style={styles.image} source={require('../../../assets/images/sign-up.png')} />
                    </Animatable.View>
                </View>
                <View style={{ flex: 1, marginHorizontal: 20, marginTop: 20 }}>
                    <Text style={styles.title}>Write down your recovery phrase</Text>
                    <Text style={[styles.text, { marginTop: 10, textAlign: 'justify', fontSize: 14 }]}>
                        You will be able to restore your wallet using your recovery phrase if your phone gets lost or stolen.
                    </Text>
                    <Text style={[styles.text, { marginTop: 10, textAlign: 'justify', fontSize: 14 }]}>
                        Get a pen and paper to write down your recovery phrase.
                    </Text>
                </View>
                <View style={{ marginHorizontal: 20, paddingBottom: 20 }}>
                    <PrimaryBtn title="Start" onPress={() => this.handleStartBtn()} />
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        // paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: 'white',
        flex: 1,
    },
    text: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12
    },
    wordContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    wordTextIndex: {
        fontSize: 8,
        position: 'absolute',
        top: 2,
        right: 5,
        color: 'white',

        // backgroundColor: 'red'
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
    },
    imageContainer: {
        alignItems: 'center',
        paddingTop: 20
    },
    image: {
        height: 180,
        width: 180,
        // borderRadius: 100
    },
    title: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 30,
        textAlign: 'left'
    },
})

function mapStateToProps({ wallet }) {
    return {
        wallet: wallet && wallet.wallet,
    }
}

export default connect(mapStateToProps)(PrepareBackupWalletView)