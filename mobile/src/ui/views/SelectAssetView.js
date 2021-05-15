import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar, StyleSheet, Keyboard, TouchableOpacity, Alert } from 'react-native'

import Header from '../components/Header'


const HEIGHT = Dimensions.get('window').height

// Libraries
import SplashScreen from 'react-native-splash-screen'

// Actions
import { saveLoanRequest } from '../../actions/loanRequest'

//
const ASSETS = ['ONE', 'ETH', 'BTC']

class SelectAssetView extends Component {

    cardStackRef = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        Keyboard.dismiss()
        const { dispatch } = this.props


    }

    handleSelectAssetBtn(assetSymbol) {
        const { dispatch, navigation } = this.props
        dispatch(saveLoanRequest({ assetSymbol }))
        navigation.navigate('NewLoan')
    }

    render() {

        const { loanRequest } = this.props
        const { loanRequestType } = loanRequest

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <View style={{ paddingHorizontal: 12, paddingTop: 20, backgroundColor: 'white' }}>
                    <Header
                        title="Select Stablecoin"
                        navigation={this.props.navigation}
                        customLeftComponent={true}
                        centerComponentStyle={{ fontSize: 18 }}
                    />
                </View>
                <View style={styles.container}>

                    <View style={{ marginBottom: 10 }}>
                        <Text style={styles.mainText}>Select the stablecoin you would like to {loanRequestType.toLowerCase()}.</Text>
                        {/* <Text style={styles.secondaryText}>Get liquidity witout selling your assets</Text> */}
                    </View>

                    <TouchableOpacity onPress={() => this.handleSelectAssetBtn('DAI')} style={styles.btnContainer}>
                        <View style={{ width: '100%', flexDirection: 'row' }}>
                            <View style={{ flex: 8, justifyContent: 'center' }}>
                                <Text style={{ ...styles.btnTitle }}>DAI</Text>
                                <Text style={styles.btnSubtitle}>
                                    {
                                        loanRequestType === 'BORROW'
                                            ? 'Borrow DAI on Ethereum\s blockchain using ONE as collateral'
                                            : 'Lend DAI on Ethereum\'s blockchain to earn interest'
                                    }
                                </Text>
                            </View>
                            <View style={{ flex: 2, backgroundColor: 'transparent', justifyContent: 'center' }}>
                                <Image source={require('../../../assets/images/dai_logo.png')} style={{ height: 60, resizeMode: 'contain' }} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.handleSelectAssetBtn('BUSD')} style={styles.btnContainer}>
                        <View style={{ width: '100%', flexDirection: 'row', }}>
                            <View style={{ flex: 8, justifyContent: 'center' }}>
                                <Text style={{ ...styles.btnTitle }}>BUSD</Text>
                                <Text style={styles.btnSubtitle}>
                                    {
                                        loanRequestType === 'BORROW'
                                            ? 'Borrow BUSD on Ethereum\s blockchain using ONE as collateral'
                                            : 'Lend BUSD on Ethereum\'s blockchain to earn interest'
                                    }
                                </Text>
                            </View>
                            <View style={{ flex: 2, backgroundColor: 'transparent', justifyContent: 'center' }}>
                                <Image source={require('../../../assets/images/busd_logo.png')} style={{ height: 60, resizeMode: 'contain' }} />
                            </View>
                        </View>
                    </TouchableOpacity>

                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        // height: HEIGHT,
        paddingHorizontal: 20,
        paddingVertical: 0,
    },
    btnContainer: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 0,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 5,
        height: 90,
        marginTop: 5,
        // borderColor: '#D6D6D6',
        // borderWidth: 1,
        elevation: 2,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 0 },
        // shadowOpacity: 0.1,
        // shadowRadius: 5,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.5,
        // shadowRadius: 1,
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
        color: 'black',
        fontSize: 24,
        lineHeight: 26
    },
    btnSubtitle: {
        fontFamily: 'Poppins-Regular',
        color: 'black',
        fontSize: 12,
        lineHeight: 14,
        textAlign: 'left',
        paddingRight: 5
    },
    mainText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        marginTop: 20
    },
    secondaryText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        // marginBottom: 10
    }

})

function mapStateToProps({ loanRequest }) {
    return {
        loanRequest
    }
}

export default connect(mapStateToProps)(SelectAssetView)