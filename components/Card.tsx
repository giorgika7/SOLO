import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  padding?: number;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  shadowSm: shadows.sm,
  shadowMd: shadows.md,
  shadowLg: shadows.lg,
});

export const Card: React.FC<CardProps> = ({
  children,
  style,
  shadow = 'md',
  padding = spacing[4],
}) => {
  const shadowStyle = shadow !== 'none'
    ? styles[`shadow${shadow.charAt(0).toUpperCase() + shadow.slice(1)}` as keyof typeof styles]
    : undefined;

  return (
    <View
      style={[
        styles.card,
        shadowStyle,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
};
