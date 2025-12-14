import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ToastProvider } from '@/contexts/ToastContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { authService } from '@/services/auth';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  useFrameworkReady();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let unsubscribe: any;

    const checkAuth = async () => {
      try {
        const session = await authService.getSession();
        setIsAuthenticated(!!session);

        unsubscribe = authService.onAuthStateChange((user) => {
          setIsAuthenticated(!!user);
        }).data?.subscription;
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <OrderProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
              <>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="country/[code]" />
                <Stack.Screen name="esim/[id]" />
                <Stack.Screen name="admin/index" />
              </>
            ) : (
              <>
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
              </>
            )}
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </OrderProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
