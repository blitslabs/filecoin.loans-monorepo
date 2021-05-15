import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Dimensions, TextInput, Text, Image, Pressable, SafeAreaView, StyleSheet, Clipboard, Share, TouchableOpacity } from 'react-native'


// Libraries
import QRCode from 'react-native-qrcode-svg'
import { ASSETS } from '../../crypto/index'
import Toast from 'react-native-simple-toast'


class ReceiveView extends Component {

    async handleCopyBtn(address) {
        try {
            Clipboard.setString(address)            
            Toast.show('Address copied!', Toast.LONG, Toast.BOTTOM);
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

        const { publicKeys, shared } = this.props
        const { selectedAsset } = shared
        const address = publicKeys[selectedAsset]

        return (
            <SafeAreaView style={styles.container}>
                <Text style={[styles.text], { fontWeight: 'bold', fontSize: 16, marginTop: 20 }}>Your Address for {ASSETS[selectedAsset].name} ({ASSETS[selectedAsset].symbol})</Text>
                <Text style={[styles.text], { marginTop: 5 }}>{address}</Text>
                <View style={styles.qrContainer}>
                    <QRCode
                        size={200}
                        value={address}
                        logoSize={50}
                        logo={require('../../../assets/images/blits_sym.png')}
                        logoBackgroundColor='white'
                        logoBorderRadius={25}
                        logoMargin={5}
                    />
                </View>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity onPress={() => this.handleCopyBtn(address)}>
                        <View>
                            <Text style={styles.textBtn}>COPY</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.handleShareBtn(address)}>
                        <Text style={styles.textBtn}>SHARE</Text>
                    </TouchableOpacity>
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
        alignItems: 'center'
    },
    text: {
        fontFamily: 'Poppins-Regular'
    },
    qrContainer: {
        alignItems: 'center',
        marginTop: 30
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

function mapStateToProps({ wallet, shared }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared
    }
}

export default connect(mapStateToProps)(ReceiveView)