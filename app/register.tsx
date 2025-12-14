import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/services/auth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, typography, spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const getPasswordStrength = (pass: string): { text: string; color: string } => {
    if (pass.length === 0) return { text: '', color: colors.gray[300] };
    if (pass.length < 6) return { text: 'Weak', color: colors.error };
    if (pass.length < 9) return { text: 'Medium', color: colors.warning };
    return { text: 'Strong', color: colors.success };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateInputs = () => {
    if (!email.trim()) {
      setLocalError('Please enter your email');
      showToast('Please enter your email', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('Please enter a valid email');
      showToast('Please enter a valid email', 'error');
      return false;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      showToast('Password must be at least 6 characters', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords don\'t match');
      showToast('Passwords don\'t match', 'error');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      setLocalError(null);

      console.log('📝 Attempting registration...');
      await authService.signUpWithPassword(email.trim(), password);

      console.log('✅ Registration successful, redirecting to tabs');
      showToast('Account created successfully!', 'success');
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('❌ Registration failed:', err);

      let errorMessage = 'Registration failed. Please try again.';
      if (err.message?.includes('already registered')) {
        errorMessage = 'Email already registered';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setLocalError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
    content: {
      flexGrow: 1,
      padding: spacing[6],
      justifyContent: 'center',
    },
    header: {
      marginBottom: spacing[8],
      alignItems: 'center',
    },
    logo: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.black,
      marginBottom: spacing[2],
    },
    tagline: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      fontStyle: 'italic',
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.black,
      marginBottom: spacing[2],
    },
    description: {
      fontSize: typography.fontSize.base,
      color: colors.gray[600],
      marginBottom: spacing[6],
      lineHeight: typography.lineHeight.normal,
    },
    inputContainer: {
      marginBottom: spacing[4],
    },
    passwordInputWrapper: {
      position: 'relative',
    },
    eyeButton: {
      position: 'absolute',
      right: spacing[3],
      top: '50%',
      transform: [{ translateY: -12 }],
    },
    strengthContainer: {
      marginTop: spacing[2],
      marginBottom: spacing[2],
    },
    strengthBar: {
      height: 4,
      backgroundColor: colors.gray[200],
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: spacing[1],
    },
    strengthFill: {
      height: '100%',
      borderRadius: 2,
    },
    strengthText: {
      fontSize: typography.fontSize.xs,
      color: colors.gray[600],
    },
    button: {
      marginBottom: spacing[4],
      marginTop: spacing[2],
    },
    footer: {
      marginTop: spacing[4],
      alignItems: 'center',
    },
    footerText: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
    },
    loginLink: {
      fontSize: typography.fontSize.sm,
      color: colors.black,
      fontWeight: typography.fontWeight.semibold,
      marginTop: spacing[1],
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>SOLO</Text>
        <Text style={styles.tagline}>the wise decision</Text>
      </View>

      {localError && <ErrorMessage message={localError} />}

      <View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.description}>
          Sign up to start managing your eSIMs
        </Text>

        <View style={styles.inputContainer}>
          <Input
            placeholder="your@email.com"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setLocalError(null);
            }}
            editable={!loading}
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.passwordInputWrapper}>
            <Input
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setLocalError(null);
              }}
              secureTextEntry={!showPassword}
              editable={!loading}
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.gray[500]} />
              ) : (
                <Eye size={20} color={colors.gray[500]} />
              )}
            </TouchableOpacity>
          </View>

          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width:
                        password.length < 6
                          ? '33%'
                          : password.length < 9
                          ? '66%'
                          : '100%',
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              {passwordStrength.text && (
                <Text style={styles.strengthText}>
                  Password strength: {passwordStrength.text}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.passwordInputWrapper}>
            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setLocalError(null);
              }}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={colors.gray[500]} />
              ) : (
                <Eye size={20} color={colors.gray[500]} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
          size="lg"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => router.push('/login')}
            disabled={loading}
          >
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
