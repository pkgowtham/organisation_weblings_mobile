import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/CustomThemeContext';
import ScrollTabs from '@/components/ui/scrollTabs';
import BillingContent from '@/components/billing/billingContent';
import PaymentHistory from '@/components/billing/paymentHistory';
import Transactions from '@/components/billing/transactions';
import EOfficeTopBar from '@/components/ui/eOfficeTopBar';
import { useDrawer } from '@/context/DrawerContext';

const BILLING_TABS = ['Billing', 'Payment History', 'Transactions'];

export default function BillingScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = createStyles(theme, insets);
  const { openDrawer } = useDrawer();

  const [activeTab, setActiveTab] = useState('Billing');

  const renderContent = () => {
    switch (activeTab) {
      case 'Billing':
        return <BillingContent />;
      case 'Payment History':
        return <PaymentHistory />;
      case 'Transactions':
        return <Transactions />;
      default:
        return <BillingContent />;
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <EOfficeTopBar
        heading="Billing"
        onMenuPress={() => openDrawer('accounts')}
      />

      {/* Subtabs Header */}
      <View style={styles.tabsHeader}>
        <ScrollTabs
          tabs={BILLING_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          containerStyle={styles.tabsContainer}
        />
      </View>
      <View style={styles.tabDivider} />

      {/* Active Tab Screen */}
      {renderContent()}
    </SafeAreaView>
  );
}

const createStyles = (theme: any, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.light,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: theme.colors.neutral.surface.lighter,
      shadowColor: theme.colors.neutral.surface.inverse,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    titleText: {
      fontSize: 20,
    },
    tabsHeader: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      paddingTop: 8,
      paddingHorizontal: 16,
    },
    tabsContainer: {
      paddingHorizontal: 0,
    },
    tabDivider: {
      height: 1,
      backgroundColor: theme.colors.neutral.border.light,
    },
  });
