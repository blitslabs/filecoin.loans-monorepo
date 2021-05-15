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

class BackupWalletIntroView extends Component {

    state = {
        words: []
    }

    componentDidMount() {
       
    }

    handleBackupNowBtn = async () => {
       const { navigation } = this.props
       navigation.push('PrepareBackupWallet')
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
                        <Image style={styles.image} source={require('../../../assets/images/security-configuration.png')} />
                    </Animatable.View>
                </View>
                <View style={{ flex: 1, marginHorizontal: 20, marginTop: 20 }}>
                    <Text style={styles.title}>Back up your wallet</Text>
                    <Text style={[styles.text, { marginTop: 10, textAlign: 'justify', fontSize: 14 }]}>
                        With Blits Wallet you have true ownership of your assets. No one but you has access to your private keys. Not even Blits Labs.
                    </Text>
                    <Text style={[styles.text, { marginTop: 10, textAlign: 'justify', fontSize: 14 }]}>
                        Without a backup, if you lose your device or delete the app, you will lose your funds forever.
                    </Text>
                </View>
                <View style={{ marginHorizontal: 20, paddingBottom: 20 }}>
                    <PrimaryBtn onPress={() => this.handleBackupNowBtn()} title="Back up Now" />
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        // paddingHorizontal: 20,
        // paddingVertical: 20,
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
        height: 200,
        width: 200,
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

export default connect(mapStateToProps)(BackupWalletIntroView)