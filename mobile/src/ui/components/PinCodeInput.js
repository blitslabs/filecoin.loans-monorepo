import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import SmoothPinCodeInput from 'react-native-smooth-pincode-input'

function PinCodeInput(props) {
    const { pin, onTextChange, onFulfill, error, autofocus } = props

    return (
        <SmoothPinCodeInput
            cellSize={55}
            codeLength={6}
            value={pin}
            onTextChange={onTextChange}
            onFulfill={onFulfill}
            cellStyle={styles.cellStyle}
            cellStyleFocused={styles.cellStyleFocused}
            textStyle={styles.textStyle}
            textStyleFocused={styles.textStyleFocused}
            autoFocus={autofocus ? true : false}
            animated={true}
            animationFocused='rotate'
            password={true}
            maskDelay={1000}
        />
    )
}

const styles = StyleSheet.create({
    cellStyle: {
        backgroundColor: '#F1F5F7',
        borderRadius: 10,
    },
    cellStyleFocused: {
        borderColor: '#32CCDD',
        backgroundColor: '#7CD7E1',
    },
    textStyle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 20,
        color: 'black'
    },
    textStyleFocused: {
        color: 'white'
    },
})

export default PinCodeInput