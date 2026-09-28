import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/CustomThemeContext';
import { RegularText } from '@/components/ui/typography';
import EOfficeTopBar from '@/components/ui/eOfficeTopBar';
import { useDrawer } from '@/context/DrawerContext';
import SupportTicketForm from '@/components/support/SupportTicketForm';
import SupportFaqAccordion from '@/components/support/SupportFaqAccordion';
import SupportContactCards from '@/components/support/SupportContactCards';

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { openDrawer } = useDrawer();

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <EOfficeTopBar heading="Support" onMenuPress={() => openDrawer('accounts')} />

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Description */}
          <View style={styles.headerContainer}>
            <RegularText
              fontVariant="BS"
              color="colors.neutral.onSurface.dark"
              style={styles.centerSubtitle}
            >
              Submit your support request and our team will get back to you shortly
            </RegularText>
          </View>

          {/* Main Support Form */}
          <SupportTicketForm />

          {/* FAQs Accordion */}
          <SupportFaqAccordion />

          {/* Direct Contact Cards */}
          <SupportContactCards />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    flex1: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    headerContainer: {
      marginBottom: 20,
    },
    centerSubtitle: {
      textAlign: 'center',
    },
  });