import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, Users, CreditCard, ShoppingBag } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';

interface UserStats {
  id: string;
  email: string;
  balance: number;
  created_at: string;
  last_login: string | null;
  esim_count: number;
  order_count: number;
  total_spent: number;
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalEsims: number;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
    marginTop: spacing[2],
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
    flex: 1,
    marginLeft: spacing[2],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing[4],
  },
  statIcon: {
    marginBottom: spacing[2],
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    marginBottom: spacing[4],
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.black,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
    marginBottom: spacing[3],
  },
  userCard: {
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  userEmail: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
  },
  userBalance: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  userDetails: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[2],
  },
  userStat: {
    flex: 1,
  },
  userStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
    marginBottom: spacing[1],
  },
  userStatValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
  },
  userDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: spacing[2],
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  accessDeniedTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
    marginBottom: spacing[2],
  },
  accessDeniedText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
  },
});

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserStats[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalEsims: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.is_admin || user?.email === 'admin@solo-esim.com';

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const userStats: UserStats[] = await Promise.all(
        (usersData || []).map(async (u: any) => {
          const { data: esims } = await supabase
            .from('esims')
            .select('id')
            .eq('user_id', u.id);

          const { data: orders } = await supabase
            .from('orders')
            .select('id, amount')
            .eq('user_id', u.id);

          const totalSpent = (orders || []).reduce((sum, o) => sum + (o.amount || 0), 0);

          return {
            id: u.id,
            email: u.email,
            balance: u.balance || 0,
            created_at: u.created_at,
            last_login: u.last_login,
            esim_count: esims?.length || 0,
            order_count: orders?.length || 0,
            total_spent: totalSpent,
          };
        })
      );

      setUsers(userStats);

      const { data: ordersData } = await supabase.from('orders').select('amount');
      const { data: esimsData } = await supabase.from('esims').select('id');

      const totalRevenue = (ordersData || []).reduce((sum, o) => sum + (o.amount || 0), 0);

      setStats({
        totalUsers: userStats.length,
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        totalEsims: esimsData?.length || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((u) =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.accessDenied]}>
        <Text style={styles.accessDeniedTitle}>Login Required</Text>
        <Text style={styles.accessDeniedText}>Please login to access the admin dashboard</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={[styles.container, styles.accessDenied]}>
        <Text style={styles.accessDeniedTitle}>Access Denied</Text>
        <Text style={styles.accessDeniedText}>
          You do not have permission to access the admin dashboard
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      {error && <ErrorMessage message={error} />}

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Users size={24} color={colors.black} style={styles.statIcon} />
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </Card>

        <Card style={styles.statCard}>
          <ShoppingBag size={24} color={colors.black} style={styles.statIcon} />
          <Text style={styles.statValue}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </Card>

        <Card style={styles.statCard}>
          <CreditCard size={24} color={colors.black} style={styles.statIcon} />
          <Text style={styles.statValue}>${stats.totalRevenue.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </Card>

        <Card style={styles.statCard}>
          <Users size={24} color={colors.black} style={styles.statIcon} />
          <Text style={styles.statValue}>{stats.totalEsims}</Text>
          <Text style={styles.statLabel}>Total eSIMs</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>User Management</Text>

      <View style={styles.searchContainer}>
        <Search size={18} color={colors.gray[600]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by email"
          placeholderTextColor={colors.gray[500]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No users found</Text>
        </View>
      ) : (
        filteredUsers.map((userStat) => (
          <Card key={userStat.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <Text style={styles.userEmail}>{userStat.email}</Text>
              <Text style={styles.userBalance}>${userStat.balance.toFixed(2)}</Text>
            </View>

            <View style={styles.userDetails}>
              <View style={styles.userStat}>
                <Text style={styles.userStatLabel}>eSIMs</Text>
                <Text style={styles.userStatValue}>{userStat.esim_count}</Text>
              </View>

              <View style={styles.userStat}>
                <Text style={styles.userStatLabel}>Orders</Text>
                <Text style={styles.userStatValue}>{userStat.order_count}</Text>
              </View>

              <View style={styles.userStat}>
                <Text style={styles.userStatLabel}>Total Spent</Text>
                <Text style={styles.userStatValue}>${userStat.total_spent.toFixed(2)}</Text>
              </View>
            </View>

            <Text style={styles.userDate}>
              Joined: {new Date(userStat.created_at).toLocaleDateString()}
            </Text>
            {userStat.last_login && (
              <Text style={styles.userDate}>
                Last Login: {new Date(userStat.last_login).toLocaleDateString()}
              </Text>
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
}
