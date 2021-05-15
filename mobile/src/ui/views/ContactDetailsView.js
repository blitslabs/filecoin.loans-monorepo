import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Dimensions, TextInput, Text, Image, Pressable, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert } from 'react-native'
// import Header from '../../components/header'

// Components
import MyTextInput from '../components/MyTextInput'
import TextInputWithBtn from '../components/TextInputWithBtn'
import PrimaryBtn from '../components/PrimaryBtn'
import BlitsBtn from '../components/BlitsBtn'
import Loading from '../components/Loading'
import Header from '../components/Header'
import ContactDetailsTabs from '../components/ContactDetailsTabs'
import ContactAddressModal from '../components/ContactAddressModal'
import MyStatusBar from '../components/MyStatusBar'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import Slider from '@react-native-community/slider'

import BigNumber from 'bignumber.js'
import { ASSETS } from '../../crypto/index'
import Toast, { DURATION } from 'react-native-easy-toast'
import * as Animatable from 'react-native-animatable'
import { Gravatar } from 'react-native-gravatar'
import Modal from 'react-native-modal'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'

// Actions


class ContactDetailsView extends Component {

    state = {
        contactId: '',
        showContactAddressModal: false,
        loading: false,
    }

    toast = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        const { route } = this.props
        const { contactId } = route.params
        this.setState({ contactId })
    }

    handleSendBtn = () => {
        const { contacts, navigation } = this.props
        const { contactId } = this.state
        const contact = contacts[contactId]
        navigation.push('ContactSelectAsset', { contactId, blockchain: contact?.blockchain })
    }

    handleShowModal = () => this.setState({ showContactAddressModal: true })
    handleCloseModal = () => this.setState({ showContactAddressModal: false })

    render() {

        const { contactId, loading } = this.state
        const { shared, tokens, contacts } = this.props
        const { selectedToken } = shared
        const token = tokens[selectedToken]
        const contact = contacts[contactId]

        if (loading) {
            return <Loading message={'Importing NFT Collection'} />
        }

        return (
            <SafeAreaView style={styles.safeArea}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" />
                <View style={{ paddingTop: 20, backgroundColor: 'white' }}>
                    <Header
                        title={contact?.name}
                        navigation={this.props.navigation}
                        customLeftComponent={true}
                        // centerComponentStyle={{ fontSize: 18 }}
                        rightIcon={<Ionicons name='qr-code' color={'black'} size={25} rightIconStyle={{ top: 15 }} />}
                        rightIconStyle={{ right: 20, top: 0 }}
                        onRightIconPress={this.handleShowModal}
                    />
                </View>
                <View style={styles.container}>
                    <View style={styles.tokenCardContainer}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                            <Gravatar
                                options={{
                                    email: contact?.address,
                                    parameters: { "size": "200", "d": "retro" },
                                    secure: true,
                                }}
                                style={styles.roundedProfileImage}
                            />
                            <Text style={styles.blockchainLabel}>Blockchain: {contact?.blockchain}</Text>
                            <Text style={styles.addressLabel}>{contact?.address}</Text>
                        </View>
                    </View>

                    {/* <View style={{ paddingHorizontal: 100, marginTop: 20 }}>
                        <PrimaryBtn title={"Send to " + contact?.name} onPress={this.handleReceiveBtn} />
                    </View> */}
                    <View style={{ flex: 1, marginTop: 10, marginBottom: 80 }}>
                        <ContactDetailsTabs contactId={contactId} navigation={this.props.navigation} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 20, left: 20, right: 20 }}>
                        <View style={{ flex: 1, paddingRight: 5 }}>
                            <PrimaryBtn title={"Send to " + contact?.name} onPress={this.handleSendBtn} />
                        </View>

                    </View>
                </View>

                <ContactAddressModal
                    contactId={contactId}
                    isVisible={this.state.showContactAddressModal}
                    onClose={this.handleCloseModal}
                />
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
        paddingHorizontal: 20,
        paddingVertical: 0,
    },
    tokenCircleBg: {
        borderRadius: 100,
        padding: 1,
        backgroundColor: 'transparent'
    },
    label: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    labelBold: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14
    },
    tokenCardContainer: {
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 0,
        borderColor: '#E9E9E9',
        borderBottomWidth: 1,
        marginTop: 10,
        paddingBottom: 15
    },
    roundedProfileImage: {
        width: 80, height: 80, borderWidth: 0,
        borderColor: 'black', borderRadius: 50,
        marginLeft: 8, marginTop: 6
    },
    blockchainLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginTop: 20
    },
    addressLabel: {
        fontFamily: 'Poppins-Light',
        fontSize: 10,
        // marginTop: 20
    },

})

function mapStateToProps({ wallet, shared, balances, tokens, contacts }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        balances,
        wallet: wallet && wallet.wallet,
        tokens,
        contacts
    }
}

export default connect(mapStateToProps)(ContactDetailsView)