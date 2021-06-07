import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar, StyleSheet, Keyboard, TouchableOpacity, Alert } from 'react-native'

// Components
import Header from '../../../components/Header'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import BigNumber from 'bignumber.js'

// Actions
import { saveOpenBorrowRequests } from '../../../../actions/filecoinLoans'

// API
import { getBorrowRequests } from '../../../../utils/filecoin_loans'


class BorrowFILRequestsView extends Component {

    cardStackRef = React.createRef()

    state = {
        filRequested: '',
        averageInterestRate: '',
        averagePrincipal: ''
    }

    componentDidMount() {
        SplashScreen.hide()
        Keyboard.dismiss()
        const { dispatch } = this.props

        getBorrowRequests()
            .then(data => data.json())
            .then((res) => {
                if (res?.status === 'OK') {
                    dispatch(saveOpenBorrowRequests(res?.payload))

                    let activeRequests = res?.payload?.length
                    let filRequested = BigNumber(0)
                    let averageInterestRateSum = BigNumber(0)
                    let averagePrincipalSum = BigNumber(0)

                    for (let r of res?.payload) {
                        filRequested = filRequested.plus(r?.principalAmount)
                        averageInterestRateSum = averageInterestRateSum.plus(r?.interestRate)
                        averagePrincipalSum = averagePrincipalSum.plus(r?.principalAmount)
                    }

                    let averageInterestRate = averageInterestRateSum.dividedBy(activeRequests).multipliedBy(100)
                    let averagePrincipal = averagePrincipalSum.dividedBy(activeRequests)

                    this.setState({
                        filRequested: filRequested.toString(),
                        averageInterestRate: averageInterestRate.toString(),
                        averagePrincipal: averagePrincipal.toString()
                    })
                }
            })

    }

    handleSelectAssetBtn(assetSymbol) {
        const { dispatch, navigation } = this.props
        dispatch(saveLoanRequest({ assetSymbol }))
        navigation.navigate('NewLoan')
    }

    render() {

        let { filRequested, averageInterestRate, averagePrincipal } = this.state
        const { filecoinLoans } = this.props

        averageInterestRate = !isNaN(averageInterestRate) ? averageInterestRate : '0'
        averagePrincipal = !isNaN(averagePrincipal) ? averagePrincipal : '0'

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <View style={{ paddingTop: 20 }}>
                    <Header
                        title="FIL Loan Book"
                        navigation={this.props.navigation}
                        customLeftComponent={true}
                        centerComponentStyle={{ fontSize: 18 }}
                        // headerStyle={{ backgroundColor: 'black', color: 'white' }}
                        centerComponentStyle={{ color: 'black' }}
                        leftIconColor={'black'}

                    />
                </View>
                <View style={styles.container}>

                    <View style={{ marginBottom: 10 }}>
                        <Text style={styles.mainText}>Select the borrow request you would like to fund.</Text>

                    </View>

                    {
                        filecoinLoans?.loanbook?.borrowRequests?.length > 0
                            ?
                            filecoinLoans?.loanbook?.borrowRequests?.map((o, i) => {
                                const loanDuration = parseInt((BigNumber(o?.loanExpirationPeriod).dividedBy(86400)).minus(3)).toString()
                                const interestAmount = parseFloat(BigNumber(o?.principalAmount).multipliedBy(o?.interestRate).dividedBy(365).multipliedBy(loanDuration)).toFixed(5)
                                const apr = parseFloat(BigNumber(o?.interestRate).multipliedBy(100)).toFixed(2)

                                return (
                                    <TouchableOpacity key={i} onPress={() => this.props.navigation.navigate('FILLoanDetails', { loanId: o?.id })} style={styles.btnContainer}>
                                        <View style={styles.cardHeader}>
                                            <View>
                                                <Text style={styles.cardTitle}>ID #{o?.id}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.cardTitle}>Collateral Locked</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.cardBody, { marginTop: 5 }]}>
                                            <View style={{ flex: 2 }}>
                                                <Text style={styles.cardDataTitle}>Amount</Text>
                                                <Text style={styles.cardDataValue}>{o?.principalAmount} FIL</Text>
                                            </View>
                                            <View style={{ flex: 2, }}>
                                                <Text style={styles.cardDataTitle}>Interest</Text>
                                                <Text style={styles.cardDataValue}>{interestAmount} FIL</Text>
                                            </View>
                                            <View style={{ flex: 1, }}>
                                                <Text style={styles.cardDataTitle}>APR</Text>
                                                <Text style={styles.cardDataValue}>{apr}%</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.cardBody, { marginBottom: 5 }]}>
                                            <View style={{ flex: 2 }}>
                                                <Text style={styles.cardDataTitle}>Collateral</Text>
                                                <Text style={styles.cardDataValue}>{o?.collateralAmount} DAI</Text>
                                            </View>
                                            <View style={{ flex: 2 }}>
                                                <Text style={styles.cardDataTitle}>Coll. Ratio</Text>
                                                <Text style={styles.cardDataValue}>150%</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.cardDataTitle}>Duration</Text>
                                                <Text style={styles.cardDataValue}>{loanDuration}d</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                            :
                            <View></View>
                    }

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
    container: {
        flex: 1,
        backgroundColor: 'white',
        // height: HEIGHT,
        marginHorizontal: 20,
        paddingVertical: 0,
    },
    btnContainer: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        // paddingVertical: 18,
        // paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 5,
        // height: 90,
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
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        marginTop: 20
    },
    secondaryText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        // marginBottom: 10
    },
    cardHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderColor: 'rgb(229, 229, 229)',
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: 12
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    cardDataTitle: {
        fontFamily: 'Poppins-Light',
        fontSize: 10
    },
    cardDataValue: {
        fontFamily: 'Poppins-SemiBold'
    },
    cardTitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12
    }

})

function mapStateToProps({ filecoinLoans }) {
    return {
        filecoinLoans,
    }
}

export default connect(mapStateToProps)(BorrowFILRequestsView)