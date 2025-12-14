import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { supabase } from '@/services/supabase';
import { esimSync } from '@/services/esimSync';
import { useAuth } from '@/hooks/useAuth';
import { formatDataAmount } from '@/utils/formatters';
import type { Esim } from '@/types';

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
  esimCard: {
    marginBottom: spacing[4],
  },
  esimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  countryName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
  },
  statusBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  dataUsageContainer: {
    marginBottom: spacing[4],
  },
  dataLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing[1],
  },
  dataBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing[1],
  },
  dataFill: {
    height: '100%',
    backgroundColor: colors.black,
  },
  dataText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
  },
  detailsContainer: {
    marginBottom: spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
    marginBottom: spacing[2],
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
  },
});

export default function EsimScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [esims, setEsims] = useState<Esim[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadEsims();
    }
  }, [user]);

  const loadEsims = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('esims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setEsims(data || []);

        await esimSync.syncUserEsims(user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load eSIMs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;

    try {
      setRefreshing(true);

      await esimSync.syncUserEsims(user.id);

      const { data } = await supabase
        .from('esims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setEsims(data || []);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = (esim: Esim) => {
    router.push(`/esim/${esim.id}`);
  };

  const handleTopup = (esim: Esim) => {
    router.push(`/esim/${esim.id}/topup`);
  };

  const filteredEsims = esims.filter((esim) => {
    if (activeTab === 'active') {
      return esim.status === 'active' || esim.status === 'inactive';
    } else {
      return esim.status === 'expired';
    }
  });

  const renderEsimCard = ({ item }: { item: Esim }) => {
    const usagePercentage = (item.dataUsed / item.dataTotal) * 100;

    return (
      <Card style={styles.esimCard}>
        <View style={styles.esimHeader}>
          <Text style={styles.countryName}>{item.countryName}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.dataUsageContainer}>
          <Text style={styles.dataLabel}>Data Usage</Text>
          <View style={styles.dataBar}>
            <View
              style={[styles.dataFill, { width: `${usagePercentage}%` }]}
            />
          </View>
          <Text style={styles.dataText}>
            {formatDataAmount(item.dataUsed)} / {formatDataAmount(item.dataTotal)} used
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Validity</Text>
            <Text style={styles.detailValue}>Until {item.expiryDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ICCID</Text>
            <Text style={styles.detailValue}>{item.iccid.slice(-4)}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="View Details"
            onPress={() => handleViewDetails(item)}
            variant="outline"
            style={styles.actionButton}
            size="sm"
          />
          <Button
            title="Top Up"
            onPress={() => handleTopup(item)}
            style={styles.actionButton}
            size="sm"
          />
        </View>
      </Card>
    );
  };

  if (!user && !loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing[4] }]}>
        <Text style={styles.emptyStateTitle}>Login Required</Text>
        <Text style={styles.emptyStateText}>Please login to view your eSIMs</Text>
        <Button
          title="Go to Login"
          onPress={() => router.push('/login')}
          style={{ marginTop: spacing[4] }}
        />
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
    <FlatList
      data={filteredEsims}
      keyExtractor={(item) => item.id}
      renderItem={renderEsimCard}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.black}
        />
      }
      ListHeaderComponent={
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>My eSIMs</Text>
            <Text style={styles.subtitle}>Pull to refresh data usage</Text>
          </View>
          {error && <ErrorMessage message={error} />}
          <TabBar
            tabs={['Active', 'Expired']}
            activeTab={activeTab === 'active' ? 'Active' : 'Expired'}
            onTabChange={(tab) => setActiveTab(tab.toLowerCase() as 'active' | 'expired')}
          />
        </View>
      }
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={[styles.content, styles.emptyState]}>
          <Text style={styles.emptyStateTitle}>No eSIMs yet</Text>
          <Text style={styles.emptyStateText}>
            Purchase your first eSIM to get started
          </Text>
          <Button
            title="Browse Countries"
            onPress={() => router.push('/(tabs)')}
            style={{ marginTop: spacing[4] }}
          />
        </View>
      }
    />
  );
}
