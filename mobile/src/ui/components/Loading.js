import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, StyleSheet, Text, View, Button, StatusBar, Dimensions, SafeAreaView } from 'react-native'
// import { SafeAreaView } from 'react-navigation'

// Components
import PrimaryBtn from '../components/PrimaryBtn'
import SecondaryBtn from '../components/SecondaryBtn'
import BlitsBtn from '../components/BlitsBtn'
import PinCodeInput from '../components/PinCodeInput'

// Actions
import { savePinHash } from '../../actions/auth'

// Libraries
import {
    BallIndicator,
    BarIndicator,
    DotIndicator,
    MaterialIndicator,
    PacmanIndicator,
    PulseIndicator,
    SkypeIndicator,
    UIActivityIndicator,
    WaveIndicator,
} from 'react-native-indicators'
import * as Animatable from 'react-native-animatable'


class Loading extends Component {

    state = {

    }

    componentDidMount() {

    }

    // loadingText = async () => {
    //     this.setState({message: 'Generating Keys...'})
    //     await this.sleep(2000)
    //     this.setState({message: 'Encrypting Wallet...'})
    // }

    viewRef = React.createRef()


    render() {

        const { message } = this.props

        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="black" />
                <View style={styles.container}>

                    <Animatable.Text duration={3000} animation="flash" easing="ease-out" iterationCount="infinite" style={{ textAlign: 'center', top: 100 }}>
                        <Text style={{ color: 'black', fontFamily: 'Poppins-Regular', fontSize: 16, }}>{message}</Text>
                    </Animatable.Text>


                    <View style={{ position: 'absolute' }}>
                        <WaveIndicator color='#32CCDD' waveMode="outline" count={4} size={160} />
                    </View>

                </View>
            </SafeAreaView >
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        // backgroundColor: 'green'
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        // padding: 20,
    },
    pageTitle: {
        fontSize: 22,
        fontFamily: 'Poppins-SemiBold'
    },
    pageSubtitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40
    },
    icon: {
        width: 213 * 0.4,
        height: 235 * 0.4,
        resizeMode: 'stretch',
        marginTop: 0
    }


})

function mapStateToProps({ }) {
    return {

    }
}

export default connect(mapStateToProps)(Loading)