import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Dimensions, TextInput, Text, Image, Pressable, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert } from 'react-native'
// import Header from '../../components/header'

// Components
import MyTextInput from '../components/MyTextInput'
import TextInputWithBtn from '../components/TextInputWithBtn'
import PrimaryBtn from '../components/PrimaryBtn'
import BlitsBtn from '../components/BlitsBtn'
import Loading from '../components/Loading'
import MyStatusBar from '../components/MyStatusBar'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import Slider from '@react-native-community/slider'
import BigNumber from 'bignumber.js'
import { ASSETS } from '../../crypto/index'
import Toast, { DURATION } from 'react-native-easy-toast'
import * as Animatable from 'react-native-animatable'

// Icons
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'

// SVG
import AddDollarIcon from '../../../assets/images/add-dollar.svg'

// Actions
import { saveToken } from '../../actions/tokens'
import BNB from '../../crypto/BNB'

class AddTokenView extends Component {

    state = {
        contractAddress: '',
        symbol: '',
        // decimals: '18',
        shard: 0,
        loading: false,
    }

    toast = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
    }

    onLeftComponentPress = () => {
        this.props.navigation.goBack();
    }

    handleAddBtn = async () => {
        console.log('ADD_TOKEN_BTN')
        const { navigation, publicKeys, dispatch, shared } = this.props
        let { contractAddress, symbol, shard } = this.state

        if (!contractAddress) {
            Alert.alert('Error', 'Enter all the required fields', [{ text: 'OK' }])
            return
        }

        if (shard != 0) {
            Alert.alert('Error', 'Only shard 0 available')
            return
        }

        this.setState({ loading: true })
        let tokenData

        if(shared?.selectedAsset === 'BNB') {
            const bnb = new BNB('BNB', 'mainnet')
            tokenData = await bnb.getERC20Data(contractAddress, publicKeys['BNB'])
        }        

        const token = {
            contractAddress: tokenData?.contractAddress,
            name: tokenData?.name,
            symbol: tokenData?.symbol,
            decimals: tokenData?.decimals,
            shard,
            balance: tokenData?.balance,
            totalSupply: tokenData?.totalSupply,
            chainType: shared?.selectedAsset,
            address: publicKeys[shared?.selectedAsset]
        }

        dispatch(saveToken(token))

        this.setState({
            contractAddress: '',
            // decimals: '',
            shard: 0,
            loading: false
        })

        this.toast.current.show('Token Added')
    }

    handleContractAddressChange = (value) => this.setState({ contractAddress: value })
    handleSymbolChange = (value) => this.setState({ symbol: value })
    // handleDecimalsChange = (value) => this.setState({ decimals: value })
    handleShardChange = (value) => this.setState({ shard: value })

    render() {

        const { contractAddress, symbol, decimals, shard, loading } = this.state
        const { shared } = this.props
        const tokenType = shared?.selectedAsset === 'ONE' ? 'HRC20' : shared?.selectedAsset === 'BNB' ? 'BEP-20' : ''

        if (loading) {
            return <Loading message={'Adding HRC20 Token'} />
        }

        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" />

                <ScrollView style={styles.formContainer}>

                    <View style={styles.imageContainer}>
                        <Animatable.View duration={1000} animation="zoomIn" style={{ zIndex: 20 }}>
                            {/* <Image style={styles.image} source={require('../../../assets/images/add-dollar.png')} /> */}
                            <AddDollarIcon width={120} height={120} />
                        </Animatable.View>
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.formLabel}>Token Contract Address</Text>
                        <MyTextInput
                            placeholder="Token Contract Address"
                            value={contractAddress}
                            onChangeText={this.handleContractAddressChange}
                        />
                    </View>

                    {/* <View style={{ marginTop: 20 }}>
                        <Text style={styles.formLabel}>Symbol</Text>
                        <MyTextInput
                            placeholder="Symbol"
                            value={symbol}
                            onChangeText={this.handleSymbolChange}
                        />
                    </View> */}

                    {/* <View style={{ marginTop: 20 }}>
                        <Text style={styles.formLabel}>Decimals of Precision</Text>
                        <MyTextInput
                            placeholder="Decimals"
                            value={decimals}
                            onChangeText={this.handleDecimalsChange}
                            keyboardType="numeric"
                        />
                    </View> */}

                    {
                        shared?.selectedAsset === 'ONE' &&
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.formLabel}>Shard</Text>
                                <Text style={styles.text}>{shard}</Text>
                                <Slider
                                    style={{ width: '100%', height: 40, }}
                                    minimumValue={0}
                                    maximumValue={3}
                                    minimumTrackTintColor="black"
                                    maximumTrackTintColor="#000000"
                                    thumbTintColor="#3ACCDC"
                                    step={1}
                                    value={shard}
                                    onValueChange={this.handleShardChange}
                                />
                            </View>
                        </View>
                    }


                </ScrollView>

                <View style={{ width: '100%', paddingHorizontal: 20, paddingBottom: 20 }}>
                    <PrimaryBtn onPress={this.handleAddBtn} title={`Add ${tokenType} Token`} />
                </View>

                <Toast
                    ref={this.toast}
                    style={{ backgroundColor: '#32CCDD', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25 }}
                    position='top'
                    positionValue={30}
                    fadeInDuration={250}
                    fadeOutDuration={3000}
                    opacity={0.95}
                    textStyle={{ color: 'white', fontSize: 16, fontFamily: 'Poppins-Regular' }}
                />
            </SafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        // paddingHorizontal: 20,
        // paddingBottom: 20,
        // paddingTop: 10,
        backgroundColor: 'white',
        flex: 1,
        alignItems: 'center'
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
        paddingBottom: 30,
        backgroundColor: 'transparent',
        width: '100%',
        flex: 1
    },
    balancesContainer: {
        marginVertical: 0,
    },
    formLabel: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 12
    },
    text: {
        fontFamily: 'Poppins-Regular'
    },
    detailsContainer: {
        borderTopColor: '#f9f9f9',
        borderTopWidth: 1,
        paddingTop: 15,
        marginTop: 10,
        width: '100%',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        // marginBottom: 20,
    },
    sm_text: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10
    },
    txConfirmationText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40
    },
    image: {
        height: 120,
        width: 120,
        // borderRadius: 100
    },
    imageContainer: {
        // textAlign: 'center',
        // backgroundColor: 'red',
        alignItems: 'center'
    }


})

function mapStateToProps({ wallet, shared, balances }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        balances,
        wallet: wallet && wallet.wallet,
    }
}

export default connect(mapStateToProps)(AddTokenView)