import { useTheme } from '@/context/CustomThemeContext';
import { useDrawer } from '@/context/DrawerContext';
import { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import OrgDetails from '@/components/accounts/orgDetails';
import OrgSetup from '@/components/accounts/orgSetup';
import EmailList from '@/components/accounts/emailList';
import Settings from '@/components/accounts/settings';
import EOfficeTopBar from '@/components/ui/eOfficeTopBar';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = createStyles(theme, insets);
  const { openDrawer, selectedAccountsLabel } = useDrawer();
  const { safePush } = useSafeNavigation();

  const renderContent = () => {
    switch (selectedAccountsLabel) {
      case 'Org Details':
        return <OrgDetails />;
      case 'Email List':
        return <EmailList />;
      case 'Settings':
        return <Settings />;
      default:
        return <OrgDetails />;
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <EOfficeTopBar
        heading={selectedAccountsLabel || 'Org Details'}
        onMenuPress={() => openDrawer('accounts')}
      />

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
}

const createStyles = (theme: any, insets: any) => StyleSheet.create({
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
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  spacer: {
    width: 40,
  },
});