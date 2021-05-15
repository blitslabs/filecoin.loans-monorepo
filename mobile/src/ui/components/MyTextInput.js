import React, { Component } from 'react'
import {
    TextInput, Platform, StyleSheet
} from 'react-native'

class MyTextInput extends Component {

    state = {
        isFocused: false
    }

    render() {
        const { 
            placeholder, value, onChangeText, keyboardType, 
            isInvalid, style, autoCapitalize
         } = this.props
        const { isFocused } = this.state

        return (
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                style={[isInvalid === false || !isInvalid ? isFocused ? styles.isFocused : styles.textInput : styles.isInvalid, style]}
                selectionColor="#32CCDD"
                keyboardType={keyboardType ? keyboardType : 'default'}
                returnKeyLabel='Done'
                returnKeyType='done'
                onFocus={() => this.setState({ isFocused: true })}
                onBlur={() => this.setState({ isFocused: false })}
                autoCapitalize={autoCapitalize}
            />
        )
    }

}

const styles = StyleSheet.create({
    ios: {
        borderColor: '#E9E9E9',
        borderWidth: 1,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        paddingLeft: 20,
        borderRadius: 4,
        height: 45,
    },
    android: {
        borderColor: '#E9E9E9',
        borderWidth: 1,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        paddingLeft: 20,
        borderRadius: 4,
        backgroundColor: 'white'
    },
    textInput: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        paddingLeft: 20,
        borderColor: '#E9E9E9',
        borderWidth: 1,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        color: 'black',
        paddingTop: 3,
        paddingBottom: 0,
        height: 48,
        backgroundColor: 'white'
    },
    isInvalid: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        paddingLeft: 20,

        borderColor: 'red',
        color: 'red',
        borderWidth: 1,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        paddingTop: 3,
        paddingBottom: 0,
        height: 48,
        backgroundColor: 'white'
    },
    isFocused: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        paddingLeft: 20,
        backgroundColor: 'white',
        borderColor: 'black',
        color: 'black',
        borderWidth: 1,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        paddingTop: 3,
        paddingBottom: 0,
        height: 48,
    }
})

export default MyTextInput