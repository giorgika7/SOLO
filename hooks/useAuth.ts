import { useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/auth';
import { esimSync } from '@/services/esimSync';
import type { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;

    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');

        const session = await authService.getSession();

        if (session?.user) {
          console.log('✅ Session found, loading profile');
          await loadUserProfile(session.user.id);
        } else {
          console.log('❌ No session found');
          setUser(null);
          setLoading(false);
        }

        const { data } = authService.onAuthStateChange((authUser) => {
          console.log('🔐 Auth state changed:', authUser ? 'Logged in' : 'Logged out');

          if (authUser) {
            loadUserProfile(authUser.id);
          } else {
            console.log('👋 User logged out, clearing state');
            setUser(null);
            setLoading(false);
            esimSync.stopPolling();
          }
        });

        subscription = data?.subscription;
      } catch (err) {
        console.error('❌ Auth initialization failed:', err);
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      subscription?.unsubscribe();
      esimSync.stopPolling();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const profile = await authService.getUserProfile(userId);
      setUser(profile);
      setError(null);

      esimSync.startPolling(userId);
    } catch (err) {
      console.error('❌ Failed to load user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const signOut = useCallback(async () => {
    try {
      console.log('👋 Signing out...');
      setLoading(true);

      esimSync.stopPolling();

      setUser(null);

      await authService.signOut();

      console.log('✅ Signed out successfully');
    } catch (err) {
      console.error('❌ Sign out failed:', err);
      setError(err instanceof Error ? err.message : 'Sign out failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    signOut,
  };
};
