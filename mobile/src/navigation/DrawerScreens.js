import React, { Component } from 'react'
import { connect } from 'react-redux'
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, Linking, Alert, Platform } from 'react-native'

// Views
import WalletView from '../ui/views/WalletView'
import LoansView from '../ui/views/LoansView'
import ContactsView from '../ui/views/ContactsView'
import SettingsView from '../ui/views/SettingsView'

// Actions
import { removeBalances } from '../actions/balances'
import { removeTxs } from '../actions/txs'
import { removeWallet } from '../actions/wallet'
import { removePinHash, walletSaved, toggleWalletBacked } from '../actions/auth'
import { removeAllTokens } from '../actions/tokens'
import { removeAllContacts } from '../actions/contacts'

// Icons
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5'
import IconMaterial from 'react-native-vector-icons/MaterialIcons'

// SVG
import LightningIcon from '../../assets/images/lightning.svg'
import TelegramIcon from '../../assets/images/telegram.svg'
import ProtectIcon from '../../assets/images/protect.svg'
import ViewIcon from '../../assets/images/view.svg'
import SignoutIcon from '../../assets/images/signout.svg'

// Navigation
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
const Tab = createBottomTabNavigator()
const Drawer = createDrawerNavigator()


class DrawerScreens extends Component {

    handleLogoutBtn = () => {
        console.log('LOGOUT_BTN')
        const { auth, dispatch } = this.props

        if (!auth?.wallet_backed) {
            Alert.alert('Back up your wallet!', 'You cannot log out until you back up your wallet', [{ text: 'OK' }])
            return
        }

        Alert.alert(
            'Confirmation',
            'Are you sure you want to reset your wallet? If you didn\'t back up your recovery phrase you won\'t be able to recover your wallet.',
            [
                { text: 'Yes, erase wallet data', onPress: () => this.handleConfirmLogout() },
                { text: 'Cancel', style: 'cancel' }
            ]
        )

    }

    handleConfirmLogout = async () => {
        const { dispatch } = this.props
        dispatch(walletSaved(false))
        dispatch(removeWallet())
        dispatch(removeTxs())
        dispatch(removeBalances())
        dispatch(removePinHash())
        dispatch(toggleWalletBacked(false))
        dispatch(removeAllTokens())
        dispatch(removeAllCollectibles())
        dispatch(removeAllNFTCollections())
        dispatch(removeAllContacts())
        dispatch(removeAllHorizonOpActions())
        dispatch(removeHorizonOps())
    }

    render() {
        return (
            <Drawer.Navigator

                drawerContent={(props) => {
                    return (
                        <View style={{ marginTop: 40 }}>
                            {
                                Platform.OS === 'android' && (
                                    <Image
                                        resizeMode='contain'
                                        style={{ alignSelf: 'center', height: 80, marginBottom: 20 }}
                                        source={require('../../assets/images/blits_sym.png')}
                                    />
                                )
                            }
                            {/* <TouchableOpacity onPress={() => Alert.alert('Alert', 'Coming soon!', [{ text: 'OK' }])}>
                                <View style={styles.drawerMenuContainer}>
                                    <IconMaterialCommunity name='lock' size={25} color='black' />
                                    <Text style={styles.drawerMenuText}>Change PIN</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => props.navigation.navigate('BackupWallet')}>
                                <View style={styles.drawerMenuContainer}>
                                    <IconMaterialCommunity name='safe' size={25} color='black' />
                                    <Text style={styles.drawerMenuText}>Backup Mnemonic</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => Linking.openURL('https://blits.net')}>
                                <View style={styles.drawerMenuContainer}>
                                    <IconMaterialCommunity name='gift-outline' size={25} color='black' />
                                    <Text style={styles.drawerMenuText}>Free ONE</Text>
                                </View>
                            </TouchableOpacity> */}
                            <TouchableOpacity onPress={() => Linking.openURL('https://blits.net')}>
                                <View style={styles.drawerMenuContainer}>
                                    <LightningIcon width={25} height={25} />
                                    <Text style={styles.drawerMenuText}>Blits.net</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => Linking.openURL('tg://resolve?domain=blits_community')}>
                                <View style={styles.drawerMenuContainer}>
                                    <ProtectIcon width={25} height={25} />
                                    <Text style={styles.drawerMenuText}>Telegram Group</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => Linking.openURL('https://blits.net/terms')}>
                                <View style={styles.drawerMenuContainer}>
                                    <ViewIcon width={25} height={25} />
                                    <Text style={styles.drawerMenuText}>Terms & Conditions</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.handleLogoutBtn()}>
                                <View style={styles.drawerMenuContainer}>
                                    <SignoutIcon width={25} height={25} />
                                    <Text style={styles.drawerMenuText}>Logout</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )
                }}
            >
                <Drawer.Screen name="Home" component={BottomTabsScreens} />
            </Drawer.Navigator>
        )
    }
}

const styles = StyleSheet.create({
    drawerMenuContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderBottomColor: '#EEEEEE',
        borderBottomWidth: 0.5,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    drawerMenuIcon: {
        marginRight: 20
    },
    drawerMenuText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        paddingLeft: 10

    }
})

function mapStateToProps({ auth }) {
    return {
        auth
    }
}

export default connect(mapStateToProps)(DrawerScreens)


function BottomTabsScreens() {
    return (
        <Tab.Navigator
            tabBarOptions={{
                activeTintColor: '#000',
                showLabel: false,
                tabStyle: {
                    backgroundColor: '#f9f9f9',
                    justifyContent: 'center',
                },
                style: {
                    height: Dimensions.get('window').height * 0.08,
                }
            }
            }>
            <Tab.Screen
                name="WALLET"
                component={WalletView}
                options={{
                    tabBarIcon: ({ focused }) => {

                        return (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <IconFontAwesome name="wallet" size={20} color={focused ? 'black' : '#B9BDBE'} />
                                <Text style={{ fontSize: 10, marginTop: 2, fontWeight: 'bold', color: focused ? '#000' : 'grey', fontFamily: 'Poppins-Regular' }}>WALLET</Text>
                            </View>
                        );
                    },
                }}
            />
            {/* <Tab.Screen name="ACTIVITY" component={WalletView}
          options={{
            tabBarIcon: ({ focused }) => {
              const image = focused ? require('./assets/images/activity-active.png')
                : require('./assets/images/activity.png')
              return (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Image resizeMode='contain' style={{ height: 18 }} source={image} />
                  <Text style={{ fontSize: 9, marginTop: 1, fontWeight: 'bold', color: focused ? '#000' : 'grey', fontFamily: 'Poppins-Regular' }}>ACTIVITY</Text>
                </View>
              );
            }
          }}
        /> */}
            <Tab.Screen name="LOANS" component={LoansView}
                options={{
                    tabBarIcon: ({ focused }) => {

                        return (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <IconMaterialCommunity name="trending-up" size={25} color={focused ? 'black' : '#B9BDBE'} />
                                <Text style={{ fontSize: 10, marginTop: 0, fontWeight: 'bold', color: focused ? '#000' : 'grey', fontFamily: 'Poppins-Regular' }}>LOANS</Text>
                            </View>
                        )
                    }
                }}
            />

            <Tab.Screen name="CONTACTS" component={ContactsView}
                options={{
                    tabBarIcon: ({ focused }) => {

                        return (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <IconMaterial name="people" size={25} color={focused ? 'black' : '#B9BDBE'} />
                                <Text style={{ fontSize: 10, marginTop: 1, fontWeight: 'bold', color: focused ? '#000' : 'grey', fontFamily: 'Poppins-Regular' }}>CONTACTS</Text>
                            </View>
                        )
                    }
                }}
            />
            <Tab.Screen name="PROFILE" component={SettingsView}
                options={{
                    tabBarIcon: ({ focused }) => {

                        return (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <IconMaterial name="settings" size={25} color={focused ? 'black' : '#B9BDBE'} />
                                <Text style={{ fontSize: 10, marginTop: 1, fontWeight: 'bold', color: focused ? '#000' : 'grey', fontFamily: 'Poppins-Regular' }}>SETTINGS</Text>
                            </View>
                        )
                    }
                }}
            />
        </Tab.Navigator>
    );
}