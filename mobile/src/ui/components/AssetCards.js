import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, FlatList, StyleSheet, SafeAreaView, Platform, Alert } from 'react-native'
import { SliderComponent } from './Slider'

import CardStack, { Card } from 'react-native-card-stack-swiper'
import Swiper from 'react-native-deck-swiper'

// Components
import AssetBtns from './AssetBtns'
import AssetTabs from './AssetTabs'
import Loading from './Loading'

// Icons
import Icon from 'react-native-vector-icons/Feather'
import IconAntDesign from 'react-native-vector-icons/AntDesign'
import IconFontAwesome from 'react-native-vector-icons/FontAwesome'
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons'
import { TouchableOpacity } from 'react-native-gesture-handler'

// Librariers
import SplashScreen from 'react-native-splash-screen'
import { ASSETS } from '../../crypto/index'
import currencyFormatter from 'currency-formatter'
import BigNumber from 'bignumber.js'

// Actions
import { setSelectedAsset } from '../../actions/shared'

class AssetCards extends Component {
  state = {

    cards: Object.values(ASSETS),

  };

  componentDidMount() {
    this.props.cardStackRef.current.jumpToCardIndex('ONE')
  }

  onSend = () => {
    console.log('SEND_BTN')
    const { navigation, shared } = this.props
    if (shared.selectedAsset === 'ONE') {
      navigation.push('SendONE');
      return
    }
    else if (shared?.selectedAsset === 'FIL') {
      navigation.push('SendFIL')
      return
    }

    navigation.push('Send')
  }

  onReceive = () => {
    console.log('RECEIVE_BTN')
    this.props.navigation.navigate('Receive');
  }

  handleOnSwiped = (index) => {
    const { dispatch } = this.props
    const ASSETS_LIST = ['ONE', 'ETH', 'BNB', 'FIL']
    if (index + 1 >= ASSETS_LIST.length) {
      dispatch(setSelectedAsset(Object.values(ASSETS)[0].symbol))
      return
    }
    dispatch(setSelectedAsset(Object.values(ASSETS)[index + 1].symbol))
  }

  onHistory = () => {
    console.log('HISTORY_BTN')
    this.props.navigation.navigate('History')
  }

  onStake = () => {
    this.props.navigation.navigate('StakeONE')
  }

  render() {

    const { publicKeys, shared, balances, cardIndex, prices } = this.props

    if (!publicKeys || !shared || !balances) {
      return <Loading />
    }
    const selectedAsset = shared.selectedAsset ? shared.selectedAsset : 'ONE'
    const assetBalance = balances[publicKeys[selectedAsset]] !== undefined ? balances[publicKeys[selectedAsset]].total_balance : 0
    const assetPrice = prices[selectedAsset] !== undefined ? prices[selectedAsset][shared?.currency] : 0
    const balanceValue = BigNumber(assetBalance).multipliedBy(assetPrice).toString()
    return (
      <View style={styles.safeArea}>

        <View style={{ height: Dimensions.get('window').height * 0.28, maxHeight: 235 }}>

          <Swiper
            cards={['ETH', 'BNB', 'FIL']}
            renderCard={(card) => {
              const img = card === 'ETH' ? <Image style={styles.cardImage} source={require(`../../../assets/images/bg2.png`)} />
                  : card === 'BNB' ? <Image style={styles.cardImage} source={require(`../../../assets/images/bg4.png`)} />
                    : card === 'FIL' ? <Image style={styles.cardImage} source={require(`../../../assets/images/bg6.jpg`)} />
                      : <Image style={styles.cardImage} source={require(`../../../assets/images/bg5.jpg`)} />

              return (
                <View style={styles.cardContainer}>
                  {img}
                  <View style={{ position: 'absolute', width: '100%', paddingHorizontal: 20, paddingVertical: 20, backgroundColor: 'transparent', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                    <Text style={[styles.cardText, { fontSize: 11 }]}>{publicKeys[selectedAsset]}</Text>
                    <Text style={[styles.cardText, { fontFamily: 'Poppins-SemiBold', fontSize: 26, marginTop: 5, lineHeight: 30 }]}>{ASSETS[selectedAsset]?.name} </Text>
                    {/* <Text style={[styles.cardText, { fontSize: 18 }]}>{selectedAsset} {assetBalance}</Text> */}
                  </View>

                </View>
              )
            }}
            stackSize={2}
            onSwiped={(cardIndex) => { console.log(cardIndex) }}
            backgroundColor="white"
            infinite={true}
            verticalSwipe={false}
            stackSeparation={-5}
            onSwiped={this.handleOnSwiped}
            cardIndex={cardIndex}
            ref={this.props.cardStackRef}
            onTapCard={(value) => console.log(value)}
            animateOverlayLabelsOpacity={true}
          >
          </Swiper>
        </View>
        <View style={{ position: 'absolute', marginTop: Dimensions.get('window').height * 0.11, paddingLeft: Platform.OS === 'ios' ? 42 : 42, paddingVertical: 20, backgroundColor: 'transparent', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <Text style={[styles.cardText, { fontSize: 18 }]}>{selectedAsset} {assetBalance}</Text>
        </View>
        <View style={{
          width: Dimensions.get('window').width - 80,
          marginHorizontal: 6.8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignSelf: 'center',
          // bottom: 20,
          // zIndex: 200,
          position: 'absolute',
          marginTop: Dimensions.get('window').height * 0.20,
          // backgroundColor: 'green'
        }}>
          <TouchableOpacity onPress={() => this.onSend()}  >
            <View style={{ alignItems: 'center', }} >
              <Icon name="arrow-up-right" size={30} color="white" />
              <Text style={{ color: '#fff' }}>SEND</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onReceive()}  >
            <View style={{ alignItems: 'center' }}>
              <Icon name="arrow-down-left" size={30} color="white" />
              <Text style={{ color: '#fff' }}>RECEIVE</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onHistory()}  >
            <View style={{ alignItems: 'center' }}>
              <Icon name="clock" size={25} color="white" />
              <Text style={{ color: '#fff', marginTop: 5 }}>HISTORY</Text>
            </View>
          </TouchableOpacity>
         

        </View>
        <View style={{ marginTop: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: 'transparent', }}>
          <IconFontAwesome name="circle" color={this.props.shared.selectedAsset === Object.values(ASSETS)[0].symbol ? 'black' : '#B9BDBE'} size={8} style={{ marginRight: 5 }} />
          <IconFontAwesome name="circle" color={this.props.shared.selectedAsset === Object.values(ASSETS)[1].symbol ? 'black' : '#B9BDBE'} size={8} style={{ marginRight: 5 }} />
          <IconFontAwesome name="circle" color={this.props.shared.selectedAsset === Object.values(ASSETS)[2].symbol ? 'black' : '#B9BDBE'} size={8} style={{ marginRight: 5 }} />
          
        </View>


        <View style={{ marginTop: 20, marginBottom: 10, justifyContent: 'center', backgroundColor: 'transparent', paddingHorizontal: 10 }}>
          <AssetBtns navigation={this.props.navigation} />
        </View>

        <View style={{ marginTop: 0, flex: 4, paddingHorizontal: 20, }}>
          <AssetTabs navigation={this.props.navigation} />
        </View>

      </View >
    )
  }
}

function mapStateToProps({ wallet, shared, balances, prices }) {
  return {
    publicKeys: wallet && wallet.publicKeys,
    shared,
    balances,
    prices
  }
}

export default connect(mapStateToProps)(AssetCards)

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 0
  },
  cardStack: {
    alignItems: 'center',


    // justifyContent: 'center'
  },
  card: {
    // backgroundColor: 'pink',
    // width: Dimensions.get('window').width - 20,
    alignItems: 'center',
    // marginTop: 15
  },
  cardContainer: {
    // width: Dimensions.get('window').width - 35,
    // height: Dimensions.get('window').height * 0.28,
    // flex: 1,
    // backgroundColor: 'yellow',
    // width: Dimensions.get('window').width - 35,
    height: Dimensions.get('window').height * 0.28,
    top: -50,
    left: Dimensions.get('window').width * (Platform.OS === 'ios' ? (0) : (0))
  },
  cardImage: {
    // resizeMode:'contain',
    // position: 'relative',
    width: Dimensions.get('window').width * 0.90,
    height: Dimensions.get('window').height * 0.28,
    maxHeight: 235,
    borderRadius: 10,

  },
  cardText: {
    color: 'white',
    fontFamily: 'Poppins-Regular',

  }
})

function CardAccountDetails(props) {
  return (
    <View style={{ position: 'absolute', width: '100%', paddingHorizontal: 22, paddingVertical: 20, backgroundColor: 'transparent', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      <Text style={[styles.cardText, { fontSize: 11.5 }]}>{props.address}</Text>
      <Text style={[styles.cardText, { fontFamily: 'Poppins-SemiBold', fontSize: 26, marginTop: 5, lineHeight: 30 }]}>{props.assetName}</Text>
      <Text style={[styles.cardText, { fontSize: 18 }]}>{props.assetSymbol} {props.balance}</Text>
    </View>
  )
}



