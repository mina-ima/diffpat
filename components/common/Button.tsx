import React from 'react';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';

type Props = ButtonProps & {
  // Add any custom props here
};

const Button = (props: Props) => {
  return (
    <PaperButton
      style={[styles.button, props.style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
  },
});

export default Button;
