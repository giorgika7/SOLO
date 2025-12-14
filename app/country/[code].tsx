import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { supabase } from '@/services/supabase';
import { haptics } from '@/utils/haptics';
import { formatDataAmount } from '@/utils/formatters';
import { useOrder } from '@/contexts/OrderContext';
import { useToast } from '@/contexts/ToastContext';
import type { EsimAccessPackage } from '@/types';

interface CountryData {
  id: string;
  code: string;
  name: string;
  flag: string;
  region: string;
  package_count: number;
}

interface PackageData {
  id: string;
  package_code: string;
  package_name: string;
  location_name: string;
  data_amount: number;
  validity_days: number;
  price: number;
  retail_price: number;
  currency: string;
  description: string | null;
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
  countryHeader: {
    flex: 1,
  },
  countryFlag: {
    fontSize: 48,
    marginRight: spacing[3],
  },
  countryName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  countryRegion: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing[1],
  },
  infoSection: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
    marginBottom: spacing[3],
  },
  infoItem: {
    marginBottom: spacing[3],
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing[1],
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.black,
  },
  packageCard: {
    marginBottom: spacing[3],
    padding: spacing[4],
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  packageData: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  packagePrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  packageValidity: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing[3],
  },
});

export default function CountryDetailScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { setSelectedPackage } = useOrder();
  const { showToast } = useToast();
  const [selectedPackageCode, setSelectedPackageCode] = useState<string | null>(null);
  const [country, setCountry] = useState<CountryData | null>(null);
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCountryData();
  }, [code]);

  const loadCountryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: countryData, error: countryError } = await supabase
        .from('countries')
        .select('*')
        .eq('code', code)
        .single();

      if (countryError) {
        setError('Country not found');
        setLoading(false);
        return;
      }

      setCountry(countryData);

      const { data: packagesData, error: packagesError } = await supabase
        .from('esim_packages')
        .select('*')
        .eq('country_id', countryData.id)
        .order('retail_price', { ascending: true });

      if (packagesError) {
        console.error('Error loading packages:', packagesError);
        setError('Failed to load packages');
      } else {
        setPackages(packagesData || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load country data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg: PackageData) => {
    haptics.light();
    console.log('📦 Country Detail: Selecting package:', pkg.package_code, 'for country:', code);

    if (!country) {
      showToast('Country data not loaded', 'error');
      return;
    }

    setSelectedPackage({
      id: pkg.id,
      package_code: pkg.package_code,
      package_name: pkg.package_name,
      country_name: country.name,
      country_code: country.code,
      data_amount: pkg.data_amount,
      validity: pkg.validity_days,
      price: pkg.price,
      retail_price: pkg.retail_price,
      currency: pkg.currency,
      description: pkg.description,
    });

    showToast('Package selected', 'success');
    haptics.success();

    router.push('/(tabs)/buy');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (!country) {
    return (
      <View style={[styles.container, { padding: spacing[4] }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.black} />
          </TouchableOpacity>
        </View>
        <ErrorMessage message={error || 'Country not found'} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.black} />
        </TouchableOpacity>
        <View style={styles.countryHeader}>
          <Text style={styles.countryName}>{country.flag} {country.name}</Text>
          <Text style={styles.countryRegion}>{country.region}</Text>
        </View>
      </View>

      {error && <ErrorMessage message={error} />}

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Coverage Information</Text>
        <Card style={{ padding: spacing[4] }}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Available Packages</Text>
            <Text style={styles.infoValue}>{country.package_count} data plans</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Region</Text>
            <Text style={styles.infoValue}>{country.region}</Text>
          </View>
        </Card>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Available Packages</Text>
        {packages.length === 0 && !loading && (
          <Text style={styles.infoLabel}>No packages available for this location</Text>
        )}
        {packages.map((pkg) => {
          const cardStyle: ViewStyle = selectedPackageCode === pkg.package_code
            ? { ...styles.packageCard, borderWidth: 2, borderColor: colors.black }
            : styles.packageCard;

          return (
          <Card
            key={pkg.id}
            style={cardStyle}
          >
            <View style={styles.packageHeader}>
              <Text style={styles.packageData}>{formatDataAmount(pkg.data_amount)}</Text>
              <Text style={styles.packagePrice}>${pkg.retail_price.toFixed(2)}</Text>
            </View>
            <Text style={styles.packageValidity}>Valid for {pkg.validity_days} days</Text>
            {pkg.description && (
              <Text style={[styles.packageValidity, { marginBottom: spacing[2] }]}>{pkg.description}</Text>
            )}
            <Button
              title="Select Package"
              onPress={() => handleSelectPackage(pkg)}
              size="sm"
              variant={selectedPackageCode === pkg.package_code ? 'primary' : 'outline'}
            />
          </Card>
          );
        })}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Installation Instructions</Text>
        <Card style={{ padding: spacing[4] }}>
          <Text style={styles.infoValue}>1. Go to Settings → Mobile Network</Text>
          <Text style={[styles.infoValue, { marginTop: spacing[2] }]}>2. Select "Add Cellular Plan"</Text>
          <Text style={[styles.infoValue, { marginTop: spacing[2] }]}>3. Scan QR code or enter activation code</Text>
          <Text style={[styles.infoValue, { marginTop: spacing[2] }]}>4. Confirm and activate</Text>
        </Card>
      </View>
    </ScrollView>
  );
}
