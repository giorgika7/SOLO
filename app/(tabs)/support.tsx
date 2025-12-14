import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/constants/theme';
import { TabBar } from '@/components/TabBar';
import { CollapsibleFAQ } from '@/components/CollapsibleFAQ';

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
  faqContainer: {
    marginTop: spacing[4],
  },
});

interface FAQ {
  title: string;
  content: string;
}

interface FAQCategory {
  [key: string]: FAQ[];
}

const FAQS: FAQCategory = {
  Troubleshooting: [
    {
      title: 'eSIM is not activating',
      content:
        'Make sure your device supports eSIM. Try restarting your phone and check your internet connection. If the issue persists, contact our support team.',
    },
    {
      title: 'How do I check my data usage?',
      content: 'Open the SOLO app and navigate to "My eSIMs". Your current usage will be displayed with a progress indicator.',
    },
    {
      title: 'Can I use multiple eSIMs at once?',
      content: 'Yes, if your device supports multiple eSIM profiles. However, only one can be active at a time for data.',
    },
    {
      title: 'What if I lost my QR code?',
      content: 'You can regenerate your QR code anytime in the SOLO app under "My eSIMs". Click on the specific eSIM and select "Generate QR Code".',
    },
  ],
  Installation: [
    {
      title: 'How do I install an eSIM?',
      content:
        '1. Go to Settings > Mobile Network\n2. Select "Add Cellular Plan"\n3. Scan the QR code provided or enter the activation code manually\n4. Confirm and you\'re done!',
    },
    {
      title: 'Which devices support eSIM?',
      content:
        'Most modern smartphones support eSIM: iPhone XS and newer, Samsung Galaxy S20 and newer, Google Pixel 3 and newer, and many others. Check your device specifications.',
    },
    {
      title: 'Do I need to remove my physical SIM?',
      content: 'Not necessarily. You can keep both physical and eSIM active. However, only one can be used for data at a time.',
    },
    {
      title: 'How long does installation take?',
      content: 'Installation usually takes 2-5 minutes. After activation, you should see the network immediately.',
    },
  ],
  'About eSIM': [
    {
      title: 'What is eSIM?',
      content:
        'eSIM (embedded SIM) is a digital SIM card built into your device. Unlike physical SIM cards, eSIMs allow you to switch between carriers without changing hardware.',
    },
    {
      title: 'Is eSIM secure?',
      content: 'Yes, eSIMs use the same security protocols as physical SIM cards. Your data is encrypted and protected.',
    },
    {
      title: 'Can I switch between SIM cards?',
      content: 'Yes, you can switch between multiple eSIMs or between eSIM and physical SIM through your device settings.',
    },
    {
      title: 'Will I lose service when switching?',
      content: 'You may experience a brief interruption (usually a few seconds) when switching between eSIM profiles.',
    },
  ],
};

export default function SupportScreen() {
  const [activeTab, setActiveTab] = useState<string>('Troubleshooting');

  const tabs = Object.keys(FAQS);
  const currentFaqs = FAQS[activeTab] || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Support</Text>
        <Text style={styles.subtitle}>Find answers to common questions</Text>
      </View>

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <View style={styles.faqContainer}>
        {currentFaqs.map((faq: FAQ, index: number) => (
          <CollapsibleFAQ
            key={index}
            title={faq.title}
            content={faq.content}
            expanded={index === 0}
          />
        ))}
      </View>
    </ScrollView>
  );
}
