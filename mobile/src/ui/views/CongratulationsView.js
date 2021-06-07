import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Dimensions, TextInput, Text, Image, Pressable, SafeAreaView, StyleSheet, alert, Alert } from 'react-native'

// Components
import PrimaryBtn from '../components/PrimaryBtn'
import BlitsBtn from '../components/BlitsBtn'
import SecondaryBtn from '../components/SecondaryBtn'
import MyStatusBar from '../components/MyStatusBar'

// Libraries
import * as Animatable from 'react-native-animatable'

// Actions
import { walletSaved } from '../../actions/auth'

class CongratulationsView extends Component {

    imageRef = React.createRef()

    componentDidMount() {

    }

    handleBackupBtn = () => {
        console.log('BACKUP_BTN')
        const { navigation, dispatch } = this.props
        dispatch(walletSaved(true))
        navigation.navigate('BackupWalletIntro')
    }

    handleContinueBtn = () => {
        console.log('FINISH_BTN')
        const { dispatch } = this.props
        
        Alert.alert(
            'Warning',
            'Are you sure you want to continue without backing up your seed phrase? Your wallet will be unrecoverable if your fail to do so and you uninstall the app or lose your phone.',
            [
                {
                    text: 'Yes, I want to continue without backup',
                    onPress: () => this.handleContinueWithoutBackup(),
                    style: 'cancel'
                },
                {
                    text: 'No, I want to back up my wallet now',
                    onPress: () => this.handleBackupBtn()
                }
            ]
        )
    }

    handleContinueWithoutBackup = () => {
        const { dispatch, navigation } = this.props
        dispatch(walletSaved(true))
        navigation.replace('Wallet')
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <MyStatusBar backgroundColor="black" />
                <View style={{ flex: 1, paddingHorizontal: 40, }}>
                    <Text style={[styles.text], { fontWeight: 'bold', fontSize: 24, paddingTop: 50, textAlign: 'center', zIndex: 200 }}>Congratulations!</Text>
                    <Text style={[styles.text], { fontSize: 18, textAlign: 'center', zIndex: 200 }}>Your Wallet is ready</Text>
                </View>
                <View style={{ backgroundColor: 'transparent', flex: 4 }}>
                    <Animatable.View ref={this.imageRef} duration={3000} animation="rubberBand" easing="ease-out" iterationCount="infinite">
                        <Image style={styles.img} resizeMode="contain" source={require('../../../assets/images/congratulations_circle.png')} />
                    </Animatable.View>
                    <Image style={[{ ...styles.img }, { position: 'absolute', top: -300, zIndex: -1 }]} resizeMode="contain" source={require('../../../assets/images/congratulations_bg.png')} />
                </View>
                {/* <Text style={[styles.text], { marginTop: 5 }}>one1yxxxxxu7vtgfff65mcqvhsjxpadrygwc25k37zx</Text> */}
                <View style={{ flex: 1, backgroundColor: 'transparent', width: '100%', justifyContent: 'center' }}>
                    <BlitsBtn title="Backup Wallet" onPress={this.handleBackupBtn} style={{ marginBottom: 8 }} />
                    <PrimaryBtn title="Finish Setup" onPress={this.handleContinueBtn} />
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

export default connect(mapStateToProps)(CongratulationsView)
