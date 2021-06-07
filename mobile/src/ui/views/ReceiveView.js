import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Dimensions, TextInput, Text, Image, Pressable, SafeAreaView, StyleSheet, Clipboard, Share, TouchableOpacity } from 'react-native'

// Components
import PrivateKeyModal from '../components/PrivateKeyModal'

// Libraries
import QRCode from 'react-native-qrcode-svg'
import { ASSETS } from '../../crypto/index'
import Toast from 'react-native-simple-toast'
import FeatherIcon from 'react-native-vector-icons/Feather'

class ReceiveView extends Component {

    state = {
        showPrivateKeyModal: false
    }

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

    async handleViewPrivateKeyBtn() {
        const { navigation } = this.props
        const txConfirmationText = <View>
            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 16 }}>To reveal your private key</Text>
        </View>

        navigation.push('ConfirmTx', {
            txConfirmationText,
            handleSendTx: this.handleSuccess,
            title: 'Confirm 6-digit PIN ',
            loadingMsg: 'Loading...'
        })
    }

    handleSuccess = async () => {
        const { navigation } = this.props
        navigation.pop()
        this.setState({
            showPrivateKeyModal: true
        })
    }

    toggleModal = (value) => this.setState({ showPrivateKeyModal: value })

    render() {

        const { publicKeys, shared, wallet } = this.props
        const { selectedAsset } = shared
        const address = publicKeys[selectedAsset]

        return (
            <SafeAreaView style={styles.container}>
                <Text style={[styles.text], { fontWeight: 'bold', fontSize: 16, marginTop: 20 }}>Your Address for {ASSETS[selectedAsset].name} ({ASSETS[selectedAsset].symbol})</Text>
                <Text style={[styles.text], { marginTop: 5 }}>{address}</Text>
                <View style={styles.qrContainer}>
                    <QRCode
                        size={150}
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
                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 20, }}>
                    <TouchableOpacity style={styles.exportBtn} onPress={() => this.handleViewPrivateKeyBtn()}>
                        <View style={{ paddingBottom: 2.5 }}>
                            <FeatherIcon name="shield" size={18} />
                        </View>
                        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 14, marginLeft: 8 }}>View Private Key</Text>
                    </TouchableOpacity>
                </View>
                <PrivateKeyModal
                    privateKey={wallet?.[shared?.selectedAsset]?.privateKey}
                    isVisible={this.state.showPrivateKeyModal}
                    onClose={() => this.toggleModal(false)}
                />
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
        backgroundColor: 'white',
        padding: 15,
        elevation: 2,
        borderRadius: 25,
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
    },
    exportBtn: {
        borderColor: 'black',
        borderWidth: 1,
        paddingTop: 12,
        paddingBottom: 8,
        paddingHorizontal: 20,
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

function mapStateToProps({ wallet, shared }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        wallet: wallet && wallet.wallet,
    }
}

export default connect(mapStateToProps)(ReceiveView)