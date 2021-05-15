import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, StyleSheet, Text, View, Button, StatusBar, Dimensions, SafeAreaView, Platform } from 'react-native'

// Libraries
import { WebView } from 'react-native-webview'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system'

class WebviewManager extends Component {
    state = {
        loading: true,
    }

    componentDidMount() {
        this.loadAssets()
    }

    webview = React.createRef()

    loadAssets = async () => {
        // Find asset
        const indexHtml = Asset.fromModule(require('../../assets/crypto/index.html'))
        // Download to cache
        await indexHtml.downloadAsync()
        // Read asset
        this.HTMLFile = await FileSystem.readAsStringAsync(indexHtml.localUri)

        // console.log(indexHtml.localUri)
        
        this.setState({ loading: false })
    }

    injectCode = async () => {
        const code = this.props.injectedCode
        return `window.ReactNativeWebView.postMessage(App.createMulticoinWallet('horse distance dry brother pretty manual chicken mushroom town swim prize clutch', 0));`
    }

    handleMessage = async (response) => {
        console.log(response)
        this.props.handleResponse(response)
    }

    handleTest = () => {
        console.log(this.webview)
        this.webview.current.injectJavaScript(`
            let i = Math.random();
            const wallet = JSON.stringify(App.createMulticoinWallet('horse distance dry brother pretty manual chicken mushroom town swim prize clutch', 0));
            document.getElementById('test').innerHTML = i;
            window.ReactNativeWebView.postMessage(i);   
            true;         
        `)
    }

    render() {

        if (this.state.loading) {
            return null
        }



        return (
            this.state.loading === false
            &&
            <WebView
                ref={this.webview}
                source={{ html: this.HTMLFile }}
                originWhitelist={'["*"]'}
                allowFileAccess={true}
                javaScriptEnabled={true}
                onLoad={this.handleTest}
                onMessage={this.props.handleResponse}

            />

        )
    }
}

function mapStateToProps({ }) {
    return {

    }
}

export default connect(mapStateToProps)(WebviewManager)