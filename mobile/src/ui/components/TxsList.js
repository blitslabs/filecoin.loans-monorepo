import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'

// Libraries
import moment from 'moment'
import currencyFormatter from 'currency-formatter'
import BigNumber from 'bignumber.js'

// Icons
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'

// SVG
import OutgoingIcon from '../../../assets/images/outgoing_icon.svg'
import IncomingIcon from '../../../assets/images/incoming_icon.svg'

const WIDTH = Dimensions.get('window').width


class TxsList extends Component {


    render() {
        const { publicKeys, txs, shared, prices, navigation } = this.props
        const { selectedAsset } = shared
        const address = publicKeys[selectedAsset]
        const assetTxs = txs && txs[address] !== undefined ? Object.values(txs[address]) : []

        if (!assetTxs || assetTxs.length === 0) {
            return (
                <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ opacity: 0.4 }}>No transactions found</Text>
                </View>
            )
        }

        return (
            <FlatList
                contentContainerStyle={{ paddingLeft: WIDTH * 0.018 }}
                data={assetTxs.reverse()}
                renderItem={({ item, index }) => {
                    const assetPrice = prices[item?.metadata?.symbol] !== undefined ? prices[item?.metadata?.symbol][shared?.currency?.toLowerCase()] : 0
                    const txValue = BigNumber(assetPrice).multipliedBy(item.metadata?.value).toString()
                  
                    return (
                        <TouchableOpacity
                            onPress={() => navigation.push('TxDetails', { txHash: item?.txHash })}
                        >
                            <View style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', borderWidth: 0 }}>
                                <View style={{ flex: 1.5, alignItems: 'flex-start', justifyContent: 'center', backgroundColor: 'transparent' }}>
                                    {/* <View style={item.direction === 'outgoing' ? styles.sentCircleBg : styles.receivedCircleBg}>
                                    <IconMaterialCommunity name={item.direction === 'outgoing' ? 'call-made' : 'call-received'} size={20} color="white" />
                                </View> */}
                                    <View style={selectedAsset === 'ONE' ? styles.iconContainer : styles.iconContainerBlack}>
                                        {
                                            item.direction === 'outgoing'
                                                ? <OutgoingIcon height={40} width={40} />
                                                : <IncomingIcon height={40} width={40} />
                                        }
                                    </View>
                                </View>
                                <View style={{ flex: 6.5, paddingLeft: 10, }}>
                                    <Text style={{ ...styles.label, backgroundColor: 'transparent', marginBottom: -5 }}>{item.direction === 'outgoing' ? 'Sent' : item.direction === 'incoming' ? 'Received' : item.direction}</Text>
                                    <Text style={styles.labelBold}>{item.direction === 'outgoing' ? '-' : '+'}{parseFloat(item.metadata?.value)} {item.metadata?.symbol}</Text>
                                </View>
                                <View style={{ flex: 4, alignItems: 'flex-end' }}>
                                    <Text style={{ ...styles.textSm, marginBottom: 0, backgroundColor: 'transparent' }}>{moment.unix(item.date).format('DD / MMM / YY')}</Text>
                                    <Text style={styles.textSm}>{currencyFormatter.format(txValue, { code: 'USD' })}</Text>
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
    receivedCircleBg: {
        borderRadius: 100,
        padding: 8,
        backgroundColor: '#3ACCDC'
    },
    sentCircleBg: {
        borderRadius: 100,
        padding: 8,
        backgroundColor: '#D40399',
    },
    iconContainer: {
        borderRadius: 10,
        backgroundColor: 'white',
        padding: 0
    },
    iconContainerBlack: {
        borderRadius: 10,
        backgroundColor: 'black',
        padding: 0
    }
})

function mapStateToProps({ wallet, shared, balances, txs, prices }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        balances,
        txs,
        prices
    }
}

export default connect(mapStateToProps)(TxsList)