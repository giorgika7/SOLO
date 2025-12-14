import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Image, Share, Clipboard as RNClipboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Copy, Check, Share2 } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { haptics } from '@/utils/haptics';
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
  qrSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  qrCard: {
    padding: spacing[6],
    alignItems: 'center',
    width: '100%',
  },
  qrPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  qrText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    textAlign: 'center',
  },
  qrImage: {
    width: 250,
    height: 250,
    marginBottom: spacing[4],
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
    marginBottom: spacing[3],
  },
  infoCard: {
    padding: spacing[4],
  },
  infoRow: {
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
  copyableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyButton: {
    padding: spacing[2],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    marginBottom: spacing[2],
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  dataUsageContainer: {
    marginBottom: spacing[3],
  },
  dataBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginVertical: spacing[2],
  },
  dataFill: {
    height: '100%',
    backgroundColor: colors.black,
  },
  dataText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: spacing[3],
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  stepNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.black,
    lineHeight: typography.lineHeight.relaxed,
  },
});

export default function EsimDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [esim, setEsim] = useState<Esim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (user && id) {
      loadEsimDetails();
    }
  }, [id, user]);

  const loadEsimDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('esims')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (fetchError) {
        setError('eSIM not found');
      } else {
        setEsim(data as any);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load eSIM details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = useCallback(async (text: string, label: string, fieldId: string) => {
    RNClipboard.setString(text);
    haptics.success();
    setCopiedField(fieldId);
    showToast(`${label} copied to clipboard`, 'success');

    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  }, [showToast]);

  const handleShare = async () => {
    if (!esim) return;

    try {
      await Share.share({
        message: `eSIM Activation Details\n\nICCID: ${esim.iccid}\nActivation Code: ${esim.activationCode}\n\nScan QR code or use manual activation.`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'expired':
        return colors.error;
      default:
        return colors.gray[500];
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (!esim) {
    return (
      <View style={[styles.container, { padding: spacing[4] }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.black} />
          </TouchableOpacity>
        </View>
        <ErrorMessage message={error || 'eSIM not found'} />
      </View>
    );
  }

  const usagePercentage = esim.dataTotal > 0 ? (esim.dataUsed / esim.dataTotal) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{esim.countryName || 'eSIM Details'}</Text>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(esim.status) }]}>
        <Text style={styles.statusText}>
          {esim.status.charAt(0).toUpperCase() + esim.status.slice(1)}
        </Text>
      </View>

      <View style={styles.qrSection}>
        <Card style={styles.qrCard}>
          {esim.qrCode ? (
            <Image source={{ uri: esim.qrCode }} style={styles.qrImage} resizeMode="contain" />
          ) : (
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrText}>QR Code</Text>
              <Text style={[styles.qrText, { marginTop: spacing[2] }]}>
                Use manual activation code below
              </Text>
            </View>
          )}
          <Button
            title="Share QR Code"
            onPress={handleShare}
            variant="outline"
            size="sm"
            icon={<Share2 size={16} color={colors.black} />}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Usage</Text>
        <Card style={styles.infoCard}>
          <View style={styles.dataUsageContainer}>
            <View style={styles.dataBar}>
              <View style={[styles.dataFill, { width: `${usagePercentage}%` }]} />
            </View>
            <Text style={styles.dataText}>
              {formatDataAmount(esim.dataUsed)} / {formatDataAmount(esim.dataTotal)} used ({usagePercentage.toFixed(0)}%)
            </Text>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activation Details</Text>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ICCID</Text>
            <View style={styles.copyableRow}>
              <Text style={styles.infoValue}>{esim.iccid}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopy(esim.iccid, 'ICCID', 'iccid')}
              >
                {copiedField === 'iccid' ? (
                  <Check size={20} color={colors.success} />
                ) : (
                  <Copy size={20} color={colors.gray[600]} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Activation Code</Text>
            <View style={styles.copyableRow}>
              <Text style={[styles.infoValue, { flex: 1 }]} numberOfLines={1} ellipsizeMode="middle">
                {esim.activationCode}
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopy(esim.activationCode, 'Activation Code', 'activation')}
              >
                {copiedField === 'activation' ? (
                  <Check size={20} color={colors.success} />
                ) : (
                  <Copy size={20} color={colors.gray[600]} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SM-DP+ Address</Text>
            <Text style={styles.infoValue}>1$lpa.eSimAccess.com$</Text>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Package Information</Text>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Package Name</Text>
            <Text style={styles.infoValue}>{esim.packageName || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Purchase Date</Text>
            <Text style={styles.infoValue}>
              {new Date(esim.purchaseDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expiry Date</Text>
            <Text style={styles.infoValue}>
              {esim.expiryDate ? new Date(esim.expiryDate).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Installation Instructions</Text>
        <Card style={styles.infoCard}>
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Go to Settings → Mobile Network / Cellular</Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Select "Add Cellular Plan" or "Add eSIM"</Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Scan the QR code above or enter the activation code manually
            </Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>Label your plan and confirm activation</Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <Text style={styles.stepText}>
              Turn on Data Roaming for this line to use mobile data
            </Text>
          </View>
        </Card>
      </View>

      <Button
        title="Top Up Data"
        onPress={() => router.push(`/esim/${esim.id}/topup`)}
        size="lg"
        style={{ marginBottom: spacing[4] }}
        disabled={esim.status === 'expired'}
      />
    </ScrollView>
  );
}
