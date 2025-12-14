import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'expired' | 'pending' | 'completed' | 'failed';
  size?: 'sm' | 'md' | 'lg';
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSm: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  badgeMd: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
  },
  badgeLg: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  textSm: {
    fontSize: typography.fontSize.xs,
  },
  textMd: {
    fontSize: typography.fontSize.sm,
  },
  textLg: {
    fontSize: typography.fontSize.base,
  },
  active: {
    backgroundColor: colors.success,
  },
  inactive: {
    backgroundColor: colors.gray[500],
  },
  expired: {
    backgroundColor: colors.error,
  },
  pending: {
    backgroundColor: colors.warning || '#F59E0B',
  },
  completed: {
    backgroundColor: colors.success,
  },
  failed: {
    backgroundColor: colors.error,
  },
});

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const badgeSizeStyle = size === 'sm' ? styles.badgeSm : size === 'lg' ? styles.badgeLg : styles.badgeMd;
  const textSizeStyle = size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : styles.textMd;
  const statusStyle = styles[status];

  return (
    <View style={[styles.badge, badgeSizeStyle, statusStyle]}>
      <Text style={[styles.text, textSizeStyle]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}
