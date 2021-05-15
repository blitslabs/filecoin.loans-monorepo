import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { View, Dimensions, TextInput, Text, Image, Pressable, SafeAreaView, StyleSheet, TouchableOpacity, Linking } from 'react-native'

// Components
import PrimaryBtn from '../components/PrimaryBtn'
import SecondaryBtn from '../components/SecondaryBtn'

// Libraries
import * as Animatable from 'react-native-animatable'


// Actions
import { walletSaved } from '../../actions/auth'

class TxCompletedView extends Component {

    imageRef = React.createRef()

    componentDidMount() {

    }

    handleContinueBtn = () => {
        console.log('RETURN_BTN')
        const { navigation } = this.props
        navigation.reset({
            routes: [{ name: 'Wallet' }]
        })
    }

    render() {
        const { route } = this.props
        const { txStatus, explorerUrl, message } = route.params
        const title = txStatus === 'OK' ? 'Transaction Sent' : 'Transaction Error'

        console.log(this.props)
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, paddingHorizontal: 40, }}>
                    <Text style={[styles.text], { fontWeight: 'bold', fontSize: 24, paddingTop: 50, textAlign: 'center', zIndex: 200 }}>{title}</Text>

                </View>
                <View style={{ backgroundColor: 'transparent', flex: 4 }}>

                    {
                        txStatus === 'OK'
                            ?
                            <Fragment>
                                <Image style={[{ ...styles.img }, { top: 0, zIndex: -1 }]} resizeMode="contain" source={require('../../../assets/images/success.png')} />
                                <TouchableOpacity onPress={() => Linking.openURL(explorerUrl).catch(err => console.log('Couldn\'t load page', err))}>
                                    <Text style={[styles.text], { fontSize: 18, textAlign: 'center', zIndex: 200 }}>View Tx Details</Text>
                                </TouchableOpacity>
                            </Fragment>
                            :
                            <Fragment>
                                <Image style={[{ ...styles.img }, { top: 0, zIndex: -1 }]} resizeMode="contain" source={require('../../../assets/images/error.png')} />
                                <Text style={[styles.text], { fontSize: 14, textAlign: 'center', zIndex: 200 }}>{message}</Text>
                            </Fragment>
                    }
                </View>
                {/* <Text style={[styles.text], { marginTop: 5 }}>one1yxxxxxu7vtgfff65mcqvhsjxpadrygwc25k37zx</Text> */}
                <View style={{ flex: 1, backgroundColor: 'transparent', width: '100%', justifyContent: 'center' }}>
                    <PrimaryBtn title="Return to Wallet" onPress={this.handleContinueBtn} />
                </View>

            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'white',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    text: {
        fontFamily: 'Poppins-Regular'
    },
    imgContainer: {
        // alignItems: 'flex-start',
        // marginTop: 30,
        // width: Dimensions.get('window').width,
        backgroundColor: 'red',

    },
    img: {
        width: Dimensions.get('window').width + 40,
        // position: 'absolute',
        flex: 1,

    },
    btnsContainer: {
        backgroundColor: 'transparent',
        width: 200,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20
    },
    textBtn: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14
    }
})

function mapStateToProps({ }) {
    return {

    }
}

export default connect(mapStateToProps)(TxCompletedView)
