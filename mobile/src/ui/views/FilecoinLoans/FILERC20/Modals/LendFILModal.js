import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Linking
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
import Web3 from 'web3'
import ETH from '../../../../../crypto/ETH'
import { FilecoinClient, FilecoinSigner } from '@blitslabs/filecoin-js-signer'
import ERC20CollateralLock from '../../../../../crypto/filecoinLoans/ERC20CollateralLock'
import { generateSecret } from '../../../../../crypto/filecoinLoans/utils'

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

// API
import { confirmLendOperation } from '../../../../../utils/filecoin_loans'

// Actions
import { saveFLTx } from '../../../../../actions/filecoinLoans'

const web3 = new Web3()

class LendFILModal extends Component {

    state = {
        modalState: 0,
        signLoading: false,
        lendLoading: false,
        secretHashB1: '',
        explorer: '',
        txHash: ''
    }


    componentDidMount() {
    }

    handleSignBtn = async () => {
        const { filecoinLoans, dispatch, chainId, blockchain, publicKeys, wallet } = this.props

        const collateralLockContract = filecoinLoans?.contracts?.[chainId]?.ERC20CollateralLock?.address

        this.setState({ signLoading: true })

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

        const account = publicKeys?.[blockchain]
        const userLoansCount = await collateralLock.getUserLoansCount(account)
        console.log(userLoansCount)

        if (userLoansCount?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to lend. Nonce: ${parseInt(userLoansCount?.payload) + 1}. Contract: ${collateralLockContract}`
        const secretData = await generateSecret(message, wallet?.[blockchain])
        console.log(secretData)

        this.setState({
            ethLender: account,
            secretHashB1: secretData?.payload?.secretHash,
            secretB1: secretData?.payload?.secret,
            modalState: 1,
            signLoading: false
        })

    }

    handleConfirmBtn = async () => {
        const { filecoinLoans, chainId, blockchain, loanDetails, publicKeys, wallet, loanId, dispatch } = this.props
        const { ethLender, secretHashB1 } = this.state

        this.setState({ modalState: 2 })

        // Prepare payment channel data
        const filBorrower = (loanDetails?.collateralLock?.filBorrower && loanDetails?.collateralLock?.filBorrower != '0x') ? web3.utils.toUtf8(loanDetails?.collateralLock?.filBorrower) : ''

        const filecoin_client = new FilecoinClient(ASSETS?.FIL?.mainnet_endpoints?.http, ASSETS?.FIL?.token)
        const filecoin_signer = new FilecoinSigner()

        let tx
        try {
            tx = await filecoin_client.paych.createPaymentChannel(
                publicKeys?.FIL,
                filBorrower,
                BigNumber(loanDetails?.collateralLock?.principalAmount).multipliedBy(1e18),
                wallet?.FIL?.privateKey,
                ASSETS?.FIL?.network,
                true
            )
            console.log(tx)
        } catch (e) {
            console.log(e)
            Alert.alert('Error', 'Error sending transaction', [{ text: 'OK' }])
            this.setState({ modalState: 1 })
            return
        }

        const paymentChannelId = tx?.ReturnDec?.IDAddress
        const paymentChannelAddress = tx?.ReturnDec?.RobustAddress

        let message, signature

        try {
            message = {
                loanId,
                contractLoanId: loanDetails?.collateralLock?.contractLoanId,
                erc20CollateralLock: loanDetails?.collateralLock?.collateralLockContractAddress,
                CID: tx?.Message,
                paymentChannelId,
                paymentChannelAddress,
                ethLender,
                filLender: publicKeys?.FIL,
                ethBorrower: loanDetails?.collateralLock?.borrower,
                filBorrower,
                secretHashB1,
                principalAmount: loanDetails?.collateralLock?.principalAmount,
                network: ASSETS?.FIL?.network,
                collateralNetwork: loanDetails?.collateralLock?.networkId
            }

            signature = filecoin_signer.utils.signMessage(JSON.stringify(message), wallet?.FIL?.privateKey)
        } catch (e) {
            console.log(e)
            Alert.alert('Error', 'Error signing message', [{ text: 'OK' }])
            this.setState({ modalState: 1 })
            return
        }
        console.log('message: ', message)
        console.log('signature: ', signature)

        // Send Message & Signed Msg to API
        this.confirmOpInterval = setInterval(async () => {
            confirmLendOperation({ assetType: 'FIL', message, signature })
                .then(data => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // Show Toast

                        // Save FL Tx
                        dispatch(saveFLTx({
                            receipt: tx,
                            txHash: tx?.Message['/'],
                            from: publicKeys?.FIL,
                            summary: `Create a Payment Channel with ${filBorrower} and lock ${loanDetails?.collateralLock?.principalAmount}`
                        }))

                        this.setState({
                            modalState: 3,
                            txHash: tx?.Message['/']
                        })
                    }
                })
        }, 3000)

    }


    render() {

        const {
            isVisible, onClose, publicKeys, balances, prepareTx, prices,
            handleConfirmBtn, loanDetails
        } = this.props

        const {
            signLoading, lendLoading, modalState, explorer
        } = this.state

        const emptyAddress = '0x0000000000000000000000000000000000000000'
        const filBorrower = loanDetails?.collateralLock?.filBorrower && loanDetails?.collateralLock?.filBorrower != '0x' ? web3.utils.toUtf8(loanDetails?.collateralLock?.filBorrower) : '-'
        const borrower = loanDetails?.collateralLock?.borrower && loanDetails?.collateralLock?.borrower != emptyAddress ? loanDetails?.collateralLock.borrower : '-'

        let collateralizationRatio = parseFloat(BigNumber(loanDetails?.collateralLock?.collateralAmount).dividedBy(BigNumber(loanDetails?.collateralLock?.principalAmount).multipliedBy(prices?.FIL?.usd)).multipliedBy(100)).toFixed(2)
        collateralizationRatio = !isNaN(collateralizationRatio) ? collateralizationRatio : '-'

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
                                    Lend FIL
                                </Text>

                            </View>

                            <View style={{ marginBottom: 130 }}>
                                <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                    <ProgressStep label="Sign Message" removeBtnRow={true} >
                                        <View style={{ alignItems: 'center' }}>
                                            <Text>Sign Message</Text>
                                        </View>
                                    </ProgressStep>
                                    <ProgressStep label="Payment Channel" >
                                        <View style={{ alignItems: 'center' }} removeBtnRow={true}>
                                            <Text>Payment Channel</Text>
                                        </View>
                                    </ProgressStep>

                                </ProgressSteps>
                            </View>

                            <View style={styles.txDetailsContainer}>
                                <View style={{}}>
                                    <Text style={styles.dataDescription}>You are lending {loanDetails?.collateralLock?.principalAmount} FIL to:</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Borrower's FIL Account</Text>
                                    <Text style={styles.dataValue}>{filBorrower}</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Borrower's ETH Account</Text>
                                    <Text style={styles.dataValue}>{borrower}</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Collateral</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.collateralLock?.collateralAmount}</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Collateralization Ratio</Text>
                                    <Text style={styles.dataValue}>{collateralizationRatio}%</Text>
                                </View>
                            </View>

                            <View style={styles.btnsContainer}>
                                <View style={{ flex: 1 }}>
                                    <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Sign" onPress={() => this.handleSignBtn()} />
                                </View>
                            </View>
                        </SafeAreaView>
                        :
                        modalState === 1 ?
                            <SafeAreaView style={styles.wrapper}>

                                <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
                                    <View style={{ position: 'absolute', left: 12 }}>
                                        <TouchableOpacity
                                            onPress={() => this.setState({ modalState: parseFloat(this.state.modalState) - 1 })}
                                        >
                                            <IconMaterialCommunity name="chevron-left" size={30} color="black" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.title}>
                                            Lend FIL
                                    </Text>
                                    </View>
                                </View>

                                <View style={{ marginBottom: 130 }}>
                                    <ProgressSteps
                                        activeStep={modalState} activeLabelColor={'#0062FF'}
                                        activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'}
                                        activeStepIconColor={'#0062FF'} completedLabelColor="black"
                                    >
                                        <ProgressStep label="Sign Message" removeBtnRow={true}>
                                            <View style={{ alignItems: 'center' }}>
                                                <Text>Sign Message</Text>
                                            </View>
                                        </ProgressStep>
                                        <ProgressStep label="Payment Channel" removeBtnRow={true} >
                                            <View style={{ alignItems: 'center' }} >
                                                <Text>Payment Channel</Text>
                                            </View>
                                        </ProgressStep>

                                    </ProgressSteps>
                                </View>

                                <View style={styles.txDetailsContainer}>
                                    <View style={{}}>
                                        <Text style={styles.dataDescription}>You are creating a Payment Channel with the Borrower as part of the lending process.</Text>
                                    </View>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataValue}>• You are transferring and locking 2 FIL into a Payment Channel contract.</Text>
                                        <Text style={styles.dataValue}>• Once created, you'll have to wait for the Borrower to accept the offer.</Text>
                                        <Text style={styles.dataValue}>• When the offer is accepted, you'll have to create and sign a Voucher to allow the Borrower to withdraw the principal.</Text>
                                        <Text style={styles.dataValue}>• If the Borrower fails to accept the offer in x days, then you'll be able to unlock your FIL.</Text>
                                    </View>
                                </View>
                                <View style={styles.btnsContainer}>
                                    <View style={{ flex: 1 }}>
                                        <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Confirm" onPress={() => this.handleConfirmBtn()} />
                                    </View>
                                </View>
                            </SafeAreaView>
                            :
                            modalState === 2
                                ?
                                <SafeAreaView style={styles.wrapper}>

                                    <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.title}>
                                                Lend FIL
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ height: 200, marginTop: 20 }}>
                                        <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                                    </View>
                                    <View style={{ alignItems: 'center', marginBottom: 50, marginHorizontal: 40 }}>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Waiting For Confirmations</Text>
                                        <Text style={{ fontFamily: 'Poppins-Regular' }}>Creating a Payment Channel with {loanDetails?.collateralLock?.principalAmount} FIL</Text>
                                        <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text>
                                    </View>
                                </SafeAreaView>
                                :
                                <SafeAreaView style={styles.wrapper}>

                                    <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.title}>
                                                Lend FIL
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 36, marginBottom: 24, alignItems: 'center' }}>
                                        <TxSubmitted width={100} height={100} />
                                    </View>
                                    <View style={{ alignItems: 'center', marginBottom: 0, marginHorizontal: 40 }}>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Transaction Submitted</Text>
                                        <TouchableOpacity
                                            onPress={() => Linking.openURL(ASSETS?.FIL?.explorer_url + this.state.txHash)}
                                        >
                                            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#0062FF', marginVertical: 5 }}>View on Explorer</Text>
                                        </TouchableOpacity>
                                        <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have created a Payment Channel with the Borrower.</Text>
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
    }
})


function mapStateToProps({ tokens, balances, wallet, prepareTx, prices, filecoinLoans }, ownProps) {
    return {
        tokens,
        balances,
        publicKeys: wallet?.publicKeys,
        wallet: wallet?.wallet,
        prepareTx,
        prices,
        filecoinLoans,
        loanDetails: filecoinLoans?.loanDetails['FIL'][ownProps?.loanId],
        chainId: filecoinLoans?.loanDetails['FIL'][ownProps?.loanId]?.collateralLock?.networkId,
        blockchain: filecoinLoans?.loanDetails['FIL'][ownProps?.loanId]?.collateralLock?.blockchain,
    }
}

export default connect(mapStateToProps)(LendFILModal)