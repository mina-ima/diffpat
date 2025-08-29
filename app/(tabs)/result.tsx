import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle, runOnJS } from 'react-native-reanimated';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ResultScreen() {
  const { image1, diffs } = useLocalSearchParams<{ image1: string; diffs: string }>();
  const [parsedDiffs, setParsedDiffs] = useState<Rect[]>([]);
  const [currentDiffIndex, setCurrentDiffIndex] = useState(-1);

  useEffect(() => {
    if (diffs) {
      const diffsArray: Rect[] = JSON.parse(diffs);
      setParsedDiffs(diffsArray);

      // Start animation after a short delay
      const timer = setTimeout(() => {
        animateDiffs(diffsArray, 0);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [diffs]);

  const animateDiffs = (diffsArray: Rect[], index: number) => {
    if (index < diffsArray.length) {
      setCurrentDiffIndex(index);
      // You can add more complex animations here if needed
      setTimeout(() => {
        animateDiffs(diffsArray, index + 1);
      }, 500); // 0.5 seconds interval
    }
  };

  if (!image1) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Image to Display</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Differences Found!</Text>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image1 }} style={styles.image} />
        {parsedDiffs.map((diff, index) => {
          const isVisible = index <= currentDiffIndex;
          return (
            <Animated.View
              key={index}
              style={[
                styles.diffRect,
                {
                  left: diff.x,
                  top: diff.y,
                  width: diff.width,
                  height: diff.height,
                  opacity: isVisible ? 1 : 0, // Simple fade in
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    width: '90%',
    height: '70%',
    borderWidth: 1,
    borderColor: '#ccc',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Or 'cover' depending on desired behavior
  },
  diffRect: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
});