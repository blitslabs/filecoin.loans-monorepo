import React from 'react'
import {
    StyleSheet, View, StatusBar, Platform
} from 'react-native'

function MyStatusBar({ backgroundColor, ...props }) {
    return <StatusBar backgroundColor={backgroundColor} {...props} barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
}


const styles = StyleSheet.create({
    statusBar: {
        height: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight,
    }
})

export default MyStatusBar