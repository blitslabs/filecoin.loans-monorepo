import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

function PrimaryBtn(props) {

    const { onPress, title, disabled, style } = props

    return (
        <TouchableOpacity onPress={() => onPress()} style={{ ...(disabled === true ? styles.disabledContainer : styles.container), ...style }} disabled={disabled === true ? true : false}>

            <Text style={styles.title}>{title}</Text>

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 50,
        marginBottom: 5
    },
    title: {
        fontFamily: 'Poppins-Regular',
        color: 'white',
        fontSize: 16,
    },
    disabledContainer: {
        backgroundColor: '#7E7E7E',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 50,
        marginBottom: 5
    }
})

export default PrimaryBtn