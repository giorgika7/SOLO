import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleOnline = () => setStatus({ isConnected: true, isInternetReachable: true });
      const handleOffline = () => setStatus({ isConnected: false, isInternetReachable: false });

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      setStatus({
        isConnected: navigator.onLine,
        isInternetReachable: navigator.onLine,
      });

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return status;
}
