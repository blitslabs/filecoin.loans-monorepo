import React, { Component, Fragment } from 'react'

import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image,
    SafeAreaView, StatusBar, StyleSheet, Keyboard, TouchableOpacity, Alert, ScrollView,
    TouchableWithoutFeedback
} from 'react-native'

// Components
import PrimaryBtn from './PrimaryBtn'
import BlitsBtn from './BlitsBtn'
import SecondaryBtn from './SecondaryBtn'
import MyTextInput from './MyTextInput'

// Libraries
import { Gravatar, GravatarApi } from 'react-native-gravatar'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import { ASSETS } from '../../crypto/index'
import BigNumber from 'bignumber.js'
import LinearGradient from 'react-native-linear-gradient'
import BackgroundTimer from 'react-native-background-timer'
import * as Animatable from 'react-native-animatable'

// Actions
import { updatePreTxData } from '../../actions/prepareTx'
const AnimatedTouchable = Animatable.createAnimatableComponent(TouchableOpacity);

class CollectibleModal extends Component {

    state = {
        allowanceScreen: true,
        amount: '',
        gasLimit: '',
        gasPrice: '',
        total: '',
        fee: '',
        gasIsInvalid: false,
        gasErrorMsg: 'Invalid gas price',
        saveGasBtnDisable: false,
        balance: '',
        amount: '',
        invalidRes: false,
        colors: ['black', 'black'],
        toggleColors: false
    }

    componentDidMount() {
        const { prepareTx, publicKeys, balances, amount } = this.props
        this.view.jello(2500)
        // this.setState({
        //     colors: this.state.toggleColors ? ['black', 'black'] : ['#ebebfd', '#e5f5ff', '#e9f0ff'],
        //     toggleColors: !this.state.toggleColors
        // })

        // BackgroundTimer.runBackgroundTimer(() => {
        //     this.setState({
        //         colors: this.state.toggleColors ? ['black', 'black'] : ['#ebebfd', '#e5f5ff', '#e9f0ff'],
        //         toggleColors: !this.state.toggleColors
        //     })
        // }, 2500)

    }

    handleViewRef = ref => this.view = ref;

    onPress = () => {
        this.view.flash(2500)
        this.setState({
            colors: this.state.toggleColors ? ['black', 'black'] : ['#fc02ef', '#6200ee', '#4b0a6d'],
            toggleColors: !this.state.toggleColors
        })
    }

    render() {

        const { invalidRes } = this.state
        const { handleCloseModal, collectibles, shared } = this.props

        const collectible = collectibles[shared?.selectedCollectible]

        return (
            <Fragment>
                {

                    <LinearGradient colors={this.state.colors} style={styles.wrapper}>
                        <View style={styles.draggerWrapper}>
                            <View style={styles.dragger} />
                        </View>
                        <TouchableWithoutFeedback onPress={this.onPress}>
                            <Animatable.View ref={this.handleViewRef} style={{ zIndex: 20 }}>

                                <View style={{ alignItems: 'center', marginVertical: 10, paddingVertical: 0, marginTop: 10, borderRadius: 100, overflow: 'hidden' }}>
                                    <LinearGradient colors={this.state.colors} style={{ borderRadius: 100 }}>
                                        <Image resizeMode='cover' style={{ height: 180, width: 180, borderRadius: 100, overlayColor: this.state.toggleColors ? '#6200ee' : 'black' }} source={{ uri: collectible?.image_url }} />
                                    </LinearGradient>
                                </View>

                            </Animatable.View>
                        </TouchableWithoutFeedback>

                        <View style={styles.txDetailsContainer}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', color: 'white' }}>Name</Text>
                                <Text style={{ fontFamily: 'Poppins-Regular', color: 'white' }}>{collectible?.name}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', color: 'white' }}>Token ID</Text>
                                <Text style={{ fontFamily: 'Poppins-Regular', color: 'white' }}>{collectible?.token_id}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold', color: 'white' }}>Collection</Text>
                                </View>
                                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: 'white' }}>{collectible?.collectionName}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold', color: 'white' }}>Contract</Text>
                                </View>
                                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: 'white' }}>{collectible?.contractAddress.substring(0, 15)}...</Text>
                            </View>

                        </View>

                        <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 15, marginTop: 15 }}>
                            <View style={{ flex: 1 }}>
                                <SecondaryBtn title="Close" onPress={() => handleCloseModal()} />
                            </View>
                        </View>
                    </LinearGradient>


                }
            </Fragment>
        )
    }
}

const styles = StyleSheet.create({

    wrapper: {
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    draggerWrapper: {
        width: '100%',
        height: 33,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#80808038'
    },
    dragger: {
        width: 48,
        height: 5,
        borderRadius: 4,
        backgroundColor: 'grey',
        opacity: 0.5
    },
    titleWrapper: {
        marginTop: 10,
        alignItems: 'center'
    },
    title: {
        fontFamily: 'Poppins-SemiBold',
        color: 'black',
        fontSize: 18,
        flexDirection: 'row',
        alignSelf: 'center'
    },

    avatarContainer: {
        // padding: 5,
        flex: 2,
    },

    roundedProfileImage: {
        width: 50, height: 50, borderWidth: 3,
        borderColor: 'white', borderRadius: 50,

    },
    accountText: {
        fontFamily: 'Poppins-SemiBold',
    },
    balanceText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginTop: -3
    },
    txDetailsContainer: {
        backgroundColor: 'transparent',
        borderColor: 'whitesmoke', borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 25, borderRadius: 10, paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15,
    },
    textLink: {
        fontFamily: 'Poppins-SemiBold',
        color: '#32CCDD',
        fontSize: 12,
    }
})

function mapStateToProps({ shared, collectibles }) {
    return {
        shared,
        collectibles
    }
}

export default connect(mapStateToProps)(CollectibleModal)