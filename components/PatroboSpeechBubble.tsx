import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';

interface PatroboSpeechBubbleProps {
  message: string;
}

const PatroboSpeechBubble: React.FC<PatroboSpeechBubbleProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && (
        <Image source={require('@/assets/images/patrobo.png')} style={styles.patroboImage} />
      )}
      <View style={styles.bubble}>
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  patroboImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 10,
  },
  bubble: {
    backgroundColor: '#e0f7fa', // Light blue
    borderRadius: 15,
    padding: 15,
    maxWidth: '70%',
    position: 'relative',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
});

export default PatroboSpeechBubble;