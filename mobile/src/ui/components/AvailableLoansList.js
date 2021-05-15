import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native'

// Libraries
import moment from 'moment'
import currencyFormatter from 'currency-formatter'
import BigNumber from 'bignumber.js'


// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntIcons from 'react-native-vector-icons/AntDesign'

const WIDTH = Dimensions.get('window').width

// Actions
import { setSelectedLoan } from '../../actions/shared'


class AvailableLoansList extends Component {

    handleLoanBtn = (loanId) => {
        const { navigation, dispatch } = this.props
        dispatch(setSelectedLoan(loanId))
        navigation.navigate('Borrow')
    }

    render() {
        const { availableLoans, prices } = this.props
        

        if (Object.values(availableLoans).length === 0) {
            return (
                <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ opacity: 0.4 }}>No loans found</Text>
                </View>
            )
        }


        return (
            <FlatList
                contentContainerStyle={{ width: WIDTH - 20 }}
                data={Object.values(availableLoans)}
                renderItem={({ item, index }) => {
                    const apr = parseFloat(BigNumber(item.interest).times(100).div(item.principal).times(12)).toFixed(2)
                    const onePrice = BigNumber(prices.ONE.priceBTC).times(prices.BTC.usd)
                    const requiredCollateral = parseFloat(BigNumber(item.principal).div(onePrice).times(1.5)).toFixed(2)
                    return (
                        <TouchableOpacity onPress={() => this.handleLoanBtn(item.id)}>
                            <View style={styles.card_container}>
                                <View style={{ marginBottom: 10, flexDirection: 'row' }}>
                                    <View>
                                        <Ionicons name={'triangle'} size={20} color="#32ccdd" />
                                    </View>
                                    <View style={{marginLeft: 10}}>
                                        <Text style={styles.card_title}>{item.tokenName} ({item.tokenSymbol})</Text>
                                    </View>
                                </View>

                                <View style={styles.details_row}>
                                    <Text style={styles.label}>Principal</Text>
                                    <Text style={styles.label_data}>{item.principal} {item.tokenSymbol}</Text>
                                </View>
                                <View style={styles.details_row}>
                                    <Text style={styles.label}>Interest</Text>
                                    <Text style={styles.label_data}>{parseFloat(item.interest).toFixed(8)} {item.tokenSymbol}</Text>
                                </View>
                                <View style={styles.details_row}>
                                    <Text style={styles.label}>APR</Text>
                                    <Text style={styles.label_data}>{apr.toString()}%</Text>
                                </View>
                                <View style={styles.details_row}>
                                    <Text style={styles.label}>Duration</Text>
                                    <Text style={styles.label_data}>30 days</Text>
                                </View>
                                <View style={styles.details_row}>
                                    <Text style={styles.label}>Blockchain</Text>
                                    <Text style={styles.label_data}>Ethereum</Text>
                                </View>
                                <View style={[styles.details_row, { marginTop: 5, borderTopColor: 'grey', borderTopWidth: 0.3, paddingTop: 10, }]}>
                                    <Text style={[styles.label, {color: '#32ccdd', fontFamily: 'Poppins-SemiBold'}]}>Required Collateral</Text>
                                    <Text style={[styles.label_data, { color: '#32ccdd', fontFamily: 'Poppins-SemiBold'}]}>{currencyFormatter.format(requiredCollateral, { code: 'USD' }).replace('$','')} ONE</Text>
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
    card_title: {
        fontFamily: 'Poppins-Regular',
        fontSize: 15,
        fontWeight: 'bold',
        color: 'black'
    },
    label: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        // fontWeight: 'bold',
        color: 'black'
    },
    label_data: {
        fontFamily: 'Poppins-Light',
        fontSize: 13,
        color: 'black'
    },
    labelBold: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14
    },
    textSm: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10
    },
    card_container: {
        padding: 10,
        justifyContent: 'center',
        borderColor: '#dcdada',
        borderWidth: 0.8,
        width: Dimensions.get('screen').width - 40,
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
        backgroundColor: '#fff',
        elevation: 0,
        marginBottom: 10

        // elevation: 2
        // backgroundColor: 'green'
    },
    details_row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // backgroundColor: 'yellow',

    }
})

function mapStateToProps({ wallet, loans, shared, prices, tokens, availableLoans }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        loans,
        shared,
        tokens,
        prices,
        availableLoans
    }
}

export default connect(mapStateToProps)(AvailableLoansList)