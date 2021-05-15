import React, { Component } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity, Image
} from 'react-native'

// Icons
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

// Libraries
import currencyFormatter from 'currency-formatter'

// API
import { API } from "@env"

function SelectAssetListItem(props) {
    const { item, onPress }  = props
    return (
        <TouchableOpacity            
            onPress={() => onPress()}
        >
            <View style={styles.tokenContainer}>
                <View style={styles.logoContainer}>
                    <View style={styles.imgCircleBg}>
                        <Image
                            source={{ uri: API + '/static/logo/' + item?.symbol }}
                            style={{ height: 38, width: 38 }}
                        />
                    </View>
                </View>
                <View style={{ flex: 6.5, paddingLeft: 10, }}>
                    <Text style={{ ...styles.label, backgroundColor: 'transparent', marginBottom: -5 }}>{item?.name}</Text>
                    <Text style={styles.labelBold}>{currencyFormatter.format(item.balance?.toString(), { code: 'USD' }).replace('$', '')} {item?.symbol}</Text>
                </View>
                <View style={{ flex: 4, alignItems: 'flex-end' }}>
                    <MaterialIcons name='chevron-right' color='grey' size={25} />
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    tokenContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 8
    },
    logoContainer: {
        flex: 1.5,
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    imgCircleBg: {
        borderRadius: 100,
        padding: 1,
    },
    label: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    labelBold: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14
    },
    textSm: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10
    },
})

export default SelectAssetListItem
