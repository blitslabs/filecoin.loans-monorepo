import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View, Dimensions, TextInput, Text, Image, Pressable, Alert,
    SafeAreaView, StyleSheet, StatusBar, FlatList, TouchableOpacity
} from 'react-native';

// Components
import Header from '../components/Header'
import PrimaryBtn from '../components/PrimaryBtn'
import MyStatusBar from '../components/MyStatusBar'

// Libraries

// Actions
import { toggleWalletBacked } from '../../actions/auth'

class ConfirmMnemonicView extends Component {

    state = {
        words: [],
        shuffledWords: [],
        mnemonic: [],
        isMnemonicOrderValid: false
    }

    componentDidMount() {
        const { mnemonic } = this.props        
        this.prepareData(mnemonic)
    }

    prepareData = (data) => {
        let words = data.trim().split(' ')

        words = words.map(w => {
            return {
                name: w
            }
        })

        this.setState({ shuffledWords: this.shuffle(words), })
    }

    shuffle = (array) => {
        let i = array.length - 1;
        for (; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    handleBackBtn = () => {
        const { navigation } = this.props
        navigation.pop()
    }

    handleNextBtn = () => {
        const { navigation } = this.props
        navigation.push('ConfirmMnemonic')
    }

    handleAddWordPress = (word) => {

        let { words, shuffledWords, isMnemonicOrderValid } = this.state
        let { mnemonic, dispatch } = this.props

        if (isMnemonicOrderValid) return

        // Remove from shuffled words
        // shuffledWords = shuffledWords.filter(w => w.name !== word.name)
        let wordIndex = 0
        for (let w of shuffledWords) {
            if (w.name === word?.name) break;
            wordIndex += 1
        }

        shuffledWords.splice(wordIndex, 1)

        this.setState({ shuffledWords })

        // Add to words
        words = [...words, word]
        this.setState({ words })

        // Check if mnemonic order is correct
        if (shuffledWords.length === 0) {
            let i = 0
            let isMnemonicOrderValid = true
            mnemonic = mnemonic.trim().split(' ')

            for (let w of words) {
                console.log(w.name + ' ' + mnemonic[i])
                if (w.name !== mnemonic[i]) {
                    isMnemonicOrderValid = false
                    break
                }
                i++
            }

            if (isMnemonicOrderValid) {
                this.setState({ isMnemonicOrderValid })
                dispatch(toggleWalletBacked(true))
            }
        }
    }

    handleRemoveWordPress = (word) => {
        console.log('Remove word: ', word)
        const { words, shuffledWords, isMnemonicOrderValid } = this.state

        if (isMnemonicOrderValid) return

        let wordIndex = 0
        for (let w of words) {
            if (w.name === word?.name) break;
            wordIndex += 1
        }

        words.splice(wordIndex, 1)

        // Remove from words
        this.setState({
            words
        })

        // Add to shuffled words
        this.setState({
            shuffledWords: [...shuffledWords, word]
        })
    }

    handleContinueBtn = async () => {
        const { navigation } = this.props
        navigation.reset({
            routes: [{ name: 'WalletBacked' }]
        })
    }

    render() {

        const { isMnemonicOrderValid } = this.state

        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" />
                <Header
                    title="Confirm Mnemonic"
                    navigation={this.props.navigation}
                    centerComponentStyle={{ fontSize: 18 }}
                    customLeftComponent={true}
                    onLeftComponentPress={() => this.handleBackBtn()}
                // rightComponentTitle="Next"
                // rightComponentStyle={{ top: -3, right: 10, fontFamily: 'Poppins-SemiBold'}}
                // onRightComponentPress={() => this.handleNextBtn()}
                />
                <View style={{ flex: 1, marginHorizontal: 20 }}>
                    <Text style={[styles.text, { marginTop: 20, textAlign: 'justify', lineHeight: 20, }]}>Enter your the words in the correct order to confirm you have backed up your recovery phrase.</Text>

                    <View style={styles.wordsContainer}>
                        <FlatList
                            contentContainerStyle={{
                                alignItems: 'center',
                                width: Dimensions.get('window').width * 0.95,
                                alignSelf: 'center',
                                borderRadius: 10,
                                minHeight: 168
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
                                        onPress={() => this.handleRemoveWordPress(item)}
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: Dimensions.get('window').width * 0.18,
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

                    <View style={{ marginTop: 10 }}>
                        <FlatList
                            contentContainerStyle={{
                                alignItems: 'center',
                                width: Dimensions.get('window').width * 0.95,
                                alignSelf: 'center',
                                borderRadius: 10,
                                minHeight: 168
                            }}
                            data={this.state.shuffledWords}
                            numColumns={4}
                            renderItem={({ item, index }) => {
                                return (
                                    <Pressable
                                        android_ripple={{
                                            color: '#fff',
                                            radius: Dimensions.get('window').width * 0.19
                                        }}
                                        onPress={() => this.handleAddWordPress(item)}
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: Dimensions.get('window').width * 0.18,
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
                <View style={{ marginHorizontal: 20, paddingBottom: 20 }}>
                    <PrimaryBtn title='Confirm' onPress={() => this.handleContinueBtn()} disabled={!isMnemonicOrderValid} />
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        // paddingHorizontal: 20,
        paddingTop: 20,
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

function mapStateToProps({ wallet }) {
    return {
        wallet: wallet && wallet.wallet,
        mnemonic: wallet?.wallet?.mnemonic
    }
}

export default connect(mapStateToProps)(ConfirmMnemonicView)