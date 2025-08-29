import React from 'react';
import { Image, ImageProps } from 'expo-image';
import { StyleSheet } from 'react-native';

type Props = ImageProps & {
  // Add any custom props here
};

const ImageView = (props: Props) => {
  return (
    <Image
      style={[styles.image, props.style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0', // Placeholder color
  },
});

export default ImageView;
