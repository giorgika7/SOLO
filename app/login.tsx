import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/services/auth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, typography, spacing } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      setLocalError('Please enter your email');
      showToast('Please enter your email', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('Please enter a valid email address');
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (!password) {
      setLocalError('Please enter your password');
      showToast('Please enter your password', 'error');
      return;
    }

    try {
      setLoading(true);
      setLocalError(null);

      console.log('🔑 Attempting login...');
      await authService.signInWithPassword(email.trim(), password);

      console.log('✅ Login successful, redirecting to tabs');
      showToast('Login successful!', 'success');
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('❌ Login failed:', err);

      let errorMessage = 'Invalid email or password';
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setLocalError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      showToast('Please enter your email', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      setResetLoading(true);
      const data = await authService.sendTemporaryPassword(resetEmail.trim());

      if (data.debug_password) {
        Alert.alert(
          'Temporary Password (Development Only)',
          `Your temporary password is:\n\n${data.debug_password}\n\nPlease use this to login and then change your password in Profile > Change Password.`,
          [{ text: 'OK' }]
        );
        setShowForgotPassword(false);
        setResetEmail('');
      } else {
        showToast('Temporary password sent to your email!', 'success');
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (err: any) {
      console.error('Failed to send temporary password:', err);
      const errorMessage = err.message || 'Failed to send temporary password';
      showToast(errorMessage, 'error');
    } finally {
      setResetLoading(false);
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
    forgotPasswordContainer: {
      alignItems: 'flex-end',
      marginBottom: spacing[4],
    },
    forgotPasswordLink: {
      fontSize: typography.fontSize.sm,
      color: colors.black,
      fontWeight: typography.fontWeight.semibold,
    },
    button: {
      marginBottom: spacing[4],
    },
    footer: {
      marginTop: spacing[4],
      alignItems: 'center',
    },
    footerText: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
    },
    registerLink: {
      fontSize: typography.fontSize.sm,
      color: colors.black,
      fontWeight: typography.fontWeight.semibold,
      marginTop: spacing[1],
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[6],
    },
    modalContent: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: spacing[6],
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.black,
      marginBottom: spacing[2],
    },
    modalDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      marginBottom: spacing[4],
    },
    modalButtons: {
      flexDirection: 'row',
      gap: spacing[3],
      marginTop: spacing[2],
    },
    modalButton: {
      flex: 1,
    },
  });

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>SOLO</Text>
          <Text style={styles.tagline}>the wise decision</Text>
        </View>

        {localError && <ErrorMessage message={localError} />}

        <View>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.description}>
            Sign in to access your eSIMs and account
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
                autoComplete="password"
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
          </View>

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={() => setShowForgotPassword(true)}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
            size="lg"
          />

          <Button
            title="Continue as Guest"
            onPress={() => router.replace('/(tabs)')}
            variant="outline"
            size="lg"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push('/register')}
              disabled={loading}
            >
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showForgotPassword}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotPassword(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowForgotPassword(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Get Temporary Password</Text>
              <Text style={styles.modalDescription}>
                Enter your email address and we'll send you a temporary password. You can change it after logging in.
              </Text>

              <Input
                placeholder="your@email.com"
                keyboardType="email-address"
                value={resetEmail}
                onChangeText={setResetEmail}
                editable={!resetLoading}
                autoCapitalize="none"
              />

              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  variant="outline"
                  style={styles.modalButton}
                  disabled={resetLoading}
                />
                <Button
                  title="Send Temporary Password"
                  onPress={handleForgotPassword}
                  loading={resetLoading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
