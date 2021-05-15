import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    SafeAreaView, View, Text, StyleSheet, Alert,
    StatusBar, FlatList, TouchableOpacity, Image

} from 'react-native'

// Components
import Header from '../components/Header'
import SelectAssetListItem from '../components/SelectAssetListItem'

// Libraries
import currencyFormatter from 'currency-formatter'
import BigNumber from 'bignumber.js'
import { ASSETS } from '../../crypto/index'

// Actions
import { setSelectedAsset, setSelectedToken } from '../../actions/shared'

// API
import { API } from "@env"

class ContactSelectAssetView extends Component {

    state = {
        contactId: '',
        blockchain: ''
    }

    componentDidMount() {
        const { route } = this.props
        const { blockchain, contactId } = route.params
        this.setState({ contactId, blockchain })
    }

    handleBlockchainBtn = async () => {
        const { contactId, blockchain } = this.state
        const { contacts, navigation, dispatch } = this.props
        const address = contacts[contactId]?.address
        dispatch(setSelectedAsset(blockchain))
        if (blockchain === 'ONE') navigation.push('SendONE', { address })
        else if (blockchain === 'ETH' || blockchain === 'BNB') navigation.push('Send', { address })
    }

    handleTokenBtn = async (contractAddress) => {
        const { contactId, blockchain } = this.state
        const { contacts, navigation, dispatch } = this.props
        const address = contacts[contactId]?.address
        dispatch(setSelectedAsset(blockchain))
        dispatch(setSelectedToken(contractAddress))
        navigation.push('SendToken', { address })
    }

    render() {

        const { navigation, tokens, balances, publicKeys } = this.props
        const { blockchain } = this.state
        const tokensList = tokens
            ? Object.values(tokens).filter(t => t?.chainType === blockchain && BigNumber(t?.balance).gt(0)).sort((a, b) => a.name.localeCompare(b.name))
            : []

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor='black' barStyle='light-content' />

                <View style={styles.headerContainer}>
                    <Header
                        title='Select Asset'
                        navigation={navigation}
                        customLeftComponent={true}
                    />
                </View>

                <View style={styles.container}>
                    <SelectAssetListItem
                        item={{
                            name: ASSETS[blockchain]?.name,
                            symbol: blockchain,
                            balance: balances[publicKeys[blockchain]]?.total_balance
                        }}
                        onPress={() => this.handleBlockchainBtn()}
                    />

                    <FlatList
                        data={tokensList}
                        renderItem={({ item, index }) => {
                            return (
                                <SelectAssetListItem
                                    key={index}
                                    item={item}
                                    onPress={() => this.handleTokenBtn(item?.contractAddress)}
                                />
                            )
                        }}
                    />
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white'
    },
    headerContainer: {
        paddingTop: 20,
        backgroundColor: 'white'
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginTop: 20
    },
})

function mapStateToProps({ tokens, balances, wallet, contacts }) {
    return {
        tokens,
        balances,
        publicKeys: wallet?.publicKeys,
        contacts
    }
}

export default connect(mapStateToProps)(ContactSelectAssetView)