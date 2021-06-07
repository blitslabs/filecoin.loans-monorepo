import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Image, SafeAreaView, StyleSheet, TouchableOpacity, Alert,
    Dimensions, Clipboard, Share
} from 'react-native'

// Components
import BlitsBtn from './BlitsBtn'

// Libraries
import QRCode from 'react-native-qrcode-svg'
import Modal from 'react-native-modal'
import Toast from 'react-native-simple-toast'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'

class PrivateKeyModal extends Component {

    handleCopyBtn = async () => {
        const { privateKey } = this.props

        try {
            Clipboard.setString(privateKey)
            Toast.show('Copied', Toast.LONG, Toast.BOTTOM);
        } catch (e) {
            console.log(e)
        }
    }

    handleShareBtn = async () => {
        const { contactId, contacts, shared } = this.props
        const address = contacts[contactId]?.address
        try {
            const result = await Share.share({ message: address })
            console.log(result)
        } catch (e) {
            console.log(e)
        }
    }

    render() {

        const {
            privateKey, shared,
            isVisible, onClose
        } = this.props

        return (
            <Modal
                isVisible={isVisible}
                onSwipeComplete={onClose}
                onBackButtonPress={onClose}
                swipeDirection={'down'}
                propagateSwipe
                style={styles.bottomModal}
                animationIn='slideInUp'
                animationOut='slideOutDown'
            >
                <SafeAreaView style={styles.wrapper}>
                    <View style={styles.closeBtnContainer}>
                        <TouchableOpacity
                            hitSlop={{
                                bottom: 20,
                                left: 20,
                                right: 20,
                                top: 20
                            }}
                            onPress={() => onClose()}
                        >
                            <Ionicons name='close' color={'grey'} size={25} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.draggerWrapper}>
                        <Text style={styles.modalTitle}>Private Key</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={[styles.nameLabel, { color: 'red', textAlign: 'center' }]}>Warning! Don't reveal this key to anyone. Otherwise they could steal your funds.</Text>
                    </View>
                    <View style={styles.qrContainer}>
                        <View style={styles.qrSquare}>
                            <QRCode
                                size={120}
                                value={privateKey}
                                logoSize={50}
                                logo={require('../../../assets/images/blits_sym.png')}
                                logoBackgroundColor='white'
                                logoBorderRadius={25}
                                logoMargin={5}
                            />
                        </View>

                        <Text style={[styles.blockchainLabel, { marginTop: 20 }]}>Blockchain: {shared?.selectedAsset}</Text>
                        <Text style={styles.addressLabel}>{privateKey}</Text>

                        <View style={styles.btnContainer}>
                            <BlitsBtn
                                title="Copy"

                                onPress={() => this.handleCopyBtn()}
                            // style={{ width: '100%' }}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0
    },
    closeBtnContainer: {
        position: 'absolute',
        right: 10,
        top: 10
    },
    wrapper: {
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    draggerWrapper: {
        width: '100%',
        marginTop: 40,
        // height: 33,
        alignItems: 'center',
        justifyContent: 'center',
        // borderBottomWidth: StyleSheet.hairlineWidth,
        // borderColor: 'grey'
    },
    dragger: {
        width: 48,
        height: 5,
        borderRadius: 4,
        backgroundColor: 'grey',
        opacity: 0.5
    },
    modalTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18
    },
    qrContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20
    },
    qrSquare: {
        backgroundColor: 'white',
        padding: 10,
        elevation: 2,
        borderRadius: 25
    },
    nameLabel: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        marginTop: 20
    },
    blockchainLabel: {
        fontFamily: 'Poppins-Light',
        fontSize: 12
    },
    addressLabel: {
        fontFamily: 'Poppins-Light',
        fontSize: 12,
        paddingHorizontal: 80,
        textAlign: 'center'
    },
    btnContainer: {
        width: Dimensions.get('window').width * 0.333,
        marginTop: 20
    }
})

function mapStateToProps({ shared }) {
    return {
        shared
    }
}

export default connect(mapStateToProps)(PrivateKeyModal)