import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView
} from 'react-native'

// Libraries
import Modal from 'react-native-modal'
import ImageLoad from 'react-native-image-placeholder'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'

class SelectAssetModal extends Component {

    componentDidMount() {

    }

    render() {

        const { isVisible, onClose, onTokenSelect, blockchain, tokens, publicKeys, balances } = this.props

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
                    <TouchableOpacity
                        hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
                        onPress={() => onClose()}
                        style={styles.closeBtnContainer}
                    >
                        <Ionicons name='close' color={'grey'} size={25} />
                    </TouchableOpacity>
                    <View style={styles.draggerWrapper}>
                        <Text style={styles.modalTitle}>Select a token</Text>
                    </View>

                    <ScrollView>
                        <TouchableOpacity
                            onPress={() => onTokenSelect(blockchain, blockchain)}
                            style={styles.tokenContainer}
                        >
                            <View style={styles.avatarContainer}>
                                <ImageLoad style={{ height: 40, width: 40 }}
                                    source={{ uri: `https://exchange.pancakeswap.finance/images/coins/${blockchain}.png` }}
                                />
                            </View>
                            <View style={styles.accountTextContainer}>
                                <Text style={styles.accountText}>{blockchain} </Text>
                                <Text style={styles.balanceText}>Balance: {balances[publicKeys[blockchain]]?.total_balance}</Text>
                            </View>
                        </TouchableOpacity>

                        {
                            Object.values(tokens).filter(t => t.chainType === blockchain).sort((a, b) => parseFloat(a?.balance) < parseFloat(b?.balance)).map((t, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => onTokenSelect(t?.symbol, t?.contractAddress)}
                                    style={styles.tokenContainer}
                                >
                                    <View style={styles.avatarContainer}>
                                        <ImageLoad style={{ height: 40, width: 40 }}
                                            source={{ uri: `https://exchange.pancakeswap.finance/images/coins/${t?.contractAddress}.png` }}
                                        />
                                    </View>
                                    <View style={styles.accountTextContainer}>
                                        <Text style={styles.accountText}>{t?.symbol} </Text>
                                        <Text style={styles.balanceText}>Balance: {t?.balance}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </ScrollView>
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
        top: 10,
        // backgroundColor: 'red',

    },
    modalTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18
    },
    wrapper: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: 'white',
        height: '100%'
    },
    draggerWrapper: {
        width: '100%',
        height: 33,
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        // borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: 'grey'
    },
    dragger: {
        width: 48,
        height: 5,
        borderRadius: 4,
        backgroundColor: 'grey',
        opacity: 0.5
    },
    titleWrapper: {
        marginTop: 10,
        alignItems: 'center'
    },
    title: {
        fontFamily: 'Poppins-SemiBold',
        color: 'black',
        fontSize: 18,
        flexDirection: 'row',
        alignSelf: 'center'
    },
    tokenContainer: {
        flexDirection: 'row', alignItems: 'center',
        borderColor: 'transparent', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 10,
        paddingVertical: 8,
        marginVertical: 5
    },
    avatarContainer: {
        flex: 2,
    },
    accountTextContainer: {
        flexDirection: 'column',
        flex: 10,
        paddingLeft: 5
    },
    roundedProfileImage: {
        width: 50, height: 50, borderWidth: 3,
        borderColor: 'white', borderRadius: 50,
    },
    accountText: {
        fontFamily: 'Poppins-SemiBold',
    },
    balanceText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginTop: -3
    },
    txDetailsContainer: {

        borderColor: 'grey', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15
    },
    textLink: {
        fontFamily: 'Poppins-SemiBold',
        color: '#32CCDD',
        fontSize: 12,
    }
})


function mapStateToProps({ tokens, balances, wallet }) {
    return {
        tokens,
        balances,
        publicKeys: wallet?.publicKeys
    }
}

export default connect(mapStateToProps)(SelectAssetModal)