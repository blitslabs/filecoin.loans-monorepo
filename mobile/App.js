import 'react-native-gesture-handler'
import './shim.js'
import './base64Polyfill.js'
// import crypto from 'crypto'
// import { Wallet } from '@harmony-js/account'

import React, { Component } from 'react'
import { LogBox, Platform, Alert, Linking } from 'react-native'
// Redux
import { createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-community/async-storage'
import createSensitiveStorage from "redux-persist-sensitive-storage"
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import reducer from './src/reducers'
import middleware from './src/middleware'

// Dev Tools
import { NODE_ENV } from '@env'
import { composeWithDevTools } from 'remote-redux-devtools'

// Navigation
import Navigation from './src/navigation/Navigation'

// Push Notifications
import NotificationService from './src/services/NotificationService'

// Code Push
import codePush from 'react-native-code-push'

// Device Info
import DeviceInfo from 'react-native-device-info'

// API
import { getPlatformVersion } from './src/utils/api'

export let store

class App extends Component {

  state = {
    fontLoaded: false,
    url: ''
  }

  componentDidMount() {
    this.notification = new NotificationService(this.onRegister, this.onNotification)
    codePush.sync({
      updateDialog: true,
      installMode: codePush.InstallMode.IMMEDIATE,
      mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
    })

    getPlatformVersion({ platform: Platform.OS })
      .then(data => data.json())
      .then(async (res) => {
        
        if (res.status === 'OK') {
          const serverVersion = parseInt(res.payload?.version.replace(/\./g, ''))
          const deviceVersion = parseInt(DeviceInfo.getVersion().replace(/\./g, ''))

          // Show notification if there's a new update available
          if (serverVersion > deviceVersion) {
            // Force mandatory update
            if (res?.payload?.forceUpdate == 1) {
              Alert.alert('Update Required',
                'There\'s a new mandatory version available. Please update the app before continuing',
                [{
                  text: 'Update',
                  onPress: () => Linking.openURL(`market://details?id=${res?.payload?.appName}`)
                }],
                { cancelable: false }
              )
            } else {
              // Show alert option if it hasn't been dismissed
              const dismissVersion = await AsyncStorage.getItem('dismissUpdate')
              if (dismissVersion != res.payload?.version) {
                Alert.alert(
                  'Update Available',
                  'There\'s a new version of the app available. Do you want to update?',
                  [
                    {
                      text: 'Yes, update',
                      onPress: () => Linking.openURL(`market://details?id=${res?.payload?.appName}`)
                    },
                    {
                      text: 'No',
                      onPress: () => AsyncStorage.setItem('dismissUpdate', res.payload?.version)
                    }
                  ]
                )
              }
            }
          }
        }
      })

    //  Ignore timer warnings
    LogBox.ignoreLogs(['Setting a timer']);
    LogBox.ignoreLogs(['web3-shh package']);
    LogBox.ignoreLogs(['web3-bzz package']);
    LogBox.ignoreLogs(['Remote debugger']);
  }

  onRegister = async (token) => {
    console.log('ON_REGISTER', token)
    // await AsyncStorage.removeItem('fcm_token')
    try {
      await AsyncStorage.setItem('fcm_token', token?.token)
      console.log('REGISTRATION_KEY_SAVED')
    } catch (e) {
      console.log(e)
    }
  }

  onNotification = (notification) => {
    console.log(notification)
  }

  render() {

    const sensitiveStorage = createSensitiveStorage({
      keychainService: "blits_keychain",
      sharedPreferencesName: "blits_keystore"
    })

    const persistConfig = {
      key: 'root',
      storage: sensitiveStorage
    }


    const persistedReducer = persistReducer(persistConfig, reducer)
    const composeEnhancers = composeWithDevTools({ realtime: NODE_ENV === 'development', port: 8000 })
    store = createStore(persistedReducer, composeEnhancers(middleware))
    const persistor = persistStore(store)

    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Navigation />
        </PersistGate>
      </Provider>
    )
  }
}

const codePushOptions = {
  // checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  checkFrequency: codePush.CheckFrequency.MANUAL,
  // updateDialog: true,
  // mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
  // installMode: codePush.InstallMode.ON_NEXT_RESTART
}

export default codePush(codePushOptions)(App)





