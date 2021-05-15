import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar,
    StyleSheet, Keyboard, TouchableOpacity, Platform
} from 'react-native'

import Header from '../components/Header'


const HEIGHT = Dimensions.get('window').height

// Libraries
import SplashScreen from 'react-native-splash-screen'
import { List } from 'react-native-paper'
import { Gravatar } from 'react-native-gravatar'

// Icons
import IonIcon from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

// Actions
import { removeAllContacts } from '../../actions/contacts'


// API
import { getLoansSettings } from '../../utils/api'

import { ETH_CHAIN_NAME } from "@env"
import { ScrollView } from 'react-native-gesture-handler'

class ContactsView extends Component {

    cardStackRef = React.createRef()

    componentDidMount() {
        SplashScreen.hide()
        Keyboard.dismiss()
        const { dispatch } = this.props

    }

    handleNewContactBtn = () => {
        const { navigation } = this.props
        navigation.push('NewContact')
    }

    handleContactDetailsBtn = (contactId) => {
        const { navigation } = this.props
        navigation.push('ContactDetails', { contactId })
    }


    render() {

        const { shared, contacts } = this.props
        const { selectedAsset } = shared

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <Header
                    title="Contacts"
                    navigation={this.props.navigation}

                />
                <View style={{ backgroundColor: 'transparent', flex: 1, marginHorizontal: 0 }}>
                    <View style={{ marginTop: 8 }}>
                        <List.Item onPress={() => this.handleNewContactBtn()} style={{ backgroundColor: '#f9f9f9', paddingVertical: 10 }} title="New Contact" left={() => <IonIcon name="add-circle-outline" size={28} style={{ marginTop: 2, marginLeft: 15, marginRight: 12 }} />} />
                    </View>
                    <List.Section>
                        <List.Subheader style={{ marginBottom: -10 }}>All Contacts</List.Subheader>
                        <ScrollView>
                            {
                                Object.values(contacts).length > 0 ?
                                    Object.values(contacts).map((c, i) => (
                                        <List.Item
                                            key={i}
                                            onPress={() => this.handleContactDetailsBtn(c?.id)} title={c?.name}
                                            description={c?.blockchain + ' ' + c?.address}
                                            left={() => <Gravatar options={{
                                                email: c?.address,
                                                parameters: { "size": "200", "d": "retro" },
                                                secure: true
                                            }}
                                                style={styles.roundedProfileImage} />
                                            }
                                            right={() => <MaterialIcons name='chevron-right' color='grey' size={25} style={{top: 14}} />}
                                            descriptionStyle={{ fontSize: 10, fontFamily: 'Poppins-Light' }}
                                            titleStyle={{ fontSize: 14, fontFamily: 'Poppins-Regular' }}
                                        />
                                    ))
                                    :
                                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                                        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: 'grey' }}>Your contacts will appear here</Text>
                                    </View>


                            }
                        </ScrollView>
                    </List.Section>
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        // height: HEIGHT,
        // paddingHorizontal: 20,
        paddingVertical: 20,
    },
    btnContainer: {
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: Platform.OS === 'ios' ? 10 : 5,
        // borderColor: 'black',
        // borderWidth: 1,
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
        color: 'white',
        fontSize: 14
    },
    btnSubtitle: {
        fontFamily: 'Poppins-Regular',
        color: 'white',
        fontSize: 12
    },
    mainText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        marginTop: 20
    },
    secondaryText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginBottom: 10
    },
    myLoansContainer: {
        borderTopWidth: 0.5,
        borderTopColor: '#f1f1f1',
        marginTop: 20,
        paddingTop: 20,
        alignItems: 'center'
    },
    myLoansTxt: {
        fontFamily: 'Poppins-Regular',
    },
    roundedProfileImage: {
        width: 40, height: 40, borderWidth: 0,
        borderColor: 'black', borderRadius: 50,
        marginLeft: 8, marginTop: 6
    },

})

function mapStateToProps({ wallet, shared, contacts }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        contacts
    }
}

export default connect(mapStateToProps)(ContactsView)