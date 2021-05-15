import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native'

// Libraries
import moment from 'moment'
import currencyFormatter from 'currency-formatter'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntIcons from 'react-native-vector-icons/AntDesign'

// Actions
import { setSelectedLoan, setLoanDetailsOp } from '../../actions/shared'

const WIDTH = Dimensions.get('window').width


class LoansList extends Component {

    handleLoanBtn = (loanId, operation) => {
        console.log('SELECT_LOAN_BTN')
        const { navigation, dispatch } = this.props
        dispatch(setSelectedLoan(loanId))
        dispatch(setLoanDetailsOp(operation))
        navigation.navigate('LoanDetails')
    }

    render() {
        const { publicKeys, tokens, shared, prices, loans, list } = this.props
        let data
        if (list === 'BORROW') {
            data = Object.values(loans).filter((l, i) => l.borrower === publicKeys.ETH)
        } else if (list === 'LEND') {
            data = Object.values(loans).filter((l, i) => l.lender === publicKeys.ETH)
        }

        if (data.length === 0) {
            return (
                <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ opacity: 0.4 }}>No loans found</Text>
                </View>
            )
        }


        return (
            <FlatList
                contentContainerStyle={{ width: WIDTH - 20 }}
                data={data}
                renderItem={({ item, index }) => {
                    const status = item.status == 0 ? 'Open' : item.status == 1 ? 'Funded' : item.status == 2 ? 'Approved' : item.status == 3 ? 'Withdrawn' : item.status == 4 ? 'Repaid' : item.status == 5 ? 'Payack Refunded' : item.status == 6 ? 'Closed' : 'Canceled'
                    return (
                        <TouchableOpacity onPress={() => this.handleLoanBtn(item.id, list)}>
                            <View style={{ paddingVertical: 15, backgroundColor: 'white', borderBottomColor: 'grey', borderBottomWidth: StyleSheet.hairlineWidth }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                    <View style={{ flex: 1.5, alignItems: 'flex-start', justifyContent: 'center', backgroundColor: 'transparent' }}>
                                        <View style={styles.receivedCircleBg}>
                                            <Ionicons name={'triangle'} size={20} color="#5ef3b9" />
                                        </View>
                                    </View>
                                    <View style={{ flex: 3, paddingLeft: 10, }}>
                                        <Text style={{ ...styles.label, backgroundColor: 'transparent', marginBottom: -5 }}>ID </Text>
                                        <Text style={styles.labelBold}>{item.blockchainLoanId}</Text>
                                    </View>
                                    <View style={{ flex: 3, }}>
                                        <Text style={{ ...styles.label, backgroundColor: 'transparent', marginBottom: -5 }}>Principal </Text>
                                        <Text style={styles.labelBold}>{item.principal} {item.tokenSymbol}</Text>
                                    </View>
                                    <View style={{ flex: 3, }}>
                                        <Text style={{ ...styles.label, backgroundColor: 'transparent', marginBottom: -5 }}>Interest </Text>
                                        <Text style={styles.labelBold}>{parseFloat(item.interest).toFixed(2)} {item.tokenSymbol}</Text>
                                        {/* <Text style={styles.textSm}>{currencyFormatter.format(parseFloat(assetPrice) * parseFloat(item.amount), { code: 'USD'})}</Text> */}
                                    </View>
                                    <View style={{ flex: 1.5, alignItems: 'flex-start', justifyContent: 'center', backgroundColor: 'transparent' }}>
                                        <AntIcons name={'right'} size={20} color="grey" />
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                    <View style={{ flex: 1.5, alignItems: 'flex-start', justifyContent: 'center', backgroundColor: 'transparent' }}>

                                    </View>
                                    <View style={{ flex: 3, paddingLeft: 10, }}>
                                        <Text style={{ ...styles.label, backgroundColor: 'transparent', marginBottom: -5 }}>Blockchain </Text>
                                        <Text style={styles.labelBold}>{item.blockchain}</Text>
                                    </View>
                                    <View style={{ flex: 3, }}>
                                        <Text style={{ ...styles.label, backgroundColor: 'transparent', marginBottom: -5 }}>Due Date </Text>
                                        <Text style={styles.labelBold}>{item.loanExpiration != 0 ? moment.unix(item.loanExpiration).format('MMM DD, YYYY') : '-'}</Text>
                                    </View>
                                    <View style={{ flex: 3, }}>
                                        <Text style={{ ...styles.label, backgroundColor: 'transparent', marginBottom: -5 }}>Status</Text>
                                        <Text style={styles.labelBold}>{item?.loadingStatus != 1 ? status : 'Loading...'}</Text>
                                        {/* <Text style={styles.textSm}>{currencyFormatter.format(parseFloat(assetPrice) * parseFloat(item.amount), { code: 'USD'})}</Text> */}
                                    </View>
                                    <View style={{ flex: 1.5, alignItems: 'flex-start', justifyContent: 'center', backgroundColor: 'transparent' }}></View>
                                    
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
        backgroundColor: '#212e5f'
    },
    sentCircleBg: {
        borderRadius: 100,
        padding: 8,
        backgroundColor: '#D40399',
    }
})

function mapStateToProps({ wallet, loans, shared, prices, tokens }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        loans,
        shared,
        tokens,
        prices
    }
}

export default connect(mapStateToProps)(LoansList)