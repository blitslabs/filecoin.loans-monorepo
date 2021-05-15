import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, StyleSheet } from 'react-native'
import IonIcon from 'react-native-vector-icons/Ionicons'

class FormAlertMsg extends Component {
    render() {

        const { status, msg, containerStyle, textStyle } = this.props

        return (
            <View style={[styles.defaultContainer, status === true ? styles.successMsgContainer : styles.errorMsgContainer, containerStyle]}>
                
                
                <Text style={[status === true ? styles.successMsg : styles.errorMsg, textStyle]}>
                    {msg}
                </Text>
                <View style={styles.iconContainer}>
                    {
                        status === true
                        ? <IonIcon name="checkmark-circle-outline" color="#32ccdd" size={16} />
                        : <IonIcon name="alert-circle-outline" color="#d6029a" size={16} />
                    }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    defaultContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconContainer: {
        marginLeft: 5
    },
    successMsgContainer: {
        marginTop: 0,
        alignItems: 'center',
        backgroundColor: '#32ccdd14',
        borderColor: '#32ccdd',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 10,

    },
    successMsg: {
        fontFamily: 'Poppins-Regular',
        color: '#32ccdd',
        fontSize: 12
    },
    errorMsgContainer: {
        marginTop: 0,
        alignItems: 'center',
        backgroundColor: '#d6029a36',
        borderColor: '#d6029a',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 10,

    },
    errorMsg: {
        fontFamily: 'Poppins-Regular',
        color: '#d6029a',
        fontSize: 12
    }
})

export default FormAlertMsg