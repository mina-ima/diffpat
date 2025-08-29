import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import React from 'react';
import PatroboSpeechBubble from '@/components/PatroboSpeechBubble';

const patroboImage = require('@/assets/images/patrobo.png');

export default function HowToUseScreen() {
  const steps = [
    {
      title: '1. 写真を2枚撮ろう',
      patroboMessage: 'まずは、比較したいものを2枚撮影するパト！',
      description: '1枚目と2枚目の写真を撮影します。同じアングルから撮るのがポイントパト！',
    },
    {
      title: '2. どこを調べたいか選ぼう',
      patroboMessage: '指で囲んで、どこを調べるか教えてほしいパト！',
      description: '指で画像をドラッグして、比較したい範囲を選択します。最小サイズは100x100pxパト！',
    },
    {
      title: '3. 感度を調整しよう',
      patroboMessage: '間違いを見つける感度を調整するパト！',
      description: '差分検出の感度をスライダーで調整します。感度が高いほど、小さな違いも見つけやすいパト！',
    },
    {
      title: '4. 調査ボタンを押してね',
      patroboMessage: '準備ができたら、調査開始パト！',
      description: '「Compare This Area」ボタンを押して、調査を開始します。少し時間がかかるパト！',
    },
    {
      title: '5. パトロボが間違いを見つけてくれるよ！',
      patroboMessage: 'パトロボにお任せパト！間違いを見つけてくるパト！',
      description: 'パトロボが画像を分析し、間違いを赤枠で表示します。見逃しは許さないパト！',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>使い方ガイド</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <PatroboSpeechBubble message={step.patroboMessage} patroboImage={patroboImage} />
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
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});