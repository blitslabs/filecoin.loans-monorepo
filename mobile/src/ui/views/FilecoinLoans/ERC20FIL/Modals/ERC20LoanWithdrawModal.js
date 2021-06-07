import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Image, Linking
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
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps'
import {
    WaveIndicator,
} from 'react-native-indicators'
import Web3 from 'web3'
import ETH from '../../../../../crypto/ETH'
import { FilecoinClient, FilecoinSigner } from '@blitslabs/filecoin-js-signer'
import ERC20Loans from '../../../../../crypto/filecoinLoans/ERC20Loans'
import { generateSecret } from '../../../../../crypto/filecoinLoans/utils'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import FilecoinLogo from '../../../../../../assets/images/filecoin-logo.svg'

// SVG
import TxSubmitted from '../../../../../../assets/images/tx_submitted.svg'

// API
import { confirmERC20LoanOperation } from '../../../../../utils/filecoin_loans'

// Actions
import { saveFLTx } from '../../../../../actions/filecoinLoans'

const web3 = new Web3()

class ERC20LoanWithdrawModal extends Component {

    state = {
        modalState: 0,
        txLoading: false,
        lendLoading: false,
        secretHashB1: '',
        signLoading: false
    }


    componentDidMount() {
        
    }

    handleSignBtn = async () => {

        const { filecoinLoans, chainId, wallet, loanDetails, shared, blockchain } = this.props
        const erc20LoansContract = filecoinLoans?.contracts?.[chainId]?.ERC20Loans?.address

        this.setState({ signLoading: true })

        let eth
        try {
            eth = new ETH(blockchain, 'mainnet')
        } catch (e) {
            console.log(e)
            return
        }

        let erc20Loans
        try {
            erc20Loans = new ERC20Loans(eth.web3, erc20LoansContract, chainId)
        } catch (e) {
            console.log(e)
            this.setState({ signLoading: false })
            return
        }

        const accountLoans = await erc20Loans.getAccountLoans(wallet?.[blockchain]?.publicKey)
        console.log(accountLoans)
        if (accountLoans?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        let userLoansCount = 0
        for (let l of accountLoans?.payload) {
            userLoansCount++
            if (l == loanDetails?.erc20Loan?.contractLoanId) break;
        }
        console.log(userLoansCount)

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to create the request. Nonce: ${parseFloat(userLoansCount) + 1}. Contract: ${erc20LoansContract}`
        const secretData = await generateSecret(message, wallet?.[blockchain])
        console.log(secretData)

        if (secretData?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        this.setState({
            secretA1: secretData?.payload?.secret,
            modalState: 1,
            signLoading: false
        })
    }

    handleConfirmBtn = async () => {

        const { loanDetails, loanId, wallet, chainId, blockchain, filecoinLoans, dispatch } = this.props
        const { secretA1 } = this.state
        const erc20LoansContract = filecoinLoans?.contracts?.[chainId]?.ERC20Loans?.address

        this.setState({ modalState: 2 })

        let eth
        try {
            eth = new ETH(blockchain, 'mainnet')
        } catch (e) {
            console.log(e)
            return
        }

        let erc20Loans
        try {
            erc20Loans = new ERC20Loans(eth.web3, erc20LoansContract, chainId)
        } catch (e) {
            console.log(e)
            this.setState({ signLoading: false })
            return
        }

        // Get Gas Data
        const gasData = await eth.getGasData()
        const gasLimit = '800000' // TODO
        console.log('Gas Data: ', gasData)

        const response = await erc20Loans.withdraw(
            loanDetails?.erc20Loan?.contractLoanId,
            web3.utils.toHex(secretA1),
            gasLimit,
            gasData?.gasPrice,
            wallet?.[blockchain]
        )

        console.log(response)

        if (response?.status !== 'OK') {
            // show toast
            this.setState({ modalState: 1 })
            return
        }

        dispatch(saveFLTx({
            receipt: response?.payload,
            txHash: response?.payload?.transactionHash,
            from: response?.payload?.from,
            summary: `Withdraw ${loanDetails?.erc20Loan?.principalAmount} ${filecoinLoans?.loanAssets[loanDetails?.erc20Loan?.token]?.symbol} Principal`,
            networkId: chainId
        }))

        const params = {
            operation: 'Withdraw',
            networkId: chainId,
            txHash: response?.payload?.transactionHash
        }

        this.intervalId = setInterval(async () => {
            confirmERC20LoanOperation(params)
                .then(data => data.json())
                .then((res) => {
                    if (res.status === 'OK') {
                        clearInterval(this.intervalId)
                        // show toast
                        this.setState({ modalState: 3, txHash: response?.payload?.transactionHash })
                        return
                    }
                })
        }, 3000)
    }


    render() {

        const {
            isVisible, onClose, filecoinLoans, loanDetails,
            handleCloseModal, handleConfirmBtn
        } = this.props

        const {
            modalState, txLoading, txHash, signLoading, secretA1
        } = this.state
        const asset = filecoinLoans?.loanAssets[loanDetails?.erc20Loan?.token]

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

                            <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                <Text style={styles.title}>
                                    Withdraw Principal
                                </Text>
                            </View>

                            <View style={{ marginBottom: 130 }}>
                                <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                    <ProgressStep label="Generate Secret" removeBtnRow={true} >
                                        <View style={{ alignItems: 'center' }}>
                                            <Text>Generate Secret</Text>
                                        </View>
                                    </ProgressStep>
                                    <ProgressStep label="Withdraw Principal" removeBtnRow={true} >
                                        <View style={{ alignItems: 'center' }}>
                                            <Text>Withdraw Principal</Text>
                                        </View>
                                    </ProgressStep>

                                </ProgressSteps>
                            </View>

                            <View style={styles.txDetailsContainer}>

                                <View style={{ borderBottomWidth: 0.5, borderColor: 'rgb(229, 229, 229)', paddingBottom: 10 }}>
                                    <Text style={styles.description}>The Lender has approved your borrow request and you are now able to withdraw the principal.</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataDescription}>You are withdrawing the loan's principal:</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Principal</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.erc20Loan?.principalAmount} {asset?.symbol}</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Token Address</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.erc20Loan?.token}</Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Secret Hash A1</Text>
                                    <Text style={styles.dataValue}>{loanDetails?.erc20Loan?.secretHashA1}</Text>
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.dataTitle}>Secret A1 </Text>
                                    <Text style={styles.dataValue}>-</Text>
                                </View>
                            </View>

                            <View style={styles.btnsContainer}>
                                <View style={{ flex: 1 }}>
                                    <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <BlitsBtn
                                        disabled={signLoading}
                                        style={!signLoading ? { backgroundColor: '#0062FF' } : { backgroundColor: '#0062ff8c' }}
                                        title={signLoading ? 'Signing...' : "Sign Voucher"}
                                        onPress={() => this.handleSignBtn()}
                                    />
                                </View>
                            </View>
                        </SafeAreaView>
                        :
                        modalState === 1 ?
                            <SafeAreaView style={styles.wrapper}>
                                {/* <View style={styles.draggerWrapper}>
                            <View style={styles.dragger} />
                        </View> */}

                                <View style={[styles.titleWrapper, { marginTop: 24 }]}>
                                    <Text style={styles.title}>
                                        Withdraw Principal
                                    </Text>
                                </View>

                                <View style={{ marginBottom: 130 }}>
                                    <ProgressSteps activeStep={modalState} activeLabelColor={'#0062FF'} activeStepIconBorderColor={'#0062FF'} activeStepNumColor={'white'} activeStepIconColor={'#0062FF'} >
                                        <ProgressStep label="Generate Secret" removeBtnRow={true} >
                                            <View style={{ alignItems: 'center' }}>
                                                <Text>Generate Secret</Text>
                                            </View>
                                        </ProgressStep>
                                        <ProgressStep label="Withdraw Principal" removeBtnRow={true} >
                                            <View style={{ alignItems: 'center' }}>
                                                <Text>Withdraw Principal</Text>
                                            </View>
                                        </ProgressStep>

                                    </ProgressSteps>
                                </View>

                                <View style={styles.txDetailsContainer}>

                                    <View style={{ borderBottomWidth: 0.5, borderColor: 'rgb(229, 229, 229)', paddingBottom: 10 }}>
                                        <Text style={styles.description}>The Lender has approved your borrow request and you are now able to withdraw the principal.</Text>
                                    </View>

                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataDescription}>You are withdrawing the loan's principal:</Text>
                                    </View>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataTitle}>Principal</Text>
                                        <Text style={styles.dataValue}>{loanDetails?.erc20Loan?.principalAmount} {asset?.symbol}</Text>
                                    </View>

                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataTitle}>Token Address</Text>
                                        <Text style={styles.dataValue}>{loanDetails?.erc20Loan?.token}</Text>
                                    </View>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataTitle}>Secret Hash A1</Text>
                                        <Text style={styles.dataValue}>{loanDetails?.erc20Loan?.secretHashA1}</Text>
                                    </View>

                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.dataTitle}>Secret A1 </Text>
                                        <Text style={styles.dataValue}>{secretA1}</Text>
                                    </View>
                                </View>

                                <View style={styles.btnsContainer}>
                                    <View style={{ flex: 1 }}>
                                        <SecondaryBtn title="Reject" onPress={() => onClose()} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <BlitsBtn style={{ backgroundColor: '#0062FF' }} title="Withdraw" onPress={() => this.handleConfirmBtn()} />
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
                                                Withdraw Principal
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ height: 200, marginTop: 20 }}>
                                        <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                                    </View>
                                    <View style={{ alignItems: 'center', marginBottom: 50, marginHorizontal: 40 }}>
                                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>Waiting For Confirmations</Text>
                                        <Text style={{ fontFamily: 'Poppins-Regular' }}>Withdrawing Principal</Text>
                                        <Text style={{ fontFamily: 'Poppins-Light', textAlign: 'center', marginTop: 10 }}>This process can take up to 1 min to complete. Please don't close the app.</Text>
                                    </View>
                                </SafeAreaView>
                                :
                                <SafeAreaView style={styles.wrapper}>

                                    <View style={{ flexDirection: 'row', marginBottom: 0, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>

                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.title}>
                                                Withdraw Principal
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
                                        <Text style={{ fontFamily: 'Poppins-Regular', textAlign: 'center' }}>You have withdrawn the loan's principal. You have until the loan's expiration date to repay the loan.</Text>
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
        publicKeys: wallet?.publicKeys,
        wallet: wallet?.wallet,
        prepareTx,
        prices,
        filecoinLoans,
        loanDetails: filecoinLoans?.loanDetails['ERC20'][ownProps?.loanId],
        chainId: filecoinLoans?.loanDetails['ERC20'][ownProps?.loanId].erc20Loan?.networkId,
        blockchain: filecoinLoans?.loanDetails['ERC20'][ownProps?.loanId].erc20Loan?.blockchain,
    }
}


export default connect(mapStateToProps)(ERC20LoanWithdrawModal)