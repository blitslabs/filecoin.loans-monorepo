import React from 'react';
import {
    Dimensions,
    Pressable,
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity
} from 'react-native';

// Icons
import Icon from 'react-native-vector-icons/Ionicons'
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'

const WIDTH = Dimensions.get('window').width;

function HeaderComponent({
    title,
    SubCenterTitle,
    rightComponentTitle,
    centerComponentStyle,
    leftIconColor,
    onLeftComponentPress,
    headerStyle,
    subCenterComponentStyle,
    customLeftComponent,
    onRightComponentPress,
    rightIcon,
    onRightIconPress,
    rightIconStyle,
    rightComponentStyle,
    navigation
}) {
    const {
        subCenterComponentStyles,
        centerComponentStyles,
        headerComponentStyle,
        leftComponentStyles,
        rightComponentStyles,
    } = styles;

    return (
        <View
            style={[headerComponentStyle, { ...headerStyle }]}>
            {customLeftComponent ?
                <Pressable
                    onPress={() => onLeftComponentPress ? onLeftComponentPress() : navigation.goBack()}
                    hitSlop={{
                        bottom: 20,
                        left: 20,
                        right: 20,
                        top: 20
                    }}
                    android_ripple={{
                        radius: 40,
                        color: '#000',
                        borderless: true
                    }}
                    style={[leftComponentStyles,]}
                >
                    <IconMaterialCommunity name="chevron-left" size={40} color={leftIconColor ? leftIconColor : "black"} />
                </Pressable>
                :
                <Pressable
                    hitSlop={{
                        bottom: 20,
                        left: 20,
                        right: 20,
                        top: 20
                    }}
                    android_ripple={{
                        radius: 40,
                        color: '#000',
                        borderless: true
                    }}
                    onPress={() => navigation.openDrawer()}
                    style={[leftComponentStyles]}
                >
                    <Icon name="menu" size={40} color="black" />
                </Pressable>
            }
            <View style={{ width: typeof rightComponentTitle !== 'undefined' ? '45%' : '50%', alignSelf: 'center', alignItems: 'center' }}>
                <Text
                    numberOfLines={2}
                    style={[
                        centerComponentStyles,
                        { ...centerComponentStyle, },
                    ]}>
                    {title}
                </Text>
            </View>
            {
                typeof SubCenterTitle !== 'undefined' ? (
                    <Text
                        style={[subCenterComponentStyles, { ...subCenterComponentStyle }]}
                    >
                        {SubCenterTitle}
                    </Text>
                ) : null
            }
            <TouchableOpacity
                onPress={onRightComponentPress}
                style={{ position: 'absolute', right: 10, top: 5 }}
            >
                <Text
                    numberOfLines={2}
                    style={[
                        styles.rightComponentStyles,
                        rightComponentStyle,
                    ]}>
                    {rightComponentTitle}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onRightIconPress}
                style={{ position: 'absolute', right: 10, ...rightIconStyle }}
            >
                {rightIcon}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    headerComponentStyle: {
        // height: 60,
        // width: WIDTH,
        justifyContent: 'center',
        // backgroundColor: '#fff',
        // borderBottomColor: '#88919e',
    },
    textStyle: {
        fontSize: 14,
    },
    subCenterComponentStyles: {
        alignSelf: 'center',
        fontFamily: 'Poppins-Light',
        marginTop: -5
    },
    rightComponentStyles: {
        // position: 'absolute',
        marginRight: 0,
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        color: '#32CCDD',
        // backgroundColor: 'red'
    },
    centerComponentStyles: {
        alignSelf: 'center',
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        // fontWeight: 'bold',
        color: 'black'
    },
    leftComponentStyles: {
        marginLeft: 10,
        position: 'absolute',
    },
    activityIndicatorStyles: {
        position: 'absolute',
        marginLeft: 319,
        marginTop: 7,
    },

});

export default HeaderComponent;
