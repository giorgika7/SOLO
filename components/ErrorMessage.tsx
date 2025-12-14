import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  text: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{message}</Text>
  </View>
);
