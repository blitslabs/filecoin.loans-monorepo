import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar, StyleSheet, Keyboard, TouchableOpacity } from 'react-native'

// Components
import Header from '../components/Header'
import { TabView, TabBar } from 'react-native-tab-view'
import TokenDetailsTabs from '../components/TokenDetailsTabs'

const HEIGHT = Dimensions.get('window').height

// Libraries
import SplashScreen from 'react-native-splash-screen'
import moment from 'moment'
import currencyFormatter from 'currency-formatter'

// Actions
import { setSelectedAsset } from '../../actions/shared'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'
import PrimaryBtn from '../components/PrimaryBtn'
import BlitsBtn from '../components/BlitsBtn'

//
import { API } from "@env"
const ASSETS = ['ONE', 'ETH', 'BTC']

class TokenDetailsView extends Component {

    cardStackRef = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        Keyboard.dismiss()
        const { dispatch } = this.props       
    }

    handleSendBtn = () => {
        console.log('SEND_BTN')
        const { navigation } = this.props
        navigation.navigate('SendToken')
    }

    handleReceiveBtn = () => {
        console.log('RECEIVE_BTN')
        const { navigation } = this.props
        navigation.navigate('Receive')
    }

    render() {

        const { shared, tokens } = this.props
        const { selectedToken } = shared
        const token = tokens[selectedToken]

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <View style={{ paddingTop: 20, backgroundColor: 'white' }}>
                    <Header
                        title={token.name}
                        navigation={this.props.navigation}
                        customLeftComponent={true}
                        centerComponentStyle={{ fontSize: 18 }}
                    />
                </View>
                <View style={styles.container}>
                    <View style={styles.tokenCardContainer}>
                        <View style={{ flex: 1.5, alignItems: 'flex-start', justifyContent: 'center', backgroundColor: 'transparent' }}>
                            <View style={styles.tokenCircleBg}>
                                <Image
                                    source={{ uri: API + '/static/logo/' + token?.symbol }}
                                    style={{ height: 38, width: 38 }}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 6.5, paddingLeft: 10, }}>
                            <Text style={{ ...styles.label, backgroundColor: 'transparent', marginBottom: -5 }}>{token.name}</Text>
                            <Text style={styles.labelBold}>{currencyFormatter.format(token.balance, { code: 'USD' }).replace('$', '')} {token.symbol}</Text>
                        </View>
                        <View style={{ flex: 4, alignItems: 'flex-end' }}>
                            {/* <Text style={{ ...styles.textSm, marginBottom: 0, backgroundColor: 'transparent' }}>{moment.unix(item.timestamp).format('DD / MMM / YY')}</Text> */}
                            {/* <Text style={styles.textSm}>{currencyFormatter.format(parseFloat(assetPrice) * parseFloat(item.amount), { code: 'USD'})}</Text> */}
                        </View>
                    </View>
                    <View style={{ flex: 1, marginTop: 10, marginBottom: 80 }}>
                        <TokenDetailsTabs />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 10, left: 20, right: 20 }}>
                        <View style={{ flex: 1, paddingRight: 5 }}>
                            <BlitsBtn title="Send" onPress={this.handleSendBtn} />
                        </View>
                        <View style={{ flex: 1, paddingLeft: 5 }}>
                            <PrimaryBtn title="Receive" onPress={this.handleReceiveBtn} />
                        </View>
                    </View>
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
    tokenCircleBg: {
        borderRadius: 100,
        padding: 1,
        backgroundColor: 'transparent'
    },
    label: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    labelBold: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14
    },
    tokenCardContainer: {
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 0,
        borderColor: '#E9E9E9',
        borderBottomWidth: 1,
        marginTop: 10
    }
})

function mapStateToProps({ shared, tokens }) {
    return {
        shared,
        tokens,       
    }
}

export default connect(mapStateToProps)(TokenDetailsView)