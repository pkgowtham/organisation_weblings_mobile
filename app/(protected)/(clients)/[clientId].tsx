import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/typography';
import ScrollTabs from '@/components/ui/scrollTabs';
import { useTheme } from '@/context/CustomThemeContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { ArrowBackIos, Search } from '@/svg_icons';
import Input from '@/components/ui/textInput';
import CustomButton from '@/components/ui/button';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import Tag from '@/components/ui/tag';
import Avatar from '@/components/ui/avatar';
import { Eye, Delete, CalendarToday, Document } from '@/svg_icons';

const CLIENT_TABS = ['Dashboard', 'Projects', 'Profile', 'Activity log'];

const PROJECT_DATA = [
  { id: 'p1', name: 'Corporate Intranet 2.0', daysLeft: '24 days left', teams: '2 teams' },
  { id: 'p2', name: 'E-commerce Platform Migration', daysLeft: '56 days left', teams: '4 teams' },
  { id: 'p3', name: 'Mobile App Development', daysLeft: '12 days left', teams: '1 team' },
];

export default function ClientDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safeBack, safePush } = useSafeNavigation();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [search, setSearch] = useState('');

  const renderMetadata = (label: string, value: string) => (
    <View style={styles.metaItem}>
      <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={styles.metaLabel}>{label}</Typography>
      <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light">{value}</Typography>
    </View>
  );

  const renderDashboardChart = () => (
    <View style={styles.chartCard}>
      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={{ marginBottom: theme.spacing.s400 }}>
        Estimated revenue
      </Typography>
      <View style={styles.chartArea}>
        <View style={styles.yAxis}>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">$100k</Typography>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">$50k</Typography>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">$0k</Typography>
        </View>
        <View style={styles.barsContainer}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.barGroup}>
              <View style={[styles.barLayer1, { height: 40 + Math.random() * 80 }]} />
              <View style={[styles.barLayer2, { height: 20 + Math.random() * 40 }]} />
            </View>
          ))}
        </View>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.brand.surface.medium }]} />
          <Typography fontVariant="LXS" color="colors.neutral.onSurface.light">Invoiced</Typography>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.info.surface.medium }]} />
          <Typography fontVariant="BS" color="colors.neutral.onSurface.light">Non-invoiced</Typography>
        </View>
      </View>
    </View>
  );

  const renderProjects = () => (
    <View style={styles.projectsContainer}>
      <View style={styles.projectsHeader}>
        <View style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
          <Input
            placeholder="Search projects"
            value={search}
            onChangeText={setSearch}
            leftIcon={<Search color={theme.colors.neutral.onSurface.light} />}
          />
        </View>
        <CustomButton title="+ New Project" variant="primary" size="small" />
      </View>
      <View style={styles.projectList}>
        {PROJECT_DATA.map((proj) => (
          <TouchableOpacity
            key={proj.id}
            style={styles.projectCard}
            onPress={() => safePush(`/(protected)/(projects)/${proj.id}`)}
          >
            <View>
              <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.light">{proj.name}</Typography>
              <View style={styles.projectTags}>
                <View style={styles.tag}><Typography fontVariant="BS" color="colors.neutral.onSurface.medium">{proj.daysLeft}</Typography></View>
                <View style={styles.tag}><Typography fontVariant="BS" color="colors.neutral.onSurface.medium">{proj.teams}</Typography></View>
              </View>
            </View>
            <View style={styles.projectArrow}>
              <ArrowBackIos color={theme.colors.neutral.onSurface.light} style={{ transform: [{ rotate: '180deg' }] }} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={safeBack} style={styles.backButton}>
            <ArrowBackIos color={theme.colors.neutral.onSurface.light} height={24} width={24} />
            <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light">
              Client Details
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Client Header Card */}
        <View style={styles.clientInfoCard}>
          <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.clientTitle}>
            Big Kahuna Burger Ltd.
          </Typography>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={styles.clientDesc}>
            A leading global fast food chain known for their delicious burgers and shakes.
          </Typography>

          <View style={styles.metaGrid}>
            {renderMetadata('Client code', 'CL-001')}
            {renderMetadata('GST number', '22AAAAA0000A1Z5')}
            {renderMetadata('Address', '123 Burger Lane, CA 90210')}
            {renderMetadata('SPOC', 'Ronald Richards')}
            {renderMetadata('Start date', '01 Jan 2023')}
            {renderMetadata('End date', '31 Dec 2025')}
            {renderMetadata('Currency', 'USD ($)')}
            {renderMetadata('Billing rate', '$150/hr')}
            {renderMetadata('Projects active', '4')}
            {renderMetadata('Total teams', '12')}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrapper}>
          <ScrollTabs
            tabs={CLIENT_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'Dashboard' && renderDashboardChart()}
          {activeTab === 'Projects' && renderProjects()}
          {(activeTab === 'Profile' || activeTab === 'Activity log') && (
            <View style={styles.placeholderContainer}>
              <Typography fontVariant="BM" color="colors.neutral.onSurface.medium">
                {activeTab} content under development...
              </Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.s600,
    },
    headerRow: {
      paddingHorizontal: theme.spacing.s400,
      paddingVertical: theme.spacing.s400,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s200,
    },
    clientInfoCard: {
      margin: theme.spacing.s400,
      padding: theme.spacing.s500,
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
    },
    clientTitle: {
      marginBottom: theme.spacing.s200,
    },
    clientDesc: {
      marginBottom: theme.spacing.s400,
      maxWidth: 600,
    },
    metaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: theme.spacing.s600,
      rowGap: theme.spacing.s400,
      paddingTop: theme.spacing.s300,
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral.border.light,
    },
    metaItem: {
      width: '45%',
      minWidth: 150,
      marginBottom: theme.spacing.s200,
    },
    metaLabel: {
      marginBottom: 4,
    },
    tabsWrapper: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      paddingHorizontal: theme.spacing.s400,
    },
    tabContent: {
      padding: theme.spacing.s400,
    },
    chartCard: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      padding: theme.spacing.s500,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
    },
    chartArea: {
      flexDirection: 'row',
      height: 200,
    },
    yAxis: {
      justifyContent: 'space-between',
      paddingRight: theme.spacing.s300,
      paddingBottom: 20,
    },
    barsContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      paddingBottom: 4,
    },
    barGroup: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    barLayer1: {
      width: 30,
      backgroundColor: theme.colors.brand.surface.medium,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    barLayer2: {
      width: 30,
      backgroundColor: theme.colors.info.surface.medium,
      marginTop: 2,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.s400,
      marginTop: theme.spacing.s400,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s100,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    projectsContainer: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      padding: theme.spacing.s500,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
    },
    projectsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s400,
      flexWrap: 'wrap',
      gap: theme.spacing.s300,
    },
    projectList: {
      gap: theme.spacing.s300,
    },
    projectCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.s400,
      backgroundColor: theme.colors.neutral.surface.light,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      borderRadius: theme.borderRadius.b200,
    },
    projectTags: {
      flexDirection: 'row',
      gap: theme.spacing.s200,
      marginTop: theme.spacing.s200,
    },
    tag: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      paddingHorizontal: theme.spacing.s300,
      paddingVertical: theme.spacing.s100,
      borderRadius: theme.borderRadius.b100,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
    },
    projectArrow: {
      padding: theme.spacing.s200,
    },
    placeholderContainer: {
      padding: theme.spacing.s500,
      alignItems: 'center',
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
    }
  });
