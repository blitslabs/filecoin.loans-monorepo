import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Alert
} from 'react-native'

// Components
import BlitsBtn from '../../../../components/BlitsBtn'
import SecondaryBtn from '../../../../components/SecondaryBtn'
import MyTextInput from '../../../../components/MyTextInput'

// Libraries
import Modal from 'react-native-modal'
import ImageLoad from 'react-native-image-placeholder'
import { ASSETS } from '../../../../../crypto/index'
import { Gravatar } from 'react-native-gravatar'
import BigNumber from 'bignumber.js'
import ETH from '../../../../../crypto/ETH'
import ERC20CollateralLock from '../../../../../crypto/filecoinLoans/ERC20CollateralLock'
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps'
import {
    WaveIndicator,
} from 'react-native-indicators'
// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import FilecoinLogo from '../../../../../../assets/images/filecoin-logo.svg'

// SVG
import TxSubmitted from '../../../../../../assets/images/tx_submitted.svg'

// Actions
import { saveFLTx } from '../../../../../actions/filecoinLoans'

// API
import { confirmERC20CollateralLockOperation } from '../../../../../utils/filecoin_loans'

class AcceptOfferModal extends Component {

    state = {
        modalState: 0,
        txLoading: false,
        lendLoading: false,
        secretHashB1: '',
        txHash: ''
    }


    componentDidMount() {
        
    }

    handleAcceptBtn = async () => {
        const { loanDetails, loanId, filecoinLoans, dispatch, wallet, blockchain, chainId } = this.props
        const collateralLockContract = filecoinLoans?.contracts?.[chainId]?.ERC20CollateralLock?.address

        this.setState({ modalState: 1 })

        let eth
        try {
            eth = new ETH(blockchain, 'mainnet')
        } catch (e) {
            console.log(e)
            return
        }

        let collateralLock
        try {
            collateralLock = new ERC20CollateralLock(eth.web3, collateralLockContract, chainId)
        } catch (e) {
            console.log(e)
            this.setState({ signLoading: false })
            return
        }

        // Get Gas Data
        const gasData = await eth.getGasData()
        const gasLimit = '800000' // TODO
        console.log('Gas Data: ', gasData)

        const response = await collateralLock.acceptOffer(
            loanDetails?.filLoan?.collateralLockContractId,
            loanDetails?.filLoan?.ethLender,
            loanDetails?.filLoan?.filLender,
            loanDetails?.filLoan?.secretHashB1,
            loanDetails?.filLoan?.paymentChannelId,
            loanDetails?.filLoan?.principalAmount,
            gasLimit,
            gasData?.gasPrice,
            wallet?.[blockchain]
        )

        if (response?.status !== 'OK') {
            Alert.alert('Error', response?.message ? response?.message : 'Error accepting offer', [{ text: 'OK' }])
            this.setState({ modalState: 0 })
            return
        }

        console.log(response)

        // SAVE FL Tx
        dispatch(saveFLTx({
            receipt: response?.payload,
            txHash: response?.payload?.transactionHash,
            from: response?.payload?.from,
            summary: `Accept ${loanDetails?.filLoan?.principalAmount} FIL Loan Offer`,
            networkId: chainId
        }))

        const params = {
            operation: 'AcceptOffer',
            networkId: chainId,
            txHash: response?.payload?.transactionHash,
        }

        this.intervalId = setInterval(async () => {
            confirmERC20CollateralLockOperation(params)
                .then(data => data.json())
                .then((res) => {
                    if (res.status === 'OK') {
                        clearInterval(this.intervalId)

                        // Show Toast

                        this.setState({ modalState: 2, txHash: response?.payload?.transactionHash })
                        return
                    }
                })
        }, 3000)
    }

    render() {

        const {
            isVisible, onClose, publicKeys, balances, prepareTx, prices,
            handleCloseModal, handleConfirmBtn, loanDetails
        } = this.props

        const {
            modalState, txLoading, txHash
        } = this.state

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
                {
                    modalState === 0
                        ?
                        <SafeAreaView style={styles.wrapper}>
                            {/* <View style={styles.draggerWrapper}>
                                <View style={styles.dragger} />
                            </View> */}

                            <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                <Text style={styles.title}>
                                    Accept Offer
                                </Text>

                            </View>


                            <View style={styles.txDetailsContainer}>
                                <View style={{ borderBottomWidth: 0.5, borderColor: 'rgb(229, 229, 229)', paddingBottom: 10 }}>
                                    <Text style={styles.description}>To withdraw the Loan's Principal you'll need a Voucher signed by the Lender.</Text>
                                    <Text style={styles.description}>To obtain this Voucher, you need to accept the Lender's offer and link his secret hashes to your request.</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataDescription}>You are accepting an offer: </Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Lenders's FIL Account</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.filLoan?.filLender}</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Lenders's ETH Account</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.filLoan?.ethLender}</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Secret Hash B1</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.filLoan?.secretHashB1}</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Principal Offered</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.filLoan?.principalAmount} FIL</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Payment Channel Address</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.filLoan?.paymentChannelAddress}</Text>
                                </View>
                            </View>

                            <View style={styles.btnsContainer}>
                                <View style={{ flex: 1 }}>
                                    <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Accept" onPress={() => this.handleAcceptBtn()} />
                                </View>
                            </View>
                        </SafeAreaView>
                        :

                        modalState === 1
                            ?
                            <SafeAreaView style={styles.wrapper}>

                                <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.title}>
                                            Accept Offer
                                            </Text>
                                    </View>
                                </View>

                                <View style={{ height: 200, marginTop: 20 }}>
                                    <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                                </View>
                                <View style={{ alignItems: 'center', marginBottom: 50, marginHorizontal: 40 }}>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Waiting For Confirmations</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular' }}>Accepting Offer </Text>
                                    <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text>
                                </View>
                            </SafeAreaView>
                            :
                            <SafeAreaView style={styles.wrapper}>

                                <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.title}>
                                            Accept Offer
                                            </Text>
                                    </View>
                                </View>

                                <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                    <TxSubmitted width={100} height={100} />
                                </View>
                                <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Transaction Submitted</Text>
                                    <TouchableOpacity
                                        onPress={() => Linking.openURL(ASSETS?.[this.props?.blockchain]?.explorer_url + this.state.txHash)}
                                    >
                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#0062FF', marginVertical: 5 }}>View on Explorer</Text>
                                    </TouchableOpacity>
                                    <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have accepted the Lender's offer. Please wait for the Lender to sign a Voucher so you can redeem the loan's principal.</Text>
                                    {/* <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text> */}
                                </View>
                                <View style={styles.btnsContainer}>
                                    <View style={{ flex: 1 }}>
                                        <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Close" onPress={() => onClose()} />
                                    </View>
                                </View>
                            </SafeAreaView>



                }


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
        // height: '100%'
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
    accountContainer: {
        flexDirection: 'row', alignItems: 'center',
        borderColor: 'grey', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 10,
        paddingVertical: 8,
        marginVertical: 10
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

        // borderColor: 'grey', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 0
    },
    textLink: {
        fontFamily: 'Poppins-SemiBold',
        color: '#32CCDD',
        fontSize: 12,
    },
    dataTitle: {
        fontFamily: 'Poppins-Light',
        color: '#6F6F6F',
        fontSize: 12
    },
    dataValue: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
    },
    dataDescription: {
        fontFamily: 'Poppins-SemiBold'
    },
    btnsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 15,
        marginTop: 15,
        borderTopWidth: 0.5,
        borderColor: 'rgb(229, 229, 229)',
        paddingTop: 20
    },
    description: {
        fontFamily: 'Poppins-Light',
        fontSize: 12
    }
})


function mapStateToProps({ tokens, balances, wallet, prepareTx, prices, filecoinLoans }, ownProps) {
    return {
        tokens,
        balances,
        wallet: wallet?.wallet,
        publicKeys: wallet?.publicKeys,
        prepareTx,
        prices,
        filecoinLoans,
        loanDetails: filecoinLoans?.loanDetails['FIL'][ownProps?.loanId],
        chainId: filecoinLoans?.loanDetails['FIL'][ownProps?.loanId]?.collateralLock?.networkId,
        blockchain: filecoinLoans?.loanDetails['FIL'][ownProps?.loanId]?.collateralLock?.blockchain,
    }
}

export default connect(mapStateToProps)(AcceptOfferModal)