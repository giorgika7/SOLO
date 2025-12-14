import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.md,
  style
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCountryItem() {
  return (
    <View style={styles.countryItem}>
      <Skeleton width={40} height={40} borderRadius={borderRadius.full} />
      <View style={styles.countryContent}>
        <Skeleton width="60%" height={16} style={{ marginBottom: spacing[2] }} />
        <Skeleton width="30%" height={12} />
      </View>
      <Skeleton width={60} height={20} />
    </View>
  );
}

export function SkeletonEsimCard() {
  return (
    <View style={styles.esimCard}>
      <View style={styles.esimHeader}>
        <Skeleton width="50%" height={20} />
        <Skeleton width={60} height={24} borderRadius={borderRadius.full} />
      </View>
      <View style={styles.dataSection}>
        <Skeleton width="30%" height={12} style={{ marginBottom: spacing[2] }} />
        <Skeleton width="100%" height={6} borderRadius={borderRadius.full} />
        <Skeleton width="40%" height={10} style={{ marginTop: spacing[2] }} />
      </View>
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Skeleton width="25%" height={14} />
          <Skeleton width="35%" height={14} />
        </View>
        <View style={styles.detailRow}>
          <Skeleton width="20%" height={14} />
          <Skeleton width="25%" height={14} />
        </View>
      </View>
      <View style={styles.buttonRow}>
        <Skeleton width="48%" height={36} />
        <Skeleton width="48%" height={36} />
      </View>
    </View>
  );
}

export function SkeletonPackageCard() {
  return (
    <View style={styles.packageCard}>
      <View style={styles.packageHeader}>
        <Skeleton width="30%" height={20} />
        <Skeleton width="25%" height={20} />
      </View>
      <Skeleton width="40%" height={14} style={{ marginBottom: spacing[3] }} />
      <Skeleton width="100%" height={36} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray[200],
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  countryContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  esimCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  esimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  dataSection: {
    marginBottom: spacing[4],
  },
  detailsSection: {
    marginBottom: spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packageCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
});
