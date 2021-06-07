import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar,
    StyleSheet, Keyboard, TouchableOpacity, Platform, Alert
} from 'react-native'

// Components
import Header from '../../components/Header'
import { Divider } from 'react-native-paper'
import { TabView, TabBar } from 'react-native-tab-view'

// Libraries
import SplashScreen from 'react-native-splash-screen'

// Actions
import { saveFLProtocolContracts, saveFLLoanAssets } from '../../../actions/filecoinLoans'

// API
import { getLoanAssets, getProtocolContracts } from '../../../utils/filecoin_loans'


import { ETH_CHAIN_NAME } from "@env"

const WIDTH = Dimensions.get('window').width

class FLIntroView extends Component {

    cardStackRef = React.createRef()

    state = {
        lendFILModalIsVisible: false,
        index: 0,
        routes: [
            { key: 'first', title: 'FIL/ERC20 Market' },
            { key: 'second', title: 'ERC20/FIL Market' },
        ],
    }

    componentDidMount() {
        SplashScreen.hide()
        Keyboard.dismiss()
        const { dispatch } = this.props

        const network = ETH_CHAIN_NAME === 'mainnet' ? 'mainnet' : 'testnet'

        getLoanAssets({ networkId: '97' }) // todo: change this in production
            .then(data => data.json())
            .then((res) => {
                console.log(res)
                if (res.status === 'OK') dispatch(saveFLLoanAssets(res.payload))
            })

        getProtocolContracts()
            .then(data => data.json())
            .then((res) => {
                console.log(res)
                if (res.status === 'OK') dispatch(saveFLProtocolContracts(res.payload))
            })

        // Update Blockchain Address
        // const keys = {
        //     publicKey: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        //     privateKey: '5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'
        // }
        // dispatch(updateBlockchainWallet(keys, 'BNB'))
    }

    handleMyLoansBtn = () => {
        console.log('MY_LOANS_BTN')
        const { navigation } = this.props
        navigation.navigate('FLMyLoans',)
    }

    renderLabel = (props) => {
        const { shared } = this.props
        if (props.route.title === "FIL/ERC20 Market") {
            return <View style={{ borderBottomWidth: props.focused ? 2 : 0 }}>
                <Text
                    textBreakStrategy='simple'
                    style={props.focused ? styles.tabLabelSelected : styles.tabLabel}>FIL/ERC20 Market</Text>
            </View>
        }


        if (props.route.title === "ERC20/FIL Market") {
            return <View style={{ borderBottomWidth: props.focused ? 2 : 0 }}>
                <Text
                    textBreakStrategy='simple'
                    style={props.focused ? styles.tabLabelSelected : styles.tabLabel}>ERC20/FIL Market</Text>
            </View>
        }
    }

    renderScene = ({ route }) => {
        switch (route.key) {
            case 'first':
                return (
                    <View>
                        <View style={{}}>
                            <Text style={styles.mainText}>FIL / ERC20 Market</Text>
                            <Text style={styles.secondaryText}>FIL Loans with ERC20 tokens as collateral.</Text>
                        </View>

                        <TouchableOpacity onPress={() => this.props.navigation.navigate('BorrowFIL')} style={styles.btnContainer}>
                            <View style={{ width: '100%' }}>
                                <Text style={styles.btnTitle}>Borrow FIL</Text>
                                <Text style={styles.btnSubtitle}>Deposit Harmony (ONE) as collateral and borrow stablecoins on Ethereum's blockchain</Text>
                            </View>
                            <Image source={require('../../../../assets/images/bg1.jpg')} style={styles.btnBgImg} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.props.navigation.navigate('BorrowFILRequests')} style={styles.btnContainer}>
                            <View style={{ width: '100%' }}>
                                <Text style={styles.btnTitle}>Lend FIL</Text>
                                <Text style={styles.btnSubtitle}>Deposit stablecoins on Ethereum's blockchain to earn interest.</Text>
                            </View>
                            <Image source={require('../../../../assets/images/bg2.png')} style={styles.btnBgImg} />
                        </TouchableOpacity>
                    </View>
                );
            case 'second':
                return (
                    <View>
                        <View style={{}}>
                            <Text style={styles.mainText}>ERC20 / FIL Market</Text>
                            <Text style={styles.secondaryText}>ERC20 loans with FIL as collateral.</Text>
                        </View>

                        <TouchableOpacity onPress={() => this.props.navigation.navigate('LendERC20Offers')} style={styles.btnContainer}>
                            <View style={{ width: '100%' }}>
                                <Text style={styles.btnTitle}>Borrow Stablecoins</Text>
                                <Text style={styles.btnSubtitle}>Deposit Harmony (ONE) as collateral and borrow stablecoins on Ethereum's blockchain</Text>
                            </View>
                            <Image source={require('../../../../assets/images/bg1.jpg')} style={styles.btnBgImg} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.props.navigation.navigate('LendERC20')} style={styles.btnContainer}>
                            <View style={{ width: '100%' }}>
                                <Text style={styles.btnTitle}>Lend Stablecoins</Text>
                                <Text style={styles.btnSubtitle}>Deposit stablecoins on Ethereum's blockchain to earn interest.</Text>
                            </View>
                            <Image source={require('../../../../assets/images/bg2.png')} style={styles.btnBgImg} />
                        </TouchableOpacity>
                    </View>
                );

        }
    }

    setIndex = (value) => {
        const { shared, publicKeys, wallet, nftCollections, dispatch } = this.props
        const { selectedAsset } = shared
        const account = publicKeys[selectedAsset]


        this.setState({ index: value });
    }


    renderTabBar = props => {
        return (
            <TabBar
                {...props}
                renderLabel={this.renderLabel}
                indicatorStyle={{ backgroundColor: 'transparent' }}
                style={{ backgroundColor: 'transparent', marginTop: 10 }}
            // tabStyle={{
            //     minHeight: 30,
            //     padding: 0,
            //     width: 'auto',
            //     marginHorizontal: 6.5,
            // }}
            />
        )
    }

    render() {

        const { lendFILModalIsVisible } = this.state
        const { shared, } = this.props
        const { selectedAsset } = shared

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <Header
                    navigation={this.props.navigation}
                    title="Filecoin Loans"
                    centerComponentStyle={{ fontSize: 18, }}
                    customLeftComponent={true}
                    rightComponentTitle="My Loans"
                    onRightComponentPress={this.handleMyLoansBtn}
                />
                <View style={{ backgroundColor: 'transparent', flex: 1, paddingHorizontal: 20 }}>


                    <TabView
                        style={{ backgroundColor: 'white' }}
                        swipeEnabled={false}
                        renderTabBar={this.renderTabBar}
                        navigationState={{ index: this.state.index, routes: this.state.routes }}
                        renderScene={this.renderScene}
                        onIndexChange={this.setIndex}
                        initialLayout={{ width: WIDTH }}
                        lazy={true}
                    />



                    <Divider style={{ marginTop: 20 }} />



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
        width: Dimensions.get('window').width - 40,
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
    tabLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: "#000",
        // fontWeight: 'bold'
    },
    tabLabelSelected: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: "#000",
        fontWeight: 'bold'
    }

})

function mapStateToProps({ wallet, shared }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
    }
}

export default connect(mapStateToProps)(FLIntroView)