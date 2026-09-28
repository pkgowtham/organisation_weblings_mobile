import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import SectionCard from '@/components/ui/sectionCard';
import CustomButton from '@/components/ui/button';
import Tag from '@/components/ui/tag';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ──────────────────────────────────────────────────────────────
//  BillingContent — Domain & Plan details matching web mockup
// ──────────────────────────────────────────────────────────────

export default function BillingContent() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  const [autoRenewDomain, setAutoRenewDomain] = useState(true);
  const [autoRenewPlan, setAutoRenewPlan] = useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Card 1: Domain ────────────────────────────────────────── */}
      <SectionCard title="Domain">
        {/* Header Actions Row */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.autoRenewGroup}>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.dark">
              Auto Renew
            </Typography>
            <Switch
              value={autoRenewDomain}
              onValueChange={setAutoRenewDomain}
              trackColor={{ false: theme.colors.neutral.surface.medium, true: theme.colors.brand.surface.medium }}
              thumbColor={theme.colors.neutral.surface.lighter}
            />
          </View>
          <CustomButton
            title="Manage Domain"
            variant="outline"
            size="xs"
            onPress={() => { }}
          />
        </View>

        {/* Green Domain Banner */}
        <View style={styles.domainBanner}>
          <View style={styles.domainBannerLeft}>
            <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light">
              Domainname.net
            </Typography>
            <Tag label="Active" color="positive" variant="filled" labelFontVariant="BXS" />
          </View>
          <View style={styles.domainBannerRight}>
            <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.light">
              Renewel $15 / year
            </Typography>
            <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
              On 11 Sep, 2025
            </Typography>
          </View>
        </View>

        {/* Last Purchased Details */}
        <View style={styles.lastPurchasedRow}>
          <Typography fontVariant="BS" variant="medium" color="colors.neutral.onSurface.dark">
            Last Purchased
          </Typography>
          <View style={styles.lastPurchasedRight}>
            <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.light">
              $17 / year
            </Typography>
            <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
              On Sep 11 2024
            </Typography>
            <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
              Expiration Date 11.11.2024
            </Typography>
          </View>
        </View>
      </SectionCard>

      {/* ── Card 2: Plan ─────────────────────────────────────────── */}
      <SectionCard title="Plan">
        {/* Header Actions Row */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.autoRenewGroup}>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.dark">
              Auto Renew
            </Typography>
            <Switch
              value={autoRenewPlan}
              onValueChange={setAutoRenewPlan}
              trackColor={{ false: theme.colors.neutral.surface.medium, true: theme.colors.brand.surface.medium }}
              thumbColor={theme.colors.neutral.surface.lighter}
            />
          </View>
          <View style={styles.buttonGroup}>
            <CustomButton
              title="View Plans"
              variant="outline"
              size="xs"
              onPress={() => { }}
            />
            <CustomButton
              title="Change Plan"
              variant="primary"
              size="xs"
              onPress={() => { }}
            />
          </View>
        </View>

        {/* Plan Content Grid */}
        <View style={styles.planContentContainer}>
          {/* Upcoming Bill Box (Light Blue) */}
          <View style={styles.upcomingBillCard}>
            <View style={styles.upcomingHeaderRow}>
              <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light">
                Upcoming Bill
              </Typography>
              <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                ( Due on : 11 Sep 2024 )
              </Typography>
            </View>

            <Typography fontVariant="HM" variant="bold" color="colors.neutral.onSurface.light" style={styles.priceText}>
              $1000
            </Typography>

            <View style={styles.cardDivider} />

            <View style={styles.threeColumnGrid}>
              <View style={styles.gridCol}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                  Standard Plan
                </Typography>
                <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
                  Monthly
                </Typography>
              </View>
              <View style={styles.gridCol}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                  Plan cost
                </Typography>
                <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
                  $10/ Month/ user
                </Typography>
              </View>
              <View style={styles.gridCol}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                  Current Users
                </Typography>
                <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
                  100
                </Typography>
              </View>
            </View>
          </View>

          {/* Last Bill Summary Box */}
          <View style={styles.lastBillCard}>
            <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light" style={styles.lastBillTitle}>
              Last Bill Summary
            </Typography>

            {/* Row 1 */}
            <View style={styles.threeColumnGrid}>
              <View style={styles.gridCol}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                  Total
                </Typography>
                <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.light">
                  $1000
                </Typography>
              </View>
              <View style={styles.gridCol}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                  Invoiced Date
                </Typography>
                <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
                  11 Aug 2024
                </Typography>
              </View>
              <View style={styles.gridCol}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                  Paid Date
                </Typography>
                <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
                  11 Aug 2024
                </Typography>
              </View>
            </View>

            <View style={{ height: 16 }} />

            {/* Row 2 */}
            <View style={styles.threeColumnGrid}>
              <View style={styles.gridCol}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                  Standard Plan
                </Typography>
                <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
                  Monthly
                </Typography>
              </View>
              <View style={styles.gridCol}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                  Plan cost
                </Typography>
                <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
                  $10/ Month/ user
                </Typography>
              </View>
              <View style={styles.gridCol}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                  Users
                </Typography>
                <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
                  100
                </Typography>
              </View>
            </View>
          </View>
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.light,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.s400,
      paddingTop: theme.spacing.s300,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.s400,
      flexWrap: 'wrap',
      gap: theme.spacing.s200,
    },
    autoRenewGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s200,
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: theme.spacing.s200,
    },
    // Domain banner styles
    domainBanner: {
      backgroundColor: theme.colors.positive.surface.lighter,
      borderColor: theme.colors.positive.border.medium,
      borderWidth: 1,
      borderRadius: theme.borderRadius.b200,
      padding: theme.spacing.s300,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.s400,
    },
    domainBannerLeft: {
      flexDirection: 'row',
      gap: theme.spacing.s200,
    },
    domainBannerRight: {
      alignItems: 'flex-end',
    },
    lastPurchasedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingTop: theme.spacing.s100,
    },
    lastPurchasedRight: {
      alignItems: 'flex-end',
    },
    // Plan content styles
    planContentContainer: {
      gap: theme.spacing.s400,
    },
    upcomingBillCard: {
      backgroundColor: theme.colors.brand.surface.lighter,
      borderColor: theme.colors.brand.border.light,
      borderWidth: 1,
      borderRadius: theme.borderRadius.b200,
      padding: theme.spacing.s400,
    },
    upcomingHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s200,
    },
    priceText: {
      marginVertical: theme.spacing.s200,
    },
    cardDivider: {
      height: 1,
      backgroundColor: theme.colors.brand.border.light,
      marginVertical: theme.spacing.s300,
    },
    threeColumnGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    gridCol: {
      flex: 1,
    },
    lastBillCard: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderColor: theme.colors.neutral.border.light,
      borderWidth: 1,
      borderRadius: theme.borderRadius.b200,
      padding: theme.spacing.s400,
    },
    lastBillTitle: {
      marginBottom: theme.spacing.s300,
    },
  });
