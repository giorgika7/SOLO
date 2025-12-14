import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.black,
    height: 44,
  },
  inputFocused: {
    borderColor: colors.black,
  },
  inputError: {
    borderColor: colors.error,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
});

export const Input: React.FC<InputProps> = ({ label, error, icon, ...props }) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      {icon ? (
        <View style={styles.iconContainer}>
          {icon}
          <TextInput
            {...props}
            style={[
              styles.input,
              isFocused && styles.inputFocused,
              error && styles.inputError,
            ]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholderTextColor={colors.gray[500]}
          />
        </View>
      ) : (
        <TextInput
          {...props}
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            error && styles.inputError,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.gray[500]}
        />
      )}
    </View>
  );
};
