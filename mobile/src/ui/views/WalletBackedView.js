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

class WalletBackedView extends Component {

    state = {
        words: []
    }

    componentDidMount() {

    }

    handleDoneBtn = async () => {
        const { navigation } = this.props
        navigation.reset({
            routes: [{ name: 'Wallet' }]
        })
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" />
                {/* <Header                    
                    navigation={this.props.navigation}
                    centerComponentStyle={{ fontSize: 18 }}
                    customLeftComponent={false}
                /> */}
                <View style={styles.imageContainer}>
                    <Animatable.View duration={1000} animation="zoomIn" style={{ zIndex: 20 }}>
                        <Image style={styles.image} source={require('../../../assets/images/realtime-protection.png')} />
                    </Animatable.View>
                </View>
                <View style={{ flex: 1, marginHorizontal: 20, marginTop: 20 }}>
                    <Text style={styles.title}>Wallet backed up!</Text>
                    <Text style={[styles.text, { marginTop: 10, textAlign: 'justify', fontSize: 14 }]}>
                        You can now recover your wallet if your phone gets stolen or lost. Remember, don't show your recovery phrase to anyone.
                    </Text>
                </View>
                <View style={{ marginHorizontal: 20, paddingBottom: 20 }}>
                    <PrimaryBtn onPress={() => this.handleDoneBtn()} title="Done" />
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        // paddingHorizontal: 20,
        // paddingVertical: 20,
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
        marginTop: 40
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

export default connect(mapStateToProps)(WalletBackedView)