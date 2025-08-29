import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle, withRepeat, runOnJS } from 'react-native-reanimated';

interface InvestigationAnimationProps {
  image1Uri: string;
  image2Uri: string;
  onAnimationEnd: () => void;
}

const InvestigationAnimation: React.FC<InvestigationAnimationProps> = ({ image1Uri, image2Uri, onAnimationEnd }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const currentImage = useSharedValue(0); // 0 for image1, 1 for image2

  const image1Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: currentImage.value === 0 ? scale.value : 1 }],
      opacity: currentImage.value === 0 ? opacity.value : 0,
    };
  });

  const image2Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: currentImage.value === 1 ? scale.value : 1 }],
      opacity: currentImage.value === 1 ? opacity.value : 0,
    };
  });

  useEffect(() => {
    const animate = () => {
      'worklet';
      scale.value = withRepeat(
        withTiming(1.2, { duration: 1000, easing: Easing.linear }),
        -1, // Repeat indefinitely
        true // Reverse animation
      );
      opacity.value = withRepeat(
        withTiming(1, { duration: 500, easing: Easing.linear }),
        -1, // Repeat indefinitely
        true // Reverse animation
      );

      // Alternate images every 1 second
      let count = 0;
      const interval = setInterval(() => {
        'worklet';
        currentImage.value = currentImage.value === 0 ? 1 : 0;
        count++;
        if (count >= 3) { // After 3 cycles (3 seconds total) - 1 image per second
          clearInterval(interval);
          runOnJS(onAnimationEnd)();
        }
      }, 1000);
    };

    animate();

    return () => {
      // Cleanup if component unmounts before animation ends
      // This part is tricky with worklets, might need a ref to clearInterval
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image source={{ uri: image1Uri }} style={[styles.backgroundImage, image1Style]} />
      <Animated.Image source={{ uri: image2Uri }} style={[styles.backgroundImage, image2Style]} />
      <View style={styles.overlay}>
        <Text style={styles.text}>調査中…</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default InvestigationAnimation;
