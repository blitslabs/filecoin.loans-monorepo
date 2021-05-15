import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, FlatList, StyleSheet, SafeAreaView,
    TouchableOpacity, Alert

} from 'react-native'

// Components
import { TabView, TabBar } from 'react-native-tab-view'
import TxsList from './TxsList'
import ContactTxsList from './ContactTxsList'
import PrimaryBtn from './PrimaryBtn'

// Actions
import { removeContact } from '../../actions/contacts'

const HEIGHT = Dimensions.get('window').height
const WIDTH = Dimensions.get('window').width

class ContactDetailsTabs extends Component {

    state = {
        index: 0,
        routes: [
            { key: 'first', title: 'TRANSACTIONS' },
            { key: 'second', title: 'ACTIONS' },

        ],
    }

    handleRemoveContactBtn = async () => {
        Alert.alert(
            'Confirmation',
            'Are you sure you want to remove this contact?',
            [
                {
                    text: 'Yes, remove contact',
                    style: 'default',
                    onPress: () => this.handleContactRemovalConfirmation()
                },
                {
                    text: 'No',
                    style: 'cancel'
                }
            ],
        )
    }

    handleContactRemovalConfirmation = async () => {
        const { contactId, dispatch, navigation } = this.props
        dispatch(removeContact(contactId))
        navigation.pop()
    }

    renderLabel = (props) => {
        if (props.route.title === "TRANSACTIONS") {
            return <View style={{ borderBottomWidth: props.focused ? 2 : 0, }}>
                <Text
                    textBreakStrategy='simple'
                    style={styles.tabLabel}>TRANSACTIONS</Text>
            </View>
        }
        if (props.route.title === "ACTIONS") {
            return <View style={{ borderBottomWidth: props.focused ? 2 : 0 }}>
                <Text
                    textBreakStrategy='simple'
                    style={styles.tabLabel}>ACTIONS</Text>
            </View>
        }
    }

    renderScene = ({ route }) => {
        const { contacts, contactId, navigation } = this.props
        const contact = contacts[contactId]

        switch (route.key) {
            case 'first':
                return (
                    <ContactTxsList navigation={navigation} contactId={contactId} />

                );
            case 'second':
                return (
                    <View style={{ backgroundColor: 'transparent', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        {/* <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 10, left: 20, right: 20 }}> */}
                        {/* <View style={{ flex: 1, marginTop: 40, backgroundColor: 'red', width: '1000%', alignItems:'center' }}> */}
                        <TouchableOpacity
                            hitSlop={{
                                bottom: 20,
                                left: 20,
                                right: 20,
                                top: 20
                            }}
                            onPress={() => this.handleRemoveContactBtn()}
                        >
                            <Text style={styles.removeLabel}>Remove {contact?.name} as contact</Text>
                        </TouchableOpacity>

                        {/* </View> */}

                        {/* </View> */}


                    </View>

                );

        }
    }

    setIndex = (value) => {
        this.setState({ index: value });
    }


    renderTabBar = props => {
        return (
            <TabBar
                {...props}
                renderLabel={this.renderLabel}
                indicatorStyle={{ backgroundColor: 'transparent' }}
                style={{ backgroundColor: 'transparent' }}
                tabStyle={{
                    // minHeight: 30,
                    padding: 0,
                    flex: 1,
                    // marginHorizontal: 6.5,
                }}
            />
        )
    }

    render() {
        return (
            <TabView
                style={{ backgroundColor: 'white' }}
                swipeEnabled={true}
                renderTabBar={this.renderTabBar}
                navigationState={{ index: this.state.index, routes: this.state.routes }}
                renderScene={this.renderScene}
                onIndexChange={this.setIndex}
                initialLayout={{ width: WIDTH }}
                lazy={true}
            />
        )
    }
}

const styles = StyleSheet.create({
    tabLabel: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 11,
        color: "#000",
        // fontWeight: 'bold'
    },
    detailsTitle: {
        fontFamily: 'Poppins-Regular',
        marginTop: 5,
    },
    detailsValue: {
        fontFamily: 'Poppins-SemiBold'
    },
    removeLabel: {
        fontFamily: 'Poppins-Regular',
        color: 'grey',
        fontSize: 14
    }
})

function mapStateToProps({ wallet, shared, balances, txs, tokens, contacts }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        balances,
        txs,
        tokens,
        contacts,
    }
}


export default connect(mapStateToProps)(ContactDetailsTabs)


