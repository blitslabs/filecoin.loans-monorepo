import React, { Component } from 'react'
import { View, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native'

class TextInputWithBtn extends Component {

    state = {
        isFocused: false
    }

    render() {
        const { 
            placeholder, value, onChangeText, icon, 
            onIconBtnPressed, isInvalid, keyboardType,
            autoCapitalize
        } = this.props
        const { isFocused } = this.state
        return (
            <View style={styles.inputContainer}>
                <View style={{ flex: 10 }}>
                    <TextInput
                        placeholder={placeholder}
                        style={isInvalid === false || !isInvalid ? isFocused ? styles.isFocused : styles.textInput : styles.isInvalid}
                        value={value}
                        onChangeText={onChangeText}
                        selectionColor='#3ACCDC'
                        keyboardType={keyboardType ? keyboardType : 'default'}
                        returnKeyLabel='Done'
                        returnKeyType='done'
                        onFocus={() => this.setState({ isFocused: true })}
                        onBlur={() => this.setState({ isFocused: false })}
                        autoCapitalize={autoCapitalize}
                    />
                </View>
                <TouchableOpacity onPress={() => onIconBtnPressed()} style={isInvalid === false || !isInvalid ? isFocused ? styles.isFocusedBtnContainer : styles.btnContainer : styles.isInvalidBtnContainer}>
                    {icon}
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
    },
    textInput: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        paddingLeft: 20,
        borderColor: '#E9E9E9',
        borderWidth: 1,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        color: 'black',
        paddingTop: 3,
        paddingBottom: 0,
        height: 50,
        backgroundColor: 'white'
    },
    isInvalid: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        paddingLeft: 20,
        borderColor: 'red',
        color: 'black',
        borderWidth: 1,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        paddingTop: 3,
        paddingBottom: 0,
        height: 50,
    },
    isFocused: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        paddingLeft: 20,
        borderColor: 'black',
        color: 'black',
        borderWidth: 1,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        paddingTop: 3,
        paddingBottom: 0,
        height: 50,
    },
    btnContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#E9E9E9',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        backgroundColor: 'white'
    },
    isFocusedBtnContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'black',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        backgroundColor: 'white'
    },
    isInvalidBtnContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'red',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        backgroundColor: 'white'
    }
})

export default TextInputWithBtn