import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, SafeAreaView,
    StatusBar, StyleSheet, Keyboard, TouchableOpacity, Fragment,
    Linking
} from 'react-native'

// Components
import Header from '../components/Header'
import { TabView, TabBar } from 'react-native-tab-view'
import TokenDetailsTabs from '../components/TokenDetailsTabs'
import { List } from 'react-native-paper'

const HEIGHT = Dimensions.get('window').height

// Components
import Loading from '../components/Loading'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import moment from 'moment'
import currencyFormatter from 'currency-formatter'
import { ASSETS } from '../../crypto/index'

// Actions
import { setSelectedAsset } from '../../actions/shared'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'
import PrimaryBtn from '../components/PrimaryBtn'
import BlitsBtn from '../components/BlitsBtn'

//
import { API } from "@env"
import { ScrollView } from 'react-native-gesture-handler'


class TxDetailsView extends Component {

    cardStackRef = React.createRef()

    state = {
        txHash: '',
        loading: true
    }

    componentDidMount() {
        SplashScreen.hide()
        Keyboard.dismiss()
        const { route } = this.props
        const { txHash } = route.params
        this.setState({ txHash, loading: false })
    }

    handleExplorerBtn = async (txHash) => {
        const { shared } = this.props
        const url = `${ASSETS[shared.selectedAsset].explorer_url}${txHash}`
        await Linking.openURL(url)
    }

    render() {
        const { loading } = this.state
        const { shared, tokens, txs, route, publicKeys } = this.props
        const { selectedAsset } = shared
        const account = publicKeys[selectedAsset]
        const { txHash } = route.params
        const tx = txs[account][txHash]

        if (loading) {
            return <Loading />
        }

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <View style={{ paddingTop: 20, backgroundColor: 'white' }}>
                    <Header
                        title={'Transaction'}
                        navigation={this.props.navigation}
                        customLeftComponent={true}
                        centerComponentStyle={{ fontSize: 18 }}
                        rightComponentTitle={'Explorer'}
                        onRightComponentPress={() => this.handleExplorerBtn(tx?.txHash)}
                    />
                </View>
                <View style={styles.container}>
                    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
                        <List.Item
                            title="Tx Hash"
                            description={tx?.txHash}
                            style={styles.listItem}
                            titleStyle={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}
                            descriptionStyle={styles.descriptionStyle}
                        />
                        <List.Item
                            title="Direction"
                            description={tx?.direction}
                            style={styles.listItem}
                            titleStyle={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}
                            descriptionStyle={styles.descriptionStyle}
                        />
                        <List.Item
                            title="From"
                            description={tx?.from}
                            style={styles.listItem}
                            titleStyle={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}
                            descriptionStyle={styles.descriptionStyle}
                        />
                        <List.Item
                            title="To"
                            description={'to' in tx && tx.to ? tx.to : '-'}
                            style={styles.listItem}
                            titleStyle={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}
                            descriptionStyle={styles.descriptionStyle}
                        />
                        <List.Item
                            title="Amount"
                            description={tx?.metadata?.value}
                            style={styles.listItem}
                            titleStyle={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}
                            descriptionStyle={styles.descriptionStyle}
                        />
                        <List.Item
                            title="Asset"
                            description={tx?.metadata?.symbol}
                            style={styles.listItem}
                            titleStyle={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}
                            descriptionStyle={styles.descriptionStyle}
                        />
                        <List.Item
                            title="Fee"
                            description={tx?.fee}
                            style={styles.listItem}
                            titleStyle={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}
                            descriptionStyle={styles.descriptionStyle}
                        />
                        <List.Item
                            title="Type"
                            description={tx?.type}
                            style={styles.listItem}
                            titleStyle={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}
                            descriptionStyle={styles.descriptionStyle}
                        />
                        <List.Item
                            title="Date"
                            description={moment.unix(tx?.date).format('DD/MMM/YY HH:mm:ss')}
                            style={styles.listItem}
                            titleStyle={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}
                            descriptionStyle={styles.descriptionStyle}
                        />
                        <List.Item
                            title="Status"
                            description={tx?.status}
                            style={styles.listItem}
                            titleStyle={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}
                            descriptionStyle={styles.descriptionStyle}
                        />
                    </ScrollView>
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
    },
    detailsTitle: {
        fontFamily: 'Poppins-Regular',
        marginTop: 5,
    },
    detailsValue: {
        fontFamily: 'Poppins-SemiBold'
    },
    listItem: {
        paddingLeft: 0,
        paddingBottom: 0,
        paddingRight: 0,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderColor: 'whitesmoke'
    },
    descriptionStyle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 12,
        color: 'black'
    }
})

function mapStateToProps({ shared, tokens, txs, wallet }) {
    return {
        shared,
        tokens,
        txs,
        publicKeys: wallet?.publicKeys
    }
}

export default connect(mapStateToProps)(TxDetailsView)