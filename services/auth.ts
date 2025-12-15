import { supabase, auth } from './supabase';
import type { User } from '@/types';

export const authService = {
  async signUpWithPassword(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    console.log('📝 Registering new user:', normalizedEmail);

    const { data, error } = await auth.signUp({
      email: normalizedEmail,
      password: password,
      options: {
        emailRedirectTo: undefined,
        data: {
          email: normalizedEmail,
        }
      }
    });

    if (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }

    console.log('✅ Registration successful');

    if (data.user) {
      await this.ensureUserProfile(data.user);
    }

    return data;
  },

  async signInWithPassword(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    console.log('🔐 Signing in:', normalizedEmail);

    const { data, error } = await auth.signInWithPassword({
      email: normalizedEmail,
      password: password,
    });

    if (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }

    console.log('✅ Login successful');

    if (data.user) {
      await this.ensureUserProfile(data.user);
    }

    return data;
  },

  async sendTemporaryPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    console.log('📧 Requesting temporary password for:', normalizedEmail);

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-temp-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to send temporary password:', data.error);
      throw new Error(data.error || 'Failed to send temporary password');
    }

    console.log('✅ Temporary password sent successfully');
    return data;
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    console.log('🔑 Updating password...');

    const { data: { user } } = await auth.getUser();
    if (!user || !user.email) {
      throw new Error('No user logged in');
    }

    try {
      const { error: verifyError } = await auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error('Current password is incorrect');
      }
    } catch (err) {
      throw new Error('Current password is incorrect');
    }

    const { error } = await auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('❌ Password update failed:', error);
      throw error;
    }

    if (user.user_metadata?.temp_password) {
      await auth.updateUser({
        data: {
          ...user.user_metadata,
          temp_password: false,
          temp_password_created_at: null,
        },
      });
    }

    console.log('✅ Password updated successfully');
  },

  async ensureUserProfile(user: any) {
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      console.log('Existing user - profile loaded');
      return existingProfile;
    }

    console.log('New user - creating profile');
    const { data: newProfile, error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        balance: 0,
        currency: 'USD',
        is_admin: false,
        preferences: {
          language: 'en',
          notifications: true,
          dataAlerts: true,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create user profile:', error);
      throw error;
    }

    console.log('New user profile created successfully');
    return newProfile;
  },

  async getCompleteUserData(userId: string) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data: esims } = await supabase
      .from('esims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return {
      profile,
      orders: orders || [],
      esims: esims || [],
    };
  },

  async signOut() {
    const { error } = await auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data, error } = await auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async getSession() {
    const { data, error } = await auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return auth.onAuthStateChange((event, session) => {
      callback(session?.user);
    });
  },

  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createUserProfile(userId: string, email: string) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        balance: 0,
        currency: 'USD',
        preferences: {
          language: 'en',
          notifications: true,
          dataAlerts: true,
        },
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
