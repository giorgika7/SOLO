import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

interface CountryListItemProps {
  flag: string;
  name: string;
  price: number;
  currency: string;
  onPress: () => void;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  flag: {
    fontSize: 32,
    marginRight: spacing[3],
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
  },
  price: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing[1],
  },
  priceAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
  },
});

export const CountryListItem: React.FC<CountryListItemProps> = ({
  flag,
  name,
  price,
  currency,
  onPress,
}) => (
  <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.flag}>{flag}</Text>
    <View style={styles.content}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.price}>
        from <Text style={styles.priceAmount}>${price.toFixed(2)}</Text> per GB
      </Text>
    </View>
  </TouchableOpacity>
);
