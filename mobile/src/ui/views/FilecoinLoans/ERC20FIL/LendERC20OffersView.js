import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar, StyleSheet, Keyboard, TouchableOpacity, Alert } from 'react-native'

// Components
import Header from '../../../components/Header'

// Libraries
import SplashScreen from 'react-native-splash-screen'

// Actions




class LendERC20OffersView extends Component {

    cardStackRef = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        Keyboard.dismiss()
        const { dispatch } = this.props

    }

    handleSelectAssetBtn(assetSymbol) {
        const { dispatch, navigation } = this.props
        dispatch(saveLoanRequest({ assetSymbol }))
        navigation.navigate('NewLoan')
    }

    render() {

        const { loanRequest, navigation } = this.props
        const { loanRequestType } = loanRequest

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <View style={{ paddingTop: 20 }}>
                    <Header
                        title="ERC20 Loan Book"
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
                        {/* <Text style={styles.secondaryText}>Get liquidity witout selling your assets</Text> */}
                    </View>

               

                    <TouchableOpacity onPress={() => null} style={styles.btnContainer}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.cardTitle}>ID #23</Text>
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>Collateral Locked</Text>
                            </View>
                        </View>
                        <View style={[styles.cardBody, { marginTop: 5 }]}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.cardDataTitle}>Amount</Text>
                                <Text style={styles.cardDataValue}>1.5 FIL</Text>
                            </View>
                            <View style={{ flex: 2, }}>
                                <Text style={styles.cardDataTitle}>Interest</Text>
                                <Text style={styles.cardDataValue}>0.008 FIL</Text>
                            </View>
                            <View style={{ flex: 1,  }}>
                                <Text style={styles.cardDataTitle}>APR</Text>
                                <Text style={styles.cardDataValue}>12%</Text>
                            </View>
                        </View>
                        <View style={[styles.cardBody, { marginBottom: 5 }]}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.cardDataTitle}>Collateral</Text>
                                <Text style={styles.cardDataValue}>300 DAI</Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.cardDataTitle}>Coll. Ratio</Text>
                                <Text style={styles.cardDataValue}>150%</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardDataTitle}>Duration</Text>
                                <Text style={styles.cardDataValue}>30d</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

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

function mapStateToProps({ loanRequest, availableLoans }) {
    return {
        loanRequest,
        availableLoans
    }
}

export default connect(mapStateToProps)(LendERC20OffersView)