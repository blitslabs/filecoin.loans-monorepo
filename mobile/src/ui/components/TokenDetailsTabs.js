import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions, Pressable, Image, FlatList, StyleSheet, SafeAreaView } from 'react-native'

// Components
import { TabView, TabBar } from 'react-native-tab-view'
import TxsList from './TxsList'
import TokenTxsList from './TokenTxsList'

const HEIGHT = Dimensions.get('window').height
const WIDTH = Dimensions.get('window').width

class TokenDetailsTabs extends Component {

    state = {
        index: 0,
        routes: [
            { key: 'first', title: 'TRANSACTIONS' },
            { key: 'second', title: 'TOKEN INFO' },

        ],
    }

    renderLabel = (props) => {
        if (props.route.title === "TRANSACTIONS") {
            return <View style={{ borderBottomWidth: props.focused ? 2 : 0 }}>
                <Text
                    textBreakStrategy='simple'
                    style={styles.tabLabel}>TRANSACTIONS</Text>
            </View>
        }
        if (props.route.title === "TOKEN INFO") {
            return <View style={{ borderBottomWidth: props.focused ? 2 : 0 }}>
                <Text
                    textBreakStrategy='simple'
                    style={styles.tabLabel}>TOKEN INFO</Text>
            </View>
        }
    }

    renderScene = ({ route }) => {
        const { shared, tokens } = this.props
        const { selectedToken } = shared
        const token = tokens[selectedToken]

        switch (route.key) {
            case 'first':
                return (
                    <TokenTxsList />
                );
            case 'second':
                return (
                    <View style={{ backgroundColor: 'transparent', flex: 1, paddingLeft: 8 }}>
                        <Text style={styles.detailsTitle}>Name: <Text style={styles.detailsValue}>{token.name}</Text></Text>
                        <Text style={styles.detailsTitle}>Symbol: <Text style={styles.detailsValue}>{token.symbol}</Text></Text>
                        <Text style={styles.detailsTitle}>Contract Address: <Text style={styles.detailsValue}>{token.contractAddress}</Text></Text>
                        {
                            token.chainType === 'ONE' && (
                                <Fragment>
                                    <Text style={styles.detailsTitle}>Total Supply: <Text style={styles.detailsValue}>{token.totalSupply}</Text></Text>
                                    <Text style={styles.detailsTitle}>Decimals: <Text style={styles.detailsValue}>{token.decimals}</Text></Text>
                                </Fragment>
                            )
                        }

                        <Text style={styles.detailsTitle}>Blockchain: <Text style={styles.detailsValue}>{token.chainType}</Text></Text>
                        {
                            token.chainType === 'ONE' && <Text style={styles.detailsTitle}>Shard: <Text style={styles.detailsValue}>{token.shard}</Text></Text>
                        }
                    </View>
                );

        }
    }

    setIndex = (value) => {
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
    },
    detailsTitle: {
        fontFamily: 'Poppins-Regular',
        marginTop: 5,
    },
    detailsValue: {
        fontFamily: 'Poppins-SemiBold'
    }
})

function mapStateToProps({ wallet, shared, balances, txs, tokens }) {
    return {
        publicKeys: wallet && wallet.publicKeys,
        shared,
        balances,
        txs,
        tokens,
    }
}


export default connect(mapStateToProps)(TokenDetailsTabs)


