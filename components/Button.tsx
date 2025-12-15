import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  primary: {
    backgroundColor: colors.black,
  },
  secondary: {
    backgroundColor: colors.gray[100],
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
  },
  sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    height: 36,
  },
  md: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    height: 44,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    height: 52,
  },
  primaryText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  secondaryText: {
    color: colors.black,
    fontWeight: typography.fontWeight.semibold,
  },
  outlineText: {
    color: colors.black,
    fontWeight: typography.fontWeight.semibold,
  },
  textSm: {
    fontSize: typography.fontSize.sm,
  },
  textMd: {
    fontSize: typography.fontSize.base,
  },
  textLg: {
    fontSize: typography.fontSize.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const buttonDisabled = disabled || loading;

  const textColor = variant === 'primary' ? colors.white : colors.black;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={buttonDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        buttonDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              styles[`${variant}Text` as keyof typeof styles],
              styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
