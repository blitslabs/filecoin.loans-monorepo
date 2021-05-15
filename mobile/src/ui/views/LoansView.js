import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar,
    StyleSheet, Keyboard, TouchableOpacity, Platform, Alert
} from 'react-native'

import Header from '../components/Header'


const HEIGHT = Dimensions.get('window').height

// Libraries
import SplashScreen from 'react-native-splash-screen'

// Actions
import { setSelectedAsset } from '../../actions/shared'
import { saveLoanRequest } from '../../actions/loanRequest'

// API
import { getLoansSettings } from '../../utils/api'

import { ETH_CHAIN_NAME } from "@env"

class LoansView extends Component {

    cardStackRef = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        Keyboard.dismiss()
        const { dispatch } = this.props

        const network = ETH_CHAIN_NAME === 'mainnet' ? 'mainnet' : 'testnet'

        getLoansSettings({ network })
            .then(data => data.json())
            .then((res) => {
                // console.log(res)
                if (res.status === 'OK') {
                    dispatch(saveLoanRequest(res.payload))
                   
                }
            })
    }

    handleLoanRequestType = (loanRequestType) => {
        // Coming Soon
        Alert.alert('Coming soon!', 'We are migrating this feature to the mainnet.', [{ text: 'OK' }])
        return

        const { dispatch, navigation } = this.props
        dispatch(saveLoanRequest({ loanRequestType }))
        if (loanRequestType === 'BORROW') {
            navigation.navigate('AvailableLoans')
            return
        } else if (loanRequestType === 'LEND') {
            navigation.navigate('SelectAsset')
            return
        }
    }

    handleMyLoansBtn = () => {
        console.log('MY_LOANS_BTN')
        const { navigation } = this.props
        navigation.navigate('MyLoans', { transition: 'SlideFromRight' })
    }

    render() {

        const { shared, } = this.props
        const { selectedAsset } = shared

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <Header
                    title="Loans"
                    navigation={this.props.navigation}
                    rightComponentTitle="My Loans"
                    onRightComponentPress={this.handleMyLoansBtn}
                />
                <View style={{ backgroundColor: 'transparent', flex: 1, paddingHorizontal: 20 }}>
                    <View style={{}}>
                        <Text style={styles.mainText}>Lend or Borrow assets across blockchains!</Text>
                        <Text style={styles.secondaryText}>Get liquidity witout selling your assets</Text>
                    </View>

                    <TouchableOpacity onPress={() => this.handleLoanRequestType('BORROW')} style={styles.btnContainer}>
                        <View style={{ width: '100%' }}>
                            <Text style={styles.btnTitle}>Borrow</Text>
                            <Text style={styles.btnSubtitle}>Deposit FIL as collateral and borrow stablecoins on Ethereum's blockchain</Text>
                        </View>
                        <Image source={require('../../../assets/images/bg1.jpg')} style={styles.btnBgImg} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.handleLoanRequestType('LEND')} style={styles.btnContainer}>
                        <View style={{ width: '100%' }}>
                            <Text style={styles.btnTitle}>Lend</Text>
                            <Text style={styles.btnSubtitle}>Deposit stablecoins on Ethereum's blockchain to earn interest.</Text>
                        </View>
                        <Image source={require('../../../assets/images/bg2.png')} style={styles.btnBgImg} />
                    </TouchableOpacity>

                    {/* <View style={styles.myLoansContainer}>
                        <TouchableOpacity>
                            <Text style={styles.myLoansTxt}>Go to My Loans</Text>
                        </TouchableOpacity>
                    </View> */}
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        // height: HEIGHT,
        // paddingHorizontal: 20,
        paddingVertical: 20,
    },
    btnContainer: {
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: Platform.OS === 'ios' ? 10 : 5,
        // borderColor: 'black',
        // borderWidth: 1,
        // position: 'absolute',
        // flex: 1,
    },
    btnBgImg: {
        resizeMode: 'cover',
        width: Dimensions.get('window').width - 25,
        borderRadius: 10,
        height: 90,
        position: 'absolute',
        zIndex: -20
    },
    btnTitle: {
        fontFamily: 'Poppins-SemiBold',
        color: 'white',
        fontSize: 14
    },
    btnSubtitle: {
        fontFamily: 'Poppins-Regular',
        color: 'white',
        fontSize: 12
    },
    mainText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        marginTop: 20
    },
    secondaryText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginBottom: 10
    },
    myLoansContainer: {
        borderTopWidth: 0.5,
        borderTopColor: '#f1f1f1',
        marginTop: 20,
        paddingTop: 20,
        alignItems: 'center'
    },
    myLoansTxt: {
        fontFamily: 'Poppins-Regular',
    }

})

function mapStateToProps({ wallet, shared }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
    }
}

export default connect(mapStateToProps)(LoansView)