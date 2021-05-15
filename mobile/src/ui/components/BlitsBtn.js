import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

function BlitsBtn(props) {
    const { onPress, title, disabled, style } = props

    return (
        <TouchableOpacity
            onPress={() => onPress()}
            style={{ ...(disabled === true ? styles.disabledContainer : styles.container), ...style }}
            disabled={disabled === true ? true : false}
        >
            <View>
                <Text style={styles.title}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#32CCDD',
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
        backgroundColor: '#32ccdd8f',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 50,
        marginBottom: 5
    }
})

export default BlitsBtn