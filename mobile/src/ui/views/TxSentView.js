import React, { Component } from 'react';
import { View, Dimensions, TextInput, Text, Image, Pressable, SafeAreaView, StyleSheet } from 'react-native';

// Components
import BlitsBtn from '../components/BlitsBtn'
import PrimaryBtn from '../components/PrimaryBtn'
import SecondaryBtn from '../components/SecondaryBtn'

class TxSentView extends Component {

    handleFingerprintBtn = () => {
        console.log('GO_TO_WALLET_BTN')
        this.props.navigation.navigate('Wallet')
    }

    handleSkipBtn = () => {       
        console.log('VIEW_TX_BTN')
        this.props.navigation.navigate('Wallet')
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{flex: 1, paddingHorizontal: 40, }}>
                    <Text style={[styles.text], { fontWeight: 'bold', fontSize: 24, paddingTop: 50, textAlign: 'center', zIndex: 200  }}>Transaction Sent!</Text>

                </View>
                <View style={{backgroundColor: 'transparent',flex: 4}}>
                    <Image style={styles.img} resizeMode="contain" source={require('../../../assets/images/success.png')} />
                </View>
                {/* <Text style={[styles.text], { marginTop: 5 }}>one1yxxxxxu7vtgfff65mcqvhsjxpadrygwc25k37zx</Text> */}
                <View style={{flex: 1, backgroundColor: 'transparent', width: '100%', justifyContent: 'center'}}>
                    <BlitsBtn title="Return to Wallet" onPress={this.handleFingerprintBtn} />
                    <SecondaryBtn title="View TX Details" onPress={this.handleSkipBtn} />
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

export default TxSentView