import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, useWindowDimensions } from 'react-native';
import { Typography, SemiBoldText } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import { MailIcon, PhoneIcon } from './SupportIcons';

export default function SupportContactCards() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={[styles.contactCardsRow, !isDesktop && styles.columnMobile]}>
      {/* Direct Email */}
      <TouchableOpacity
        style={styles.contactCard}
        onPress={() => Linking.openURL('mailto:support@weblings.com')}
        activeOpacity={0.8}
      >
        <View style={styles.contactHeader}>
          <MailIcon color={theme.colors.neutral.onSurface.light} size={20} />
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light">
            Direct Email
          </Typography>
        </View>
        <SemiBoldText fontVariant="BS" color="colors.brand.surface.medium" style={{ marginTop: 6 }}>
          support@weblings.com
        </SemiBoldText>
      </TouchableOpacity>

      {/* Phone Support */}
      <TouchableOpacity
        style={styles.contactCard}
        onPress={() => Linking.openURL('tel:+18005550199')}
        activeOpacity={0.8}
      >
        <View style={styles.contactHeader}>
          <PhoneIcon color={theme.colors.neutral.onSurface.light} size={20} />
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light">
            Phone Support
          </Typography>
        </View>
        <SemiBoldText fontVariant="BS" color="colors.brand.surface.medium" style={{ marginTop: 6 }}>
          +1 (800) 555-0199
        </SemiBoldText>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    contactCardsRow: {
      flexDirection: 'row',
      gap: 16,
    },
    columnMobile: {
      flexDirection: 'column',
    },
    contactCard: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius?.b200 || 8,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.neutral.surface.light,
    },
    contactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });
