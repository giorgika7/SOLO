import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { ChevronRight, User, LogOut, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { haptics } from '@/utils/haptics';
import { supabase, auth } from '@/services/supabase';
import type { Order } from '@/types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.black,
  },
  profileCard: {
    padding: spacing[5],
    marginBottom: spacing[6],
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
    marginBottom: spacing[1],
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  balanceContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginTop: spacing[3],
  },
  balanceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
    marginBottom: spacing[1],
  },
  balanceAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
    marginBottom: spacing[3],
  },
  transactionCard: {
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  transactionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
  },
  transactionAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  transactionDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  transactionStatus: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  logoutButton: {
    marginVertical: spacing[6],
  },
  loginPrompt: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  loginPromptText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing[6],
  },
});

const MENU_ITEMS = [
  { label: 'About Us', url: 'https://solo-esim.com/about' },
  { label: 'Contacts', url: 'https://solo-esim.com/contact' },
  { label: 'Terms of Use', url: 'https://solo-esim.com/terms' },
  { label: 'Privacy Policy', url: 'https://solo-esim.com/privacy' },
  { label: 'Leave a Review', url: 'itms-apps://apps.apple.com/app/id1234567890?action=write-review' },
  { label: 'For Companies', url: 'https://solo-esim.com/business' },
  { label: 'For Influencers', url: 'https://solo-esim.com/influencers' },
  { label: 'For Corporate Clients', url: 'https://solo-esim.com/enterprise' },
  { label: 'For Media', url: 'https://solo-esim.com/media' },
];

export default function MoreScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [esimCount, setEsimCount] = useState({ active: 0, expired: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!ordersError && ordersData) {
        setOrders(ordersData as Order[]);
      }

      const { data: esimsData, error: esimsError } = await supabase
        .from('esims')
        .select('status')
        .eq('user_id', user.id);

      if (!esimsError && esimsData) {
        const active = esimsData.filter(e => e.status === 'active' || e.status === 'inactive').length;
        const expired = esimsData.filter(e => e.status === 'expired').length;
        setEsimCount({ active, expired, total: esimsData.length });
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (url: string) => {
    haptics.light();
    Linking.openURL(url).catch((err) => console.log('Failed to open URL:', err));
  };

  const handleLogout = async () => {
    haptics.light();
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('👋 Logging out...');
              setLoggingOut(true);
              haptics.medium();

              await signOut();

              showToast('Logged out successfully', 'success');

              setTimeout(() => {
                console.log('🔄 Redirecting to login...');
                router.replace('/login');
              }, 100);

            } catch (error) {
              console.error('❌ Logout error:', error);
              showToast('Failed to logout', 'error');
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    haptics.warning();
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data including eSIMs, orders, and profile information will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              haptics.heavy();

              if (!user) return;

              console.log('🗑️ Deleting account...');

              await supabase.from('esims').delete().eq('user_id', user.id);
              await supabase.from('orders').delete().eq('user_id', user.id);
              await supabase.from('users').delete().eq('id', user.id);

              await signOut();

              showToast('Account deleted successfully', 'success');

              console.log('🔄 Redirecting to login after account deletion...');
              router.replace('/login');

            } catch (err) {
              console.error('❌ Failed to delete account:', err);
              haptics.error();
              showToast('Failed to delete account. Please try again.', 'error');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{user ? 'Profile' : 'More'}</Text>
        <Text style={styles.subtitle}>
          {user ? 'Manage your account and settings' : 'Learn more about SOLO'}
        </Text>
      </View>

      {user ? (
        <>
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileIcon}>
                <User size={30} color={colors.gray[600]} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.name || 'User'}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Account Balance</Text>
              <Text style={styles.balanceAmount}>${user.balance?.toFixed(2) || '0.00'}</Text>
            </View>

            <View style={{ flexDirection: 'row', marginTop: spacing[4], gap: spacing[4] }}>
              <View style={{ flex: 1, backgroundColor: colors.gray[50], borderRadius: borderRadius.md, padding: spacing[3] }}>
                <Text style={styles.balanceLabel}>Total eSIMs</Text>
                <Text style={[styles.balanceAmount, { fontSize: typography.fontSize.lg }]}>
                  {esimCount.total}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.gray[50], borderRadius: borderRadius.md, padding: spacing[3] }}>
                <Text style={styles.balanceLabel}>Total Orders</Text>
                <Text style={[styles.balanceAmount, { fontSize: typography.fontSize.lg }]}>
                  {orders.length}
                </Text>
              </View>
            </View>

            {esimCount.total > 0 && (
              <View style={{ flexDirection: 'row', marginTop: spacing[2], gap: spacing[4] }}>
                <View style={{ flex: 1, backgroundColor: colors.gray[50], borderRadius: borderRadius.md, padding: spacing[3] }}>
                  <Text style={styles.balanceLabel}>Active eSIMs</Text>
                  <Text style={[styles.balanceAmount, { fontSize: typography.fontSize.base }]}>
                    {esimCount.active}
                  </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: colors.gray[50], borderRadius: borderRadius.md, padding: spacing[3] }}>
                  <Text style={styles.balanceLabel}>Expired eSIMs</Text>
                  <Text style={[styles.balanceAmount, { fontSize: typography.fontSize.base }]}>
                    {esimCount.expired}
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {(user.is_admin || user.email === 'admin@solo-esim.com') && (
            <Button
              title="Admin Dashboard"
              onPress={() => router.push('/admin')}
              variant="outline"
              size="lg"
              style={{ marginBottom: spacing[6] }}
            />
          )}

          <Text style={styles.sectionTitle}>
            {orders.length > 0 ? `Order History (${orders.length})` : 'Order History'}
          </Text>
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing[4] }}>
              <LoadingSpinner size="small" />
            </View>
          ) : orders.length > 0 ? (
            <>
              {orders.map((order, index) => (
                <Card key={order.id} style={styles.transactionCard}>
                  <View style={styles.transactionHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.transactionTitle}>
                        Order #{index + 1}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.transactionAmount}>
                        ${order.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.transactionStatus}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </>
          ) : (
            <Text style={[styles.subtitle, { textAlign: 'center', paddingVertical: spacing[4] }]}>
              No orders yet. Purchase your first eSIM to get started!
            </Text>
          )}

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="lg"
            loading={loggingOut}
            style={styles.logoutButton}
            icon={<LogOut size={20} color={colors.black} />}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Account Settings</Text>
          <Button
            title={deleting ? 'Deleting...' : 'Delete Account'}
            onPress={handleDeleteAccount}
            variant="outline"
            size="lg"
            style={{ borderColor: colors.error }}
            icon={<Trash2 size={20} color={colors.error} />}
            disabled={deleting}
          />
          <Text style={[styles.subtitle, { textAlign: 'center', marginTop: spacing[2] }]}>
            This action is permanent and cannot be undone
          </Text>

          <View style={styles.divider} />
        </>
      ) : (
        <>
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>
              Login to access your profile, manage eSIMs, and view transaction history
            </Text>
            <Button
              title="Login"
              onPress={() => router.push('/login')}
              size="lg"
            />
          </View>

          <View style={styles.divider} />
        </>
      )}

      <Text style={styles.sectionTitle}>Information</Text>
      {MENU_ITEMS.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => handlePress(item.url)}
        >
          <Text style={styles.menuText}>{item.label}</Text>
          <ChevronRight size={20} color={colors.gray[400]} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
