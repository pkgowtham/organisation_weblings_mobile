import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import { ChevronDownIcon } from './SupportIcons';

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: 'How to verify my domain ?',
    answer: 'Go to Org setup > Domain tab and enter the TXT record in your DNS provider. Verification takes 5 to 10 minutes.',
  },
  {
    question: 'How do I import my employees ?',
    answer: 'Go to Business Hub > Employees and click Add Member or import via CSV file.',
  },
  {
    question: 'How do I create project ?',
    answer: 'Navigate to Business Hub > Projects tab and click + Add to open the Project Create form.',
  },
  {
    question: 'How do I change my subscription ?',
    answer: 'Access the Billing section from the sidebar menu to change or upgrade your subscription plan.',
  },
  {
    question: 'How can I reset my password ?',
    answer: 'Click your avatar in top header > Settings or select Reset Password on the login screen.',
  },
];

export default function SupportFaqAccordion() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <View style={styles.faqSection}>
      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={{ marginBottom: theme.spacing.s300 }}>
        Frequently Asked Questions
      </Typography>

      <View style={styles.faqList}>
        {FAQS.map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <View key={idx} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestionRow}
                onPress={() => setOpenFaqIndex(isOpen ? null : idx)}
                activeOpacity={0.7}
              >
                <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light" style={{ flex: 1 }}>
                  {faq.question}
                </Typography>
                <View style={[styles.faqChevron, isOpen && { transform: [{ rotate: '180deg' }] }]}>
                  <ChevronDownIcon color={theme.colors.neutral.onSurface.medium} />
                </View>
              </TouchableOpacity>
              {isOpen && (
                <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.faqAnswer}>
                  {faq.answer}
                </Typography>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    faqSection: {
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius?.b200 || 8,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.neutral.surface.light,
      marginBottom: 20,
    },
    faqList: {
      gap: 12,
    },
    faqItem: {
      borderWidth: 1,
      borderColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius?.b100 || 4,
      padding: 14,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    faqQuestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    faqChevron: {
      marginLeft: 8,
    },
    faqAnswer: {
      marginTop: 10,
      lineHeight: 20,
    },
  });
