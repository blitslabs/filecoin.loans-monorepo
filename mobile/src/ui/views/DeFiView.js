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
import { List, Switch } from 'react-native-paper'

// Actions

// SVG
import FilecoinLogo from '../../../assets/images/filecoin-logo.svg'

class DeFiView extends Component {

    cardStackRef = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        Keyboard.dismiss()
        const { dispatch } = this.props


    }


    handleAppBtn = (view, appName, blockchain) => {
        const { navigation, dispatch } = this.props
        
        navigation.navigate(view)
    }

    render() {

        const { shared, } = this.props
        const { selectedAsset } = shared

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <Header
                    title="DeFi"
                    navigation={this.props.navigation}
                // rightComponentTitle="My Loans"
                // onRightComponentPress={this.handleMyLoansBtn}
                />
                <View style={{ backgroundColor: 'transparent', flex: 1, paddingHorizontal: 0 }}>


                   
                    <View style={{ paddingHorizontal: 20, marginBottom:0, borderColor: 'rgb(229, 229, 229)', borderBottomWidth: 0.5, marginBottom: 10 }}>
                        <Text style={styles.mainText}>Explore DeFi protocols on multiple blockchains</Text>
                        <Text style={styles.secondaryText}>Enter the future of finance {'&'} start investing without intermediaries.</Text>
                    </View>

                    {/* <List.Subheader style={{ marginBottom: 0, backgroundColor: '#f9f9f9', marginTop: 8 }}>Harmony</List.Subheader> */}


                    <TouchableOpacity onPress={() => this.handleAppBtn('FilecoinLoansIntro', 'FILECOIN_LOANS', 'FIL')} style={styles.btnContainer}>
                        <View style={{ flexDirection: 'row', paddingVertical: 20, paddingHorizontal: 10, }}>

                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 2 }}>
                                <FilecoinLogo height={48} width={48} color="white" />
                            </View>
                            <View style={{ paddingLeft: 0, flex: 10, paddingLeft: 10 }}>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', color: 'white' }}>Filecoin Loans</Text>
                                <Text style={{ fontFamily: 'Poppins-Light', fontSize: 12, flexWrap: 'wrap', color: 'white' }}>Lend {'&'} Borrow FIL with the first DeFi protocol on Filecoin.</Text>
                            </View>
                        </View>
                        <Image source={require('../../../assets/images/bg5.jpg')} style={styles.btnBgImg} />
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
        // paddingVertical: 15,
        paddingHorizontal: 20,
        // borderRadius: 25,
        marginBottom: Platform.OS === 'ios' ? 10 : 5,
        // borderColor: 'black',
        // borderWidth: 1,
        // position: 'absolute',
        // flex: 1,
    },
    btnBgImg: {
        resizeMode: 'cover',
        width: Dimensions.get('window').width - 30,
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
    },
    subtitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
    },
    subtitleContainer: {
        marginTop: 20,
        marginBottom: 10
    },
    appContainer: {
        maxWidth: '25%',
        justifyContent: 'center',
        alignItems: 'center',
        // height: 50,
        // width: 50
    },
    appIconContainer: {
        width: 70,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        paddingVertical: 10,
        // paddingHorizontal: 5,
        elevation: 10

    },
    appIcon: {
        width: 50,
        height: 50
    },
    appTitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    }

})

function mapStateToProps({ wallet, shared }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
    }
}

export default connect(mapStateToProps)(DeFiView)