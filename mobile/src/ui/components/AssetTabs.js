import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, FlatList, StyleSheet, SafeAreaView } from 'react-native'

// Components
import { TabView, TabBar } from 'react-native-tab-view'
import TxsList from './TxsList'
import TokensList from './TokensList'



const HEIGHT = Dimensions.get('window').height
const WIDTH = Dimensions.get('window').width



class AssetTabs extends Component {

    state = {
        index: 0,
        routes: [
            { key: 'first', title: 'TRANSACTIONS' },
            // { key: 'second', title: 'LOANS' },
            { key: 'third', title: 'TOKENS' },
            
        ],
    }

    renderLabel = (props) => {
        const { shared } = this.props

        if (props.route.title === "TOKENS" && shared?.selectedAsset !== 'FIL') {
            return <View style={{ borderBottomWidth: props.focused ? 2 : 0 }}>
                <Text
                    textBreakStrategy='simple'
                    style={styles.tabLabel}>TOKENS</Text>
            </View>
        }
        
        if (props.route.title === "TRANSACTIONS") {
            return <View style={{ borderBottomWidth: props.focused ? 2 : 0 }}>
                <Text
                    textBreakStrategy='simple'
                    style={styles.tabLabel}>TRANSACTIONS</Text>
            </View>
        }
    }

    renderScene = ({ route }) => {
        switch (route.key) {
            case 'first':
                return (
                    <TxsList navigation={this.props.navigation} />
                );            
            case 'third':
                return (
                    <TokensList navigation={this.props.navigation} />
                );
            
        }
    }

    setIndex = (value) => {
        const { shared, publicKeys, } = this.props
        const { selectedAsset } = shared              
        this.setState({ index: value });
    }


    renderTabBar = props => {
        return (
            <TabBar
                {...props}
                renderLabel={this.renderLabel}
                indicatorStyle={{ backgroundColor: 'transparent' }}
                style={{ backgroundColor: 'transparent' }}
                tabStyle={{
                    minHeight: 30,
                    padding: 0,
                    width: 'auto',
                    marginHorizontal: 6.5,
                }}
            />
        )
    }

    render() {
        return (
            <TabView
                style={{ backgroundColor: 'white' }}
                swipeEnabled={true}
                renderTabBar={this.renderTabBar}
                navigationState={{ index: this.state.index, routes: this.state.routes }}
                renderScene={this.renderScene}
                onIndexChange={this.setIndex}
                initialLayout={{ width: WIDTH }}
                lazy={true}
            />
        )
    }
}

const styles = StyleSheet.create({
    tabLabel: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 11,
        color: "#000",
        // fontWeight: 'bold'
    }
})

function mapStateToProps({ wallet, shared, balances, txs, nftCollections }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        balances,
        txs,
        nftCollections,
        wallet: wallet && wallet.wallet,
    }
}


export default connect(mapStateToProps)(AssetTabs)


