import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Dimensions, TextInput, Text, Image, Pressable, SafeAreaView, StyleSheet, Clipboard, Share, ToastAndroid, TouchableOpacity } from 'react-native'


// Libraries
import QRCode from 'react-native-qrcode-svg'
import { ASSETS } from '../../crypto/index'

// Components
import TxsList from '../components/TxsList'
import MyStatusBar from '../components/MyStatusBar'

class HistoryView extends Component {

    async handleCopyBtn(address) {
        try {
            Clipboard.setString(address)
            ToastAndroid.show('Address copied!', ToastAndroid.SHORT)
        } catch (e) {
            console.log(e)
        }
    }

    async handleShareBtn(address) {
        try {
            const result = await Share.share({ message: address })
            console.log(result)
            // TO DO
            // Handle share result
        } catch (e) {
            console.log(e)
        }
    }

    render() {

        const { publicKeys, shared, balances, navigation } = this.props
        const { selectedAsset } = shared
        const address = publicKeys[selectedAsset]
        const assetBalance = balances[publicKeys[selectedAsset]] !== undefined ? balances[publicKeys[selectedAsset]].total_balance : 0

        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" /> 
                <View style={styles.accountDetailsContainer}>
                    <Text style={styles.assetName}>{ASSETS[selectedAsset].name} account</Text>
                    <Text style={styles.address}>{address}</Text>
                    <Text style={styles.balance}>{assetBalance} {selectedAsset}</Text>
                </View>

                <View style={{ width: '100%', flex: 1 }}>
                    <TxsList navigation={navigation} />
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        // paddingVertical: 20,
        backgroundColor: 'white',
        flex: 1,
        alignItems: 'center'
    },
    text: {
        fontFamily: 'Poppins-Regular'
    },
    accountDetailsContainer: {
        width: '100%',
        borderBottomColor: '#f4f4f4',
        borderBottomWidth: 1,
        paddingBottom: 10,
        marginBottom: 10,
        // paddingHorizontal: 20,
        paddingTop: 10
    },
    assetName: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16
    },
    address: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular'
    },
    balance: {
        fontFamily: 'Poppins-Regular'
    }
})

function mapStateToProps({ wallet, shared, balances }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        balances
    }
}

export default connect(mapStateToProps)(HistoryView)