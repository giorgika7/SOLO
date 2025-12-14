import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Check, X, AlertCircle, Info } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const icons = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertCircle,
};

export function Toast({ visible, message, type = 'info', duration = 3000, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  const Icon = icons[type];
  const isError = type === 'error';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: isError ? colors.white : colors.black,
          borderColor: isError ? colors.black : 'transparent',
          borderWidth: isError ? 1 : 0,
        },
      ]}
    >
      <View style={styles.content}>
        <Icon size={20} color={isError ? colors.black : colors.white} />
        <Text style={[styles.message, { color: isError ? colors.black : colors.white }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? spacing[4] : spacing[12],
    left: spacing[4],
    right: spacing[4],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    zIndex: 9999,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    marginLeft: spacing[3],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
