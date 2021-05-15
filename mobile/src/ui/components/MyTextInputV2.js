import React from 'react'
import {
    Platform, StyleSheet
} from 'react-native'
import { TextInput } from 'react-native-paper'

function MyTextInput(props) {
    const { placeholder, label, value, onChangeText, keyboardType, style } = props

    return <TextInput
        placeholder={placeholder}
        label={label}
        value={value}
        onChangeText={onChangeText}
        style={[Platform.OS === 'ios' ? styles.ios : styles.android, style]}
        selectionColor="#32CCDD"
        keyboardType={keyboardType ? keyboardType : 'default'}
        returnKeyLabel='Done' 
        returnKeyType='done' 
        theme={{ colors: { primary: 'black',}}}
        mode='outlined'
    />
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
        borderColor: 'red',
        // borderWidth: 1,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        backgroundColor: 'white',
        height: 50
        // paddingLeft: 20,
        // borderRadius: 4,
    }
})

export default MyTextInput