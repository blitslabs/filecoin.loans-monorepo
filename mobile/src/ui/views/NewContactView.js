import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View, Dimensions, TextInput, Text, Image, Pressable, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert,
    KeyboardAvoidingView
} from 'react-native'
// import Header from '../../components/header'

// Components
import MyTextInput from '../components/MyTextInput'
import MyTextInputV2 from '../components/MyTextInputV2'
import TextInputWithBtn from '../components/TextInputWithBtn'
import PrimaryBtn from '../components/PrimaryBtn'
import BlitsBtn from '../components/BlitsBtn'
import Loading from '../components/Loading'
import FormAlertMsg from '../components/FormAlertMsg'
import MyStatusBar from '../components/MyStatusBar'

// Libraries
import SplashScreen from 'react-native-splash-screen'
import Slider from '@react-native-community/slider'
import ETH from '../../crypto/ETH'
import Blits from '../../crypto/Blits'
import BigNumber from 'bignumber.js'
import { ASSETS } from '../../crypto/index'
import Toast, { DURATION } from 'react-native-easy-toast'
import * as Animatable from 'react-native-animatable'
import ENS from '../../crypto/ENS'
import DropDownPicker from 'react-native-dropdown-picker'

// Icons
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import IonIcon from 'react-native-vector-icons/Ionicons'

// Actions
import { saveContact } from '../../actions/contacts'

const blockchains = [{ label: 'Harmony (ONE)', value: 'ONE' }, { label: 'Ethereum (ETH)', value: 'ETH' }]

class NewContactView extends Component {

    state = {
        name: '',
        contactAddress: '',
        address: '',
        addressIsInvalid: false,
        selectedBlockchain: 'ETH',
        loading: false,
        formStatus: '',
        formMsg: ''
    }

    toast = React.createRef()

    componentDidMount() {
        SplashScreen.hide()

    }

    handleNameChange = (value) => {
        this.setState({ name: value })
    }

    handleAddressChange = async (value) => {
        const { selectedBlockchain } = this.state
        this.setState({ address: value })
        
        if (Blits.isAddressValid(value, selectedBlockchain)) {
            this.setState({ formStatus: true, formMsg: 'Valid address', contactAddress: value })
        } else {
            const address = await ENS.getAddress(value)
            console.log(address)
            if (Blits.isAddressValid(address, selectedBlockchain)) {
                this.setState({ formStatus: true, formMsg: 'Address found', contactAddress: address })
                return
            }
            this.setState({ formStatus: false, formMsg: 'Invalid ENS or address', contactAddress: '' })
        }
    }

    handleBlockchainChange = (value) => {
        this.setState({ selectedBlockchain: value, address: '' })
    }

    handleScanBtn = () => {
        console.log('QR_CODE_SCAN_BTN')
        const { navigation } = this.props
        navigation.push('QRCode', { onQRRead: this.onQRRead })
    }

    onQRRead = (e) => {
        const { navigation } = this.props
        const { selectedBlockchain } = this.state
        const address = e.data
        navigation.pop()

        this.setState({ address })

        if (Blits.isAddressValid(address, selectedBlockchain)) {
            this.setState({ formStatus: true, formMsg: 'Valid address', contactAddress: address })
        } else {
            this.setState({ formStatus: false, formMsg: 'Invalid address', contactAddress: '' })
        }
    }

    handleAddBtn = async () => {
        console.log('ADD_CONTACT_BTN')
        const { navigation, publicKeys, wallet, dispatch } = this.props
        const { name, contactAddress, selectedBlockchain } = this.state
        console.log(contactAddress)
        if (!name) {
            Alert.alert('Error', 'Enter a valid name', [{ text: 'OK' }])
            return
        }

        if (!selectedBlockchain) {
            Alert.alert('Error', 'Select a blockchain', [{ text: 'OK' }])
            return
        }

        if (!contactAddress) {
            Alert.alert('Error', 'Enter a valid address or ENS', [{ text: 'OK' }])
            return
        }

        if (!Blits.isAddressValid(contactAddress, selectedBlockchain)) {
            Alert.alert('Error', 'Invalid address', [{ text: 'OK' }])
            return
        }

        const contact = {
            id: name, name, address: contactAddress, blockchain: selectedBlockchain
        }

        dispatch(saveContact(contact))

        this.setState({ name: '', address: '', contactAddress: '', formStatus: '', formMsg: '', selectedBlockchain: 'ETH' })
        navigation.pop()
        // this.toast.current.show('Contact added!')
    }

    render() {

        const { name, address, selectedBlockchain, formStatus, formMsg, loading } = this.state

        if (loading) {
            return <Loading message={'Importing NFT Collection'} />
        }

        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" barStyle="light-content" />

                <ScrollView style={{ backgroundColor: 'transparent', flex: 1, paddingHorizontal: 20, paddingTop: 10, width: '100%' }}>


                    <View style={styles.imageContainer}>
                        <Animatable.View duration={1000} animation="zoomIn" style={{ zIndex: 20 }}>
                            <Image style={styles.image} source={require('../../../assets/images/business-contact.png')} />
                        </Animatable.View>
                    </View>



                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.formLabel}>Name</Text>
                        <MyTextInput
                            placeholder="Enter name here"
                            value={name}
                            onChangeText={this.handleNameChange}
                        />
                    </View>


                    <Text style={[styles.formLabel, Platform.OS === 'ios' ? { marginTop: 20, zIndex: 20 } : { marginTop: 20 }]}>Blockchain</Text>
                    <DropDownPicker
                        items={[
                            { label: 'Harmony (ONE)', value: 'ONE' }, { label: 'Ethereum (ETH)', value: 'ETH' }, { label: 'Binance (BNB)', value: 'BNB' },
                            { label: 'Filecoin (FIL)', value: 'FIL' }
                        ]}
                        defaultValue={selectedBlockchain}
                        containerStyle={{ height: 50 }}
                        style={{}}
                        itemStyle={{
                            justifyContent: 'flex-start'
                        }}
                        dropDownStyle={{ backgroundColor: '#fafafa', zIndex: 200, height: 100 }}
                        onChangeItem={item => this.handleBlockchainChange(item.value)}
                        placeholder="Select a Blockchain"

                    />


                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.formLabel}>Address</Text>
                        <TextInputWithBtn
                            placeholder="Address or ENS"
                            value={address}
                            onChangeText={this.handleAddressChange}
                            icon={<IconMaterialCommunity name="qrcode-scan" size={22} />}
                            onIconBtnPressed={this.handleScanBtn}
                            autoCapitalize={'none'}
                        />
                    </View>

                    {
                        formStatus !== '' && (
                            <FormAlertMsg status={formStatus} msg={formMsg} containerStyle={{ marginTop: 10 }} />
                        )
                    }
                </ScrollView>

                <View style={{ width: '100%', paddingHorizontal: 20, paddingBottom: 20 }}>
                    <PrimaryBtn onPress={this.handleAddBtn} title='Save Contact' />
                </View>

                <Toast
                    ref={this.toast}
                    style={{ backgroundColor: 'black', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25 }}
                    position='top'
                    positionValue={30}
                    fadeInDuration={250}
                    fadeOutDuration={3000}
                    opacity={0.95}
                    textStyle={{ color: 'white', fontSize: 16, fontFamily: 'Poppins-Regular' }}
                />
            </SafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        alignItems: 'center'
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
        // paddingBottom: 30,
        // marginTop: 10,
        backgroundColor: 'red',
        width: '100%',
        flex: 1
    },
    balancesContainer: {
        marginVertical: 0,
    },
    formLabel: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 12,
        color: 'black'
    },
    text: {
        fontFamily: 'Poppins-Regular'
    },
    detailsContainer: {
        borderTopColor: '#f9f9f9',
        borderTopWidth: 1,
        paddingTop: 15,
        marginTop: 10,
        width: '100%',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        // marginBottom: 20,
    },
    sm_text: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10
    },
    txConfirmationText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40
    },
    image: {
        height: 120,
        width: 120,
        // borderRadius: 100
    },
    imageContainer: {
        // textAlign: 'center',
        // backgroundColor: 'red',
        alignItems: 'center'
    },



})

function mapStateToProps({ wallet, shared, balances }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        balances,
        wallet: wallet && wallet.wallet,
    }
}

export default connect(mapStateToProps)(NewContactView)