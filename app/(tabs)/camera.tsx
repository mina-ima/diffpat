import { useRouter } from 'expo-router';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Camera, CameraView } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';

type Photo = string | null;

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [image1, setImage1] = useState<Photo>(null);
  const [image2, setImage2] = useState<Photo>(null);
  const [currentPhoto, setCurrentPhoto] = useState<Photo>(null);
  const [step, setStep] = useState(1); // 1 for image1, 2 for image2

  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />; // Permissions still loading
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync();
      if (photoData) {
        const manipulatedImage = await manipulateAsync(
          photoData.uri,
          [{ resize: { width: 1080 } }],
          { compress: 0.9, format: SaveFormat.JPEG }
        );
        setCurrentPhoto(manipulatedImage.uri);
      }
    }
  };

  const handleConfirm = () => {
    if (step === 1) {
      setImage1(currentPhoto);
      setCurrentPhoto(null);
      setStep(2);
    } else {
      const finalImage2 = currentPhoto;
      setImage2(finalImage2);
      setCurrentPhoto(null);
      router.push({ pathname: '/select-area', params: { image1: image1, image2: finalImage2 } });
    }
  };

  const handleRetake = () => {
    setCurrentPhoto(null);
  };

  const handleReset = () => {
    setImage1(null);
    setImage2(null);
    setCurrentPhoto(null);
    setStep(1);
  };

  // If a photo has been taken, show the preview and options
  if (currentPhoto) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: currentPhoto }} style={styles.preview} />
        <View style={styles.buttonRow}>
          <Button title="Retake" onPress={handleRetake} />
          <Button title={`Confirm Image ${step}`} onPress={handleConfirm} />
        </View>
      </View>
    );
  }

  // Main camera view
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.topControls}>
            <Text style={styles.promptText}>
              {step === 1 ? 'Take the 1st photo' : 'Take the 2nd photo'}
            </Text>
        </View>
        <View style={styles.bottomControls}>
            <View style={styles.imagePreviewContainer}>
                {image1 && <Image source={{uri: image1}} style={styles.smallPreview} />}
            </View>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <View style={styles.innerButton} />
            </TouchableOpacity>
            <View style={styles.imagePreviewContainer}>
                {image2 && <Image source={{uri: image2}} style={styles.smallPreview} />}
            </View>
        </View>
        { (image1 || image2) &&
            <View style={styles.resetButtonContainer}>
                <Button title="Reset" onPress={handleReset} color="#ff4444" />
            </View>
        }
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topControls: {
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    promptText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
    },
    innerButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#000',
    },
    preview: {
        flex: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: 'white',
    },
    imagePreviewContainer: {
        width: 60,
        height: 60,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'white',
        overflow: 'hidden',
    },
    smallPreview: {
        width: '100%',
        height: '100%',
    },
    resetButtonContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
    }
});