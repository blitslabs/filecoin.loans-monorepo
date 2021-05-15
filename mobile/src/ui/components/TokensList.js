import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native'

// Libraries
import moment from 'moment'
import currencyFormatter from 'currency-formatter'
import BigNumber from 'bignumber.js'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'

const WIDTH = Dimensions.get('window').width

// Actions
import { setSelectedToken } from '../../actions/shared'

import { API } from "@env"

class TokensList extends Component {

    handleTokenBtn = (contractAddress) => {
        const { navigation, dispatch } = this.props
        dispatch(setSelectedToken(contractAddress))
        navigation.navigate('TokenDetails')
    }

    render() {
        const { publicKeys, tokens, shared, prices } = this.props
        const { selectedAsset } = shared
        const address = publicKeys[selectedAsset]
        const tokensList = tokens ? Object.values(tokens) : []
        // const assetPrice = prices[selectedAsset] !== undefined ?  prices[selectedAsset].usd : 0        

        if (!tokensList || tokensList.length === 0) {
            return (
                <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ opacity: 0.4 }}>No tokens found</Text>
                </View>
            )
        }

        return (
            <FlatList
                contentContainerStyle={{ paddingLeft: WIDTH * 0.018 }}
                data={tokensList.sort((a, b) => a.name.localeCompare(b.name)).filter(t => t.chainType === selectedAsset)}
                renderItem={({ item, index }) => {
                    const assetPrice = prices[item?.symbol] !== undefined ? prices[item?.symbol][shared?.currency] : 0
                    const priceChange = prices[item?.symbol] !== undefined ? prices[item?.symbol].usd_24h_change : 0
                    const assetValue = BigNumber(item.balance).multipliedBy(assetPrice).toString()
                    
                    return (
                        <TouchableOpacity onPress={() => this.handleTokenBtn(item.contractAddress)}>
                            <View style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 0 }}>
                                <View style={{ flex: 1.5, alignItems: 'flex-start', justifyContent: 'center', backgroundColor: 'transparent' }}>
                                    <View style={styles.imgCircleBg}>
                                        <Image
                                            source={{ uri: API + '/static/logo/' + item?.symbol }}
                                            style={{ height: 38, width: 38 }}
                                        />
                                        {/* <Ionicons name={'cube-outline'} size={20} color="#5ef3b9" /> */}
                                    </View>
                                </View>
                                <View style={{ flex: 6.5, paddingLeft: 10, }}>
                                    <Text style={{ ...styles.label, backgroundColor: 'transparent', marginBottom: -5 }}>{item.name}</Text>
                                    <Text style={styles.labelBold}>{currencyFormatter.format(item.balance?.toString(), { code: 'USD' }).replace('$', '')} {item.symbol}</Text>
                                </View>
                                <View style={{ flex: 4, alignItems: 'flex-end' }}>
                                    {/* <Text style={{ ...styles.textSm, marginBottom: 0, backgroundColor: 'transparent' }}>{moment.unix(item.timestamp).format('DD / MMM / YY')}</Text> */}
                                    <Text style={styles.priceText}>{currencyFormatter.format(assetValue, { code: 'USD' })}</Text>
                                    <View style={parseFloat(priceChange) > 0 ? styles.priceContainerUp : styles.priceContainerDown}>
                                        <Text style={styles.priceChangeText}>{parseFloat(priceChange).toFixed(2)}%</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                }}
                keyExtractor={(item, index) => index.toString()}
            />
        )
    }
}

const styles = StyleSheet.create({
    label: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    labelBold: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14
    },
    textSm: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10
    },
    imgCircleBg: {
        borderRadius: 100,
        padding: 1,
        backgroundColor: 'transparent'
    },
    sentCircleBg: {
        borderRadius: 100,
        padding: 8,
        backgroundColor: '#D40399',
    },
    priceText: {
        fontFamily:'Poppins-Regular',
        fontSize: 12
    },
    priceContainerUp: {
        backgroundColor: '#32CCDD',
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 3
    },
    priceContainerDown: {
        backgroundColor: '#bf26ff',
        paddingHorizontal: 3,
        paddingVertical: 1,
        borderRadius: 3
    },
    priceChangeText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 8,
        color: 'white'
    }
})

function mapStateToProps({ wallet, shared, tokens, prices }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        tokens,
        prices
    }
}

export default connect(mapStateToProps)(TokensList)