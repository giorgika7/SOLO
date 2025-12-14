import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

interface PricePickerProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  presets?: number[];
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[6],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[700],
    marginBottom: spacing[3],
  },
  displayContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    alignItems: 'center',
  },
  amountDisplay: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
    marginBottom: spacing[2],
  },
  currency: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[600],
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing[2],
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  buttonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  inputField: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
    minWidth: 80,
    textAlign: 'center',
    marginHorizontal: spacing[4],
  },
  presetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  presetButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  activePresetButton: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  presetButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
  },
  activePresetButtonText: {
    color: colors.white,
  },
});

export const PricePicker: React.FC<PricePickerProps> = ({
  amount,
  onAmountChange,
  presets = [15, 40, 100],
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Amount</Text>

      <View style={styles.displayContainer}>
        <Text style={styles.amountDisplay}>${amount.toFixed(0)}</Text>
        <Text style={styles.currency}>USD</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onAmountChange(Math.max(5, amount - 1))}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.inputField}>{amount}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onAmountChange(amount + 1)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.presetsContainer}>
        {presets.map((preset) => (
          <TouchableOpacity
            key={preset}
            style={[
              styles.presetButton,
              amount === preset && styles.activePresetButton,
            ]}
            onPress={() => onAmountChange(preset)}
          >
            <Text
              style={[
                styles.presetButtonText,
                amount === preset && styles.activePresetButtonText,
              ]}
            >
              ${preset}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
