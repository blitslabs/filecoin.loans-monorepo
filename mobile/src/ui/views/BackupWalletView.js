import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View, Dimensions, TextInput, Text, Image, Pressable,
    SafeAreaView, StyleSheet, StatusBar, FlatList, BackHandler
} from 'react-native';

// Components
import Header from '../components/Header'
import MyStatusBar from '../components/MyStatusBar'

// Libraries
const DUMMY_DATA = [{
    name: 'crush'
}, {
    name: 'special'
}, {
    name: 'moment'
}, {
    name: 'gallery'
}, {
    name: 'congress'
}, {
    name: 'faculty'
}, {
    name: 'light'
}, {
    name: 'inspire'
}, {
    name: 'phone'
}, {
    name: 'moment'
}, {
    name: 'special'
}, {
    name: 'estate'
}
];

class BackupWalletView extends Component {

    state = {
        words: []
    }

    componentDidMount() {
        const { mnemonic } = this.props.wallet        
        this.prepareData(mnemonic)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick)
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    prepareData = (data) => {
        let words = data.trim().split(' ')
        console.log(words)
        words = words.map(w => {
            return {
                name: w
            }
        })
        this.setState({ words })
    }

    handleBackBtn = () => {
        const { navigation } = this.props
        navigation.pop(2)
    }

    handleNextBtn = () => {
        const { navigation } = this.props
        navigation.push('ConfirmMnemonic')
    }

    handleBackButtonClick = () => {
        const { navigation } = this.props
        navigation.pop(2)
        return true
    }

    render() {

        const { auth } = this.props

        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" />
                <Header
                    title="Backup Mnemonic"
                    navigation={this.props.navigation}
                    centerComponentStyle={{ fontSize: 18 }}
                    customLeftComponent={true}
                    onLeftComponentPress={() => this.handleBackBtn()}
                    rightComponentTitle={!auth?.wallet_backed ? "Next" : false}
                    rightComponentStyle={{ top: -3, right: 10, fontFamily: 'Poppins-SemiBold' }}
                    onRightComponentPress={() => this.handleNextBtn()}
                />
                <View style={{ flex: 1, marginHorizontal: 20 }}>
                    <Text style={[styles.text, { marginTop: 20, textAlign: 'justify', lineHeight: 20, }]}>Write down the following 12 mnemonic words on paper. You will need them in case you need to recover your wallet. Please avoid taking a screenshot or emailing it to yourself.</Text>

                    <View style={styles.wordsContainer}>
                        <FlatList
                            contentContainerStyle={{
                                alignItems: 'center',
                                // backgroundColor: '#f7f7f7',
                                width: Dimensions.get('window').width * 0.95,
                                alignSelf: 'center',
                                borderRadius: 10,
                                // paddingVertical: 15,
                                // marginTop: 20,
                                // paddingHorizontal: 20
                                // flex: 1,
                                // flexDirection: 'row',
                                // flexWrap:'wrap'
                            }}
                            data={this.state.words.length === 0 ? DUMMY_DATA : this.state.words}
                            numColumns={4}
                            renderItem={({ item, index }) => {
                                return (
                                    <Pressable
                                        android_ripple={{
                                            color: '#fff',
                                            radius: Dimensions.get('window').width * 0.19
                                        }}
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: Dimensions.get('window').width * 0.18,
                                            // flex: 1,
                                            height: 40,
                                            borderRadius: 4,
                                            backgroundColor: '#32CCDD',
                                            marginHorizontal: 8,
                                            marginVertical: 8
                                        }}>
                                        <View style={styles.wordContainer}>
                                            <Text style={styles.wordTextIndex}>{index + 1}</Text>

                                            <Text style={{ color: '#fff', }}>{item.name}</Text>


                                        </View>
                                    </Pressable>
                                )
                            }}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        // paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'white',
        flex: 1,
    },
    text: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12
    },
    wordContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    wordTextIndex: {
        fontSize: 8,
        position: 'absolute',
        top: 2,
        right: 5,
        color: 'white',

        // backgroundColor: 'red'
    },
    btnsContainer: {
        backgroundColor: 'transparent',
        width: 200,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20
    },
    textBtn: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14
    },
    wordsContainer: {
        backgroundColor: '#f7f7f7',
        marginTop: 20,
        paddingVertical: 10,
        borderRadius: 5
        // paddingHorizontal: 0
    }
})

function mapStateToProps({ wallet, auth }) {
    return {
        wallet: wallet && wallet.wallet,
        auth
    }
}

export default connect(mapStateToProps)(BackupWalletView)