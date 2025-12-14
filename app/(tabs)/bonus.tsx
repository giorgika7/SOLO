import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Share } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

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
  balanceCard: {
    backgroundColor: colors.black,
    padding: spacing[6],
    marginBottom: spacing[6],
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[400],
    marginBottom: spacing[2],
  },
  balanceAmount: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
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
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.black,
    marginBottom: spacing[2],
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    lineHeight: typography.lineHeight.relaxed,
  },
  referralCode: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[300],
    padding: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  referralLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing[2],
  },
  referralCodeText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
    marginBottom: spacing[2],
    fontFamily: 'Courier New',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  button: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
  },
});

export default function BonusScreen() {
  const [userBalance] = useState(45.5);
  const [referralCode] = useState('SOLO2024ABC');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on SOLO eSIM! Use my referral code ${referralCode} to get bonus credits. Download now: https://solo-esim.com`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleCopyCode = () => {
    // Copy to clipboard functionality
    alert(`Referral code copied: ${referralCode}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Bonus & Referrals</Text>
        <Text style={styles.subtitle}>Earn rewards by inviting friends</Text>
      </View>

      <Card style={styles.balanceCard} shadow="none">
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>${userBalance.toFixed(2)}</Text>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Referral Code</Text>
        <Card style={styles.referralCode} shadow="none">
          <Text style={styles.referralLabel}>Share this code with friends</Text>
          <Text style={styles.referralCodeText}>{referralCode}</Text>
          <View style={styles.buttonContainer}>
            <Button
              title="Copy"
              onPress={handleCopyCode}
              variant="outline"
              style={styles.button}
              size="sm"
            />
            <Button
              title="Share"
              onPress={handleShare}
              style={styles.button}
              size="sm"
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Share Your Code</Text>
          <Text style={styles.infoText}>
            Send your referral code to friends and family
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>They Sign Up</Text>
          <Text style={styles.infoText}>
            Your friend uses your code when signing up
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>You Earn</Text>
          <Text style={styles.infoText}>
            Get $10 bonus credit for each successful referral
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>Invites Sent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>$50</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
