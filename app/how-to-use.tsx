import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import React from 'react';

export default function HowToUseScreen() {
  const steps = [
    {
      title: '1. 写真を2枚撮ろう',
      description: '1枚目と2枚目の写真を撮影します。',
      image: require('@/assets/images/placeholder-step1.png'), // Placeholder
    },
    {
      title: '2. どこを調べたいか選ぼう',
      description: '指で画像をドラッグして、比較したい範囲を選択します。',
      image: require('@/assets/images/placeholder-step2.png'), // Placeholder
    },
    {
      title: '3. 感度を調整しよう',
      description: '差分検出の感度をスライダーで調整します。',
      image: require('@/assets/images/placeholder-step3.png'), // Placeholder
    },
    {
      title: '4. 調査ボタンを押してね',
      description: '「Compare This Area」ボタンを押して、調査を開始します。',
      image: require('@/assets/images/placeholder-step4.png'), // Placeholder
    },
    {
      title: '5. パトロボが間違いを見つけてくれるよ！',
      description: 'パトロボが画像を分析し、間違いを赤枠で表示します。',
      image: require('@/assets/images/placeholder-step5.png'), // Placeholder
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>使い方ガイド</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Image source={step.image} style={styles.stepImage} />
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  stepContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  stepImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
    backgroundColor: '#e0e0e0', // Placeholder background
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
