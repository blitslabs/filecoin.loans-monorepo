import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

function SecondaryBtn(props) {

    const { onPress, title } = props

    return (
        <TouchableOpacity onPress={() => onPress()} style={styles.container}>
            <View>
                <Text style={styles.title}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 50,
        marginBottom: 5,
        borderColor: 'black'
    },
    title: {
        fontFamily: 'Poppins-Regular',
        color: 'black',
        fontSize: 16,
    }
})

export default SecondaryBtn