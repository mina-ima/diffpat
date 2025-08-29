import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet, Image, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useState } from 'react';
import { Slider } from 'react-native-paper';
import Button from '@/components/common/Button';

export default function SelectAreaScreen() {
  const router = useRouter();
  const { image1, image2 } = useLocalSearchParams<{ image1: string; image2: string }>();

  const start = useSharedValue({ x: 0, y: 0 });
  const offset = useSharedValue({ x: 0, y: 0 });
  const [selection, setSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [sensitivity, setSensitivity] = useState(50);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      setSelection(null); // Reset on new drag
    })
    .onStart((event) => {
      start.value = { x: event.x, y: event.y };
      offset.value = { x: event.x, y: event.y };
    })
    .onUpdate((event) => {
      offset.value = {
        x: event.x,
        y: event.y,
      };
    })
    .onEnd(() => {
      const newSelection = {
        x: Math.min(start.value.x, offset.value.x),
        y: Math.min(start.value.y, offset.value.y),
        width: Math.abs(start.value.x - offset.value.x),
        height: Math.abs(start.value.y - offset.value.y),
      };
      // Enforce minimum size
      if (newSelection.width >= 100 && newSelection.height >= 100) {
        setSelection(newSelection);
      } else {
        setSelection(null); // Or show an error message
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const left = Math.min(start.value.x, offset.value.x);
    const top = Math.min(start.value.y, offset.value.y);
    const width = Math.abs(start.value.x - offset.value.x);
    const height = Math.abs(start.value.y - offset.value.y);

    return {
      left: left,
      top: top,
      width: width,
      height: height,
      position: 'absolute',
      borderWidth: 2,
      borderColor: 'red',
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
    };
  });

  const handleCompare = () => {
    // TODO: Navigate to results screen in a later phase
    console.log('Proceeding with:', { selection, sensitivity, image1, image2 });
    // For now, just go back to home
    router.push('/(tabs)');
  }

  if (!image1) {
    return <Text>Image not found</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>1. Draw a rectangle on the area to compare.</Text>
      <GestureDetector gesture={panGesture}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: image1 }} style={styles.image} />
          <Animated.View style={animatedStyle} />
          {selection && (
            <View style={[styles.selection, { 
              left: selection.x, 
              top: selection.y, 
              width: selection.width, 
              height: selection.height 
            }]} />
          )}
        </View>
      </GestureDetector>
      
      <View style={styles.controlsContainer}>
        <Text style={styles.instructions}>2. Set the detection sensitivity.</Text>
        <Slider
          style={styles.slider}
          value={sensitivity}
          onValueChange={setSensitivity}
          minimumValue={0}
          maximumValue={100}
          step={1}
        />
        <Text>{Math.round(sensitivity)}%</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          disabled={!selection}
          onPress={handleCompare}
        >
          Compare This Area
        </Button>
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
    padding: 10,
  },
  instructions: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
  imageContainer: {
    width: '95%',
    height: '50%',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selection: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'green', // Final selection color
    backgroundColor: 'transparent',
  },
  controlsContainer: {
    width: '90%',
    marginTop: 20,
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  buttonContainer: {
    marginTop: 20,
  }
});
