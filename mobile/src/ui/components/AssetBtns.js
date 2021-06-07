import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, FlatList, StyleSheet, SafeAreaView } from 'react-native'

// Icons
import Icon from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons'
import IconFontisto from 'react-native-vector-icons/Fontisto'
import { TouchableOpacity } from 'react-native-gesture-handler'

// SVG
import HorizonIcon from '../../../assets/images/vaporwave.svg'
import ManaIcon from '../../../assets/images/mana.svg'
import AddDollarIcon from '../../../assets/images/add-dollar.svg'
import CardsIcon from '../../../assets/images/cards.svg'
import BankCardsIcon from '../../../assets/images/bank-cards.svg'

class AssetBtns extends Component {
    render() {
        const { shared } = this.props
        const { selectedAsset } = shared
        return (
            <View style={{
                marginHorizontal: 6.8,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',

            }}>
                {

                    selectedAsset === 'BNB' ?
                        <Fragment>
                            <AssetButton
                                title={'ADD BEP-20'}
                                description={'BEP-20 TOKEN'}
                                icon={<AddDollarIcon width={30} height={30} />}
                                onPress={() => this.props.navigation.navigate('AddToken')}
                            />

                        </Fragment>
                        : null
                }
            </View>
        )
    }
}

function mapStateToProps({ shared }) {
    return {
        shared
    }
}

function AssetButton(props) {
    const { onPress, title, description, icon } = props
    return (
        <Pressable
            android_ripple={{
                color: '#000',
                radius: 40,
                borderless: true
            }}
            hitSlop={{
                bottom: 20,
                left: 20,
                right: 20,
                top: 20
            }}
            onPress={() => onPress()}
        >

            <View style={{ alignItems: 'center', backgroundColor: 'white', borderRadius: 50, }}>
                {icon}
                <Text style={{ fontSize: 10, fontFamily: 'Poppins-SemiBold', color: 'black' }}>{title}</Text>
                <Text style={{ fontSize: 8, fontFamily: 'Poppins-Regular', marginTop: -5, color: 'black' }}>{description}</Text>
            </View>
        </Pressable>
    )
}

export default connect(mapStateToProps)(AssetBtns)


