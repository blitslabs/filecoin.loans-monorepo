import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import Modal from 'react-native-modal'

// Libraries
import moment from 'moment'
import currencyFormatter from 'currency-formatter'

// Components
import CollectibleModal from '../components/CollectibleModal'

// Icons
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const WIDTH = Dimensions.get('window').width

// Actions
import { setSelectedCollectible } from '../../actions/shared'

// API

import { API } from '@env'

class CollectiblesList extends Component {

    state = {
        showCollectibleModal: false,
    }

    handleTokenBtn = (tokenId) => {
        const { navigation, dispatch } = this.props
        // dispatch(setSelectedToken(contractAddress))
        // navigation.navigate('TokenDetails')
        this.setState({ showCollectibleModal: true })
        dispatch(setSelectedCollectible(tokenId))
    }

    handleCloseModal = () => this.setState({ showCollectibleModal: false })

    render() {
        const { publicKeys, collectibles, shared } = this.props
        const { selectedAsset } = shared
        const collectiblesList = collectibles ? Object.values(collectibles).filter(c => c.blockchain == selectedAsset) : []

        if (!collectiblesList || collectiblesList.length === 0) {
            return (
                <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ opacity: 0.4 }}>No collectibles found</Text>
                </View>
            )
        }

        return (
            <Fragment>
                <FlatList
                    contentContainerStyle={{ marginLeft: WIDTH * 0.018 }}
                    data={collectiblesList}
                    renderItem={({ item, index }) => {

                        return (
                            <TouchableOpacity key={index} onPress={() => this.handleTokenBtn(item?.contractAddress + '-' + item?.token_id)}>
                                <View style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 0, }}>
                                    <View style={{ flex: 2, alignItems: 'flex-start', justifyContent: 'center', backgroundColor: 'white' }}>

                                        <Image
                                            source={{ uri: item?.image_thumbnail_url }}
                                            style={{ height: 48, width: 48, borderRadius: 50, overlayColor: 'white' }}
                                        />
                                        {/* <Ionicons name={'cube-outline'} size={20} color="#5ef3b9" /> */}

                                    </View>
                                    <View style={{ flex: 8, paddingLeft: 10, }}>
                                        <Text style={styles.labelBold}>{item?.name}</Text>
                                        <Text style={{ ...styles.label, backgroundColor: 'transparent', marginBottom: -5, fontSize: 10 }}>{item?.description?.replace(/(\r\n|\n|\r)/gm, "")}</Text>
                                    </View>
                                    <View style={{ flex: 2, alignItems: 'flex-end' }}>
                                        <FontAwesome name='expand' size={18} color='grey' />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                    keyExtractor={(item, index) => index.toString()}
                />

                <Modal
                    isVisible={this.state.showCollectibleModal}
                    onSwipeComplete={this.handleCloseModal}
                    onBackButtonPress={this.handleCloseModal}
                    swipeDirection={'down'}
                    propagateSwipe
                    style={{ justifyContent: 'flex-end', margin: 0 }}
                    animationIn='slideInUp'
                    animationOut='slideOutDown'
                >
                    <CollectibleModal handleCloseModal={this.handleCloseModal} />
                </Modal>

            </Fragment>
        )
    }
}

const styles = StyleSheet.create({
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
    imgCircleBg: {
        borderRadius: 100,
        padding: 0,
        backgroundColor: 'transparent'
    },
    sentCircleBg: {
        borderRadius: 100,
        padding: 8,
        backgroundColor: '#D40399',
    }
})

function mapStateToProps({ wallet, shared, collectibles, prices }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        collectibles,
        prices
    }
}

export default connect(mapStateToProps)(CollectiblesList)