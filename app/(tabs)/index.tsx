import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { FeatureCard } from '@/components/FeatureCard';
import { TabBar } from '@/components/TabBar';
import { CountryListItem } from '@/components/CountryListItem';
import { SkeletonCountryItem } from '@/components/Skeleton';
import { Search, X } from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import { syncCountriesFromAPI, shouldSync } from '@/services/countrySync';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { haptics } from '@/utils/haptics';
import type { Country } from '@/types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[5],
    paddingTop: spacing[6],
  },
  logo: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
    marginBottom: spacing[1],
  },
  tagline: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    fontStyle: 'italic',
    marginBottom: spacing[5],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    marginBottom: spacing[5],
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.black,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  halfButton: {
    flex: 1,
  },
  featuresSection: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[8],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
    marginBottom: spacing[4],
  },
  countriesSection: {
    flex: 1,
  },
  countryList: {
    backgroundColor: colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('Top');
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const categories = ['Top', 'Americas', 'Europe', 'Asia', 'Africa', 'Oceania'];

  const handleTabChange = useCallback((tab: string) => {
    haptics.selection();
    setActiveCategory(tab);
  }, []);

  const handleCountryPress = useCallback((code: string) => {
    haptics.light();
    router.push(`/country/${code}`);
  }, [router]);

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    filterCountries();
  }, [activeCategory, searchQuery, countries]);

  const loadCountries = async () => {
    try {
      setLoading(true);

      const needsSync = await shouldSync();
      if (needsSync) {
        await performSync();
      }

      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading countries:', error);
        showToast('Failed to load countries', 'error');
        return;
      }

      const mappedCountries: Country[] = (data || []).map((country: any) => ({
        id: country.id,
        code: country.code,
        name: country.name,
        region: country.region as Country['region'],
        flag: country.flag,
        pricePerGb: country.min_retail_price || country.min_price || 0,
        minRetailPrice: country.min_retail_price,
        currency: 'USD',
        packages: [],
        isTopCountry: country.is_top_country,
      }));

      setCountries(mappedCountries);
    } catch (error) {
      console.error('Error in loadCountries:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSync = async () => {
    try {
      setSyncing(true);
      console.log('Syncing countries from API...');

      const result = await syncCountriesFromAPI();

      if (!result.success) {
        console.error('Sync failed:', result.error);
      } else {
        console.log('Sync successful:', result.stats);
      }
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  const filterCountries = () => {
    let filtered = countries;

    if (searchQuery.trim()) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      if (activeCategory !== 'Top') {
        filtered = filtered.filter((c) => c.region === activeCategory);
      } else {
        filtered = filtered.filter((c) => c.isTopCountry);
      }
    }

    setFilteredCountries(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await performSync();
    await loadCountries();
    setRefreshing(false);
  };

  const renderSkeletonList = () => (
    <View>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonCountryItem key={i} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={loading ? [] : filteredCountries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CountryListItem
            flag={item.flag}
            name={item.name}
            price={item.pricePerGb}
            currency={item.currency}
            onPress={() => handleCountryPress(item.code)}
          />
        )}
        ListHeaderComponent={
          <ScrollView
            scrollEnabled={false}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.logo}>SOLO</Text>
              <Text style={styles.tagline}>
                {user ? `Welcome back` : 'the wise decision'}
              </Text>

              <View style={styles.searchContainer}>
                <Search size={18} color={colors.gray[600]} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search 170+ countries..."
                  placeholderTextColor={colors.gray[500]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <X
                    size={18}
                    color={colors.gray[600]}
                    onPress={() => setSearchQuery('')}
                  />
                )}
              </View>

              {searchQuery.length > 0 && (
                <Text style={[styles.tagline, { marginBottom: spacing[3], fontStyle: 'normal' }]}>
                  Searching all countries for "{searchQuery}"
                </Text>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  title="Buy eSIM"
                  onPress={() => {
                    haptics.light();
                    router.push('/buy');
                  }}
                  style={styles.halfButton}
                  size="lg"
                />
                {user ? (
                  <Button
                    title="My eSIMs"
                    onPress={() => {
                      haptics.light();
                      router.push('/(tabs)/esims');
                    }}
                    variant="outline"
                    style={styles.halfButton}
                    size="lg"
                  />
                ) : (
                  <Button
                    title="Login"
                    onPress={() => {
                      haptics.light();
                      router.push('/login');
                    }}
                    variant="outline"
                    style={styles.halfButton}
                    size="lg"
                  />
                )}
              </View>
            </View>

            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Why SOLO?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <FeatureCard
                  icon={<Text style={{ fontSize: 24 }}>*</Text>}
                  title="Instant Setup"
                  description="Activate in minutes, not hours"
                />
                <FeatureCard
                  icon={<Text style={{ fontSize: 24 }}>+</Text>}
                  title="Global Coverage"
                  description="Works in 170+ countries"
                />
                <FeatureCard
                  icon={<Text style={{ fontSize: 24 }}>$</Text>}
                  title="Best Prices"
                  description="Transparent pricing, no hidden fees"
                />
              </ScrollView>
            </View>

            {!searchQuery && (
              <TabBar
                tabs={categories}
                activeTab={activeCategory}
                onTabChange={handleTabChange}
              />
            )}
          </ScrollView>
        }
        contentContainerStyle={styles.countryList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.black}
          />
        }
        ListEmptyComponent={
          loading ? (
            renderSkeletonList()
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery ? `No countries found for "${searchQuery}"` : 'No countries found'}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
