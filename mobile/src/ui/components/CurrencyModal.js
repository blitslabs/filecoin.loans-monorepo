import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    View, Text, Dimensions, Pressable, Image, SafeAreaView, StatusBar,
    StyleSheet, Keyboard, TouchableOpacity, Platform, Linking, Alert, ScrollView
} from 'react-native'

// Components
import ActionSheet from "react-native-actions-sheet"
import SecondaryBtn from './SecondaryBtn'
import PrimaryBtn from './PrimaryBtn'

// Icons
import Ionicons from 'react-native-vector-icons/Ionicons'

const supportedCurrencies = ['btc', 'usd', 'mxn', 'cny', 'eur', 'chf', 'jpy', 'cad', 'sgd', 'aud', 'nzd', 'brl', 'gbp', 'php', 'rub', 'inr', 'ars', 'hkd', 'vef', 'clp',]
const screenHeight = Dimensions.get('screen').height;
const windowHeight = Dimensions.get('window').height;
const navbarHeight = screenHeight - windowHeight + StatusBar.currentHeight;

class CurrencyModal extends Component {
    render() {

        const { modalRef, onSelect, onClose, currency } = this.props
        
        return (
            <ActionSheet
                headerAlwaysVisible={true}
                gestureEnabled={false}
                closable={true}
                statusBarTranslucent={false}
                ref={modalRef}
            >
                <ScrollView style={{ marginTop: 10}}>
                    {
                        supportedCurrencies?.filter(c => c !== 'btc').map((c, i) => (
                            <TouchableOpacity key={i} style={styles.currencyContainer} onPress={() => onSelect(c)}>
                                <Text style={styles.currencyText}>{c?.toUpperCase()}</Text>
                                <Text style={styles.iconContainer}>{currency === c ? <Ionicons name="checkmark-circle" color="#32ccdd" size={25} /> : ''}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
                <View style={{ marginBottom: 40, marginHorizontal: 20, marginTop: 10 }}>
                    <PrimaryBtn title="Close" onPress={onClose} />
                </View>
            </ActionSheet>
        )
    }
}

const styles = StyleSheet.create({
    currencyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'whitesmoke',
        flexDirection: 'row'
    },
    currencyText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        color: 'black'
    },
    iconContainer: {
        paddingTop: -5,
        // left: 10,
        position:'absolute',
        right: 20
        // backgroundColor: 'red'
    }
})

function mapStateToProps({ shared }) {
    return {
        currency: shared?.currency
    }
}

export default connect(mapStateToProps)(CurrencyModal)