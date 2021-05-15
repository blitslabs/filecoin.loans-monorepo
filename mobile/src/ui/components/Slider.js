import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import { SliderBox } from "react-native-image-slider-box";

const WIDTH = Dimensions.get('window').width;

export const SliderComponent = ({ images }) => {
  return (
    <SliderBox
      images={images}
      onCurrentImagePressed={null}
      currentImageEmitter={null}
      dotColor="#000"
      inactiveDotColor="#90A4AE"
      ImageComponentStyle={{
        resizeMode: 'contain',
        width: WIDTH * 0.90,
        borderRadius: 8,
        marginTop: 15,
      }}
      dotStyle={{
        width: 10,
        height: 10,
        borderRadius: 15,
        marginLeft: 0,
        marginRight: 0,
        top: 30,
       
      }}
    />
  )
}