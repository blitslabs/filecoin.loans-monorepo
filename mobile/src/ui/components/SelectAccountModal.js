import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Image, SafeAreaView, StyleSheet, TouchableOpacity, Alert,
    Dimensions, Clipboard, Share
} from 'react-native'

// Components
import PrimaryBtn from './PrimaryBtn'
import BlitsBtn from './BlitsBtn'
import SecondaryBtn from './SecondaryBtn'

// Libraries
import QRCode from 'react-native-qrcode-svg'
import Modal from 'react-native-modal'
import Toast from 'react-native-simple-toast'
import { Gravatar } from 'react-native-gravatar'
import BigNumber from 'bignumber.js'
import currencyFormatter from 'currency-formatter'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'

class SelectAccountModal extends Component {

    state = {
        account: '',
        blockchain: ''
    }

    handleAccountBtn = (account, blockchain) => {        
        this.setState({ account, blockchain })
    }

    componentDidMount() {
       
    }

    render() {

        const {
            publicKeys, balances, shared, prices,
            isVisible, onClose, onPress, dappName, dappUrl
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
                        <Text style={styles.modalTitle}>Select Account to Connect</Text>
                    </View>
                    <View style={styles.dappDetailsContainer}>
                        <Text style={styles.dappName}>{dappName}</Text>
                        <Text style={styles.dappUrl}>{dappUrl}</Text>
                    </View>
                    <View style={styles.qrContainer}>
                        {
                            Object.entries(publicKeys).filter(a => a[0] !== 'BTC').map((a) => {
                                
                                const blockchain = a[0]
                                const account = a[1]
                                const balance = currencyFormatter.format(balances[account]?.total_balance, { code: 'USD', }).replace('$','')
                                const balanceValue = BigNumber(prices[blockchain]?.[shared?.currency?.toLowerCase()]).multipliedBy(balance).toString()
                                
                                return (
                                    <TouchableOpacity 
                                    key={account}
                                    onPress={() => this.handleAccountBtn(account, blockchain)}
                                    style={account === this.state.account ? styles.accountContainerSelected : styles.accountContainer}
                                    >
                                        <View style={styles.avatarContainer}>
                                            <Gravatar options={{
                                                email: account,
                                                parameters: { "size": "200", "d": "retro" },
                                                secure: true,

                                            }}
                                                style={styles.roundedProfileImage} />
                                        </View>
                                        <View style={styles.accountTextContainer}>
                                            <Text style={account === this.state.account ? styles.selectedAccountText : styles.accountText}>{blockchain} ({account.substring(0, 15)}...)</Text>
                                            <Text style={account === this.state.account ? styles.selectedBalanceText : styles.balanceText}>Balance ${balanceValue} ({balance} {blockchain})</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                        <View style={styles.btnContainer}>
                            {/* <SecondaryBtn
                                title="Cancel"
                            /> */}
                            <BlitsBtn
                                title="Approve"
                                onPress={() => onPress(this.state.account, this.state.blockchain)}
                                disabled={this.state.account ? false : true}
                                style={{ width: '100%' }}
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
        marginTop: 30
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
        width: Dimensions.get('window').width - 40,
        justifyContent: 'center',
        flexDirection: 'row',
        // backgroundColor: 'red',
        marginTop: 40
    },

    // Account
    accountContainer: {
        flexDirection: 'row', alignItems: 'center',
        borderColor: 'grey', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 10,
        paddingVertical: 8,
        marginTop: 5
    },
    accountContainerSelected: {
        flexDirection: 'row', alignItems: 'center',
        borderColor: 'grey', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 10,
        paddingVertical: 8,
        marginTop: 5, backgroundColor: '#32CCDD'
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
        width: 50, height: 50, 
       borderRadius: 50,
    },
    selectedAccountText: {
        fontFamily: 'Poppins-SemiBold',
        color:'white'
    },
    selectedBalanceText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginTop: -3,
        color: 'white'
    },
    accountText: {
        fontFamily: 'Poppins-SemiBold',
        color: 'black'
    },
    balanceText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginTop: -3,
        color: 'black'
    },
    dappDetailsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    dappName: {
        fontFamily: 'Poppins-Regular'
    },
    dappUrl: {
        fontFamily: 'Poppins-Regular'
    }
})

function mapStateToProps({ wallet, balances, prices, shared }) {
    return {
        publicKeys: wallet?.publicKeys,
        balances,
        prices,
        shared
    }
}

export default connect(mapStateToProps)(SelectAccountModal)