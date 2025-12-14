import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProcessingModal } from '@/components/ProcessingModal';
import { esimAccessApi } from '@/services/esimApi';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { useOrder } from '@/contexts/OrderContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { haptics } from '@/utils/haptics';
import { formatDataAmount } from '@/utils/formatters';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[6],
    paddingTop: spacing[2],
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
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
    marginBottom: spacing[3],
  },
  summaryCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[300],
    paddingTop: spacing[3],
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
  },
  summaryTotalValue: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
    color: colors.black,
  },
  button: {
    marginTop: spacing[2],
  },
  discountContainer: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing[2],
    marginTop: spacing[2],
  },
  discountText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});

export default function BuyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { selectedPackage } = useOrder();
  const { isConnected } = useNetworkStatus();

  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [testMode, setTestMode] = useState(true);

  console.log('📦 Buy Screen: Selected package from context:', selectedPackage);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    checkBalance();
  }, [user]);

  useEffect(() => {
    if (!selectedPackage) {
      console.log('⚠️ Buy Screen: No package selected, redirecting to home');
      showToast('Please select a package first', 'error');
      router.replace('/(tabs)');
    }
  }, [selectedPackage]);

  const checkBalance = async () => {
    try {
      setCheckingBalance(true);
      const response = await esimAccessApi.queryBalance();

      if (response.success && response.data) {
        setBalance(response.data.balance);
      }
    } catch (err) {
      console.error('Failed to check balance:', err);
    } finally {
      setCheckingBalance(false);
    }
  };

  const handleOrder = async () => {
    if (!selectedPackage) {
      showToast('No package selected', 'error');
      return;
    }

    if (!isConnected) {
      haptics.error();
      showToast('No internet connection', 'error');
      return;
    }

    if (!email.trim()) {
      haptics.warning();
      setError('Please enter your email');
      return;
    }

    if (balance !== null && balance < selectedPackage.retail_price && !testMode) {
      haptics.error();
      setError(`Insufficient balance. You have $${balance.toFixed(2)} but need $${selectedPackage.retail_price.toFixed(2)}`);
      return;
    }

    haptics.light();

    try {
      setProcessing(true);
      setError(null);

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (testMode && user) {
        const mockOrderNo = `SOLO-${Date.now()}`;
        const mockIccid = `8901260${Math.random().toString().slice(2, 15)}`;
        const mockActivationCode = `LPA:1$lpa.esimaccess.com$${mockIccid}`;
        const mockQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mockActivationCode)}`;

        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            order_no: mockOrderNo,
            package_id: null,
            amount: selectedPackage.retail_price,
            currency: selectedPackage.currency,
            status: 'completed',
            payment_method: 'simulation',
            email: email,
          });

        if (orderError) throw orderError;

        const { error: esimError } = await supabase
          .from('esims')
          .insert({
            user_id: user.id,
            order_no: mockOrderNo,
            country_id: null,
            package_id: null,
            country_name: selectedPackage.country_name,
            package_name: selectedPackage.package_code,
            iccid: mockIccid,
            activation_code: mockActivationCode,
            qr_code: mockQrCode,
            status: 'active',
            data_used: 0,
            data_total: selectedPackage.data_amount,
            purchase_date: new Date().toISOString(),
            expiry_date: new Date(Date.now() + selectedPackage.validity * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (esimError) throw esimError;

        setProcessing(false);
        haptics.success();
        showToast('eSIM purchased successfully!', 'success');

        setTimeout(() => {
          router.push('/(tabs)/esims');
        }, 500);
      } else {
        const response = await esimAccessApi.orderEsim(selectedPackage.package_code, 1);

        if (response.success && response.data) {
          const orderData = response.data;

          if (user) {
            await supabase.from('orders').insert({
              user_id: user.id,
              order_no: orderData.orderNo,
              package_id: null,
              amount: orderData.totalPrice,
              currency: 'USD',
              status: 'pending',
              payment_method: 'balance',
              email: email,
            });
          }

          setProcessing(false);
          haptics.success();
          showToast('Order placed successfully!', 'success');
          router.push('/(tabs)/esims');
        } else {
          throw new Error(response.error || 'Failed to place order');
        }
      }
    } catch (err) {
      setProcessing(false);
      haptics.error();
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  if (!selectedPackage) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing[4] }]}>
        <LoadingSpinner size="large" />
        <Text style={[styles.subtitle, { marginTop: spacing[4] }]}>Loading package details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Purchase</Text>
        <Text style={styles.subtitle}>Review and confirm your order</Text>
      </View>

      {error && <ErrorMessage message={error} />}

      {checkingBalance && (
        <Card style={styles.summaryCard} shadow="none">
          <LoadingSpinner size="small" />
          <Text style={[styles.summaryLabel, { textAlign: 'center', marginTop: spacing[2] }]}>
            Checking balance...
          </Text>
        </Card>
      )}

      {balance !== null && !checkingBalance && (
        <Card style={styles.summaryCard} shadow="none">
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Your Balance</Text>
            <Text style={styles.summaryValue}>${balance.toFixed(2)}</Text>
          </View>
        </Card>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Package Details</Text>
        <Card style={styles.summaryCard} shadow="none">
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Location</Text>
            <Text style={styles.summaryValue}>{selectedPackage.country_name} ({selectedPackage.country_code})</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Data</Text>
            <Text style={styles.summaryValue}>{formatDataAmount(selectedPackage.data_amount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Validity</Text>
            <Text style={styles.summaryValue}>{selectedPackage.validity} days</Text>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email Address</Text>
        <Input
          placeholder="your@email.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <Card style={styles.summaryCard} shadow="none">
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Package Price</Text>
          <Text style={styles.summaryValue}>${selectedPackage.retail_price.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>${selectedPackage.retail_price.toFixed(2)}</Text>
        </View>
      </Card>

      {user && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing[4], marginBottom: spacing[2], paddingHorizontal: spacing[2] }}>
          <Text style={styles.summaryLabel}>Test Mode (Create instant mock eSIM)</Text>
          <Switch
            value={testMode}
            onValueChange={setTestMode}
            trackColor={{ false: colors.gray[300], true: colors.black }}
            thumbColor={colors.white}
          />
        </View>
      )}

      <Button
        title={testMode ? 'Purchase eSIM (Simulation)' : `Order eSIM - $${selectedPackage.retail_price.toFixed(2)}`}
        onPress={handleOrder}
        loading={processing}
        size="lg"
        style={styles.button}
        disabled={(!testMode && balance !== null && balance < selectedPackage.retail_price) || !isConnected}
      />

      {!isConnected && (
        <Text style={[styles.subtitle, { textAlign: 'center', marginTop: spacing[2], color: colors.error }]}>
          No internet connection. Please check your network.
        </Text>
      )}

      {balance !== null && balance < selectedPackage.retail_price && !testMode && (
        <Text style={[styles.subtitle, { textAlign: 'center', marginTop: spacing[2], color: colors.error }]}>
          Insufficient balance. Please contact support to add funds.
        </Text>
      )}

      <ProcessingModal
        visible={processing}
        title="Processing Payment"
        message="Please wait while we create your eSIM..."
      />
    </ScrollView>
  );
}
