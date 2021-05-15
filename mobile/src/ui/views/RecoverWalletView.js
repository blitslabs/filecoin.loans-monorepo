import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View, Dimensions, TextInput, Text, Image, Pressable,
    SafeAreaView, StyleSheet, StatusBar, FlatList, Keyboard
} from 'react-native';

// Components
import PrimaryBtn from '../components/PrimaryBtn'
import MyStatusBar from '../components/MyStatusBar'
import MyTextInput from '../components/MyTextInput'

// Libraries
import SplashScreen from 'react-native-splash-screen'

// Actions
import { saveTempMnemonic, removeTempMnemonic } from '../../actions/wallet'

class RecoverWalletView extends Component {

    state = {
        inputText: '',
        words: [],
        btnIsDisabled: true
    }

    componentDidMount() {
        SplashScreen.hide()
        const { temp_mnemonic, dispatch } = this.props
        console.log(temp_mnemonic)
        if (temp_mnemonic && temp_mnemonic !== '') {
            console.log('test1')
            dispatch(removeTempMnemonic())
        }
    }

    handleMnemonicChange = (text) => {
        let mnemonic = text.split(' ')
        let inputText = text

        if (mnemonic[mnemonic.length - 1] == '' && mnemonic[mnemonic.length - 2] == '') return
        if (mnemonic.length > 12) return

        if (mnemonic.length === 12 && mnemonic[11] != '') {
            this.setState({ btnIsDisabled: false })
        } else {
            this.setState({ btnIsDisabled: true })
        }

        let words = []

        mnemonic.map((word) => {
            words.push({ name: word })
        })

        this.setState({ words, inputText })
    }

    handleImportBtn = () => {
        console.log('IMPORT_BTN')
        const { dispatch, navigation } = this.props
        const mnemonic = this.state.inputText
        console.log(mnemonic)
        dispatch(saveTempMnemonic(mnemonic))
        navigation.navigate('CreatePIN')
    }

    render() {



        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" />

                <View style={{ flex: 1, }}>

                    <Text style={styles.label}>Enter your Mnemonic</Text>


                    <MyTextInput
                        placeholder='Mnemonic'
                        // style={...styles.textInput}
                        value={this.state.inputText}
                        onChangeText={this.handleMnemonicChange}
                        autoCapitalize={'none'}
                    />

                    <View style={{ flex: 1, }}>
                        <FlatList
                            contentContainerStyle={{
                                alignItems: 'center',
                                backgroundColor: '#f7f7f7',
                                width: Dimensions.get('window').width * 0.95,
                                minHeight: 200,
                                alignSelf: 'center',
                                borderRadius: 10,
                                paddingVertical: 15,
                                marginTop: 20,
                                // paddingHorizontal: 20
                                // flex: 1,
                                // flexDirection: 'row',
                                // flexWrap:'wrap'
                            }}
                            data={this.state.words}
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

                        <PrimaryBtn
                            title='Import Wallet'
                            onPress={this.handleImportBtn}
                            disabled={this.state.btnIsDisabled}
                        />
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'white',
        flex: 1,
    },
    text: {
        fontFamily: 'Poppins-Regular'
    },
    label: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold'
    },
    textInput: {
        borderColor: '#E9E9E9',
        borderWidth: 1,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        paddingLeft: 20,
        borderRadius: 4,
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
    }
})

function mapStateToProps({ wallet }) {
    return {
        wallet: wallet && wallet.wallet,
        temp_mnemonic: wallet && 'temp_mnemonic' in wallet ? wallet.temp_mnemonic : '',
    }
}

export default connect(mapStateToProps)(RecoverWalletView)