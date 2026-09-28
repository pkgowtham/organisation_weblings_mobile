import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import DashboardStats from './dashboardStats';
import DashboardCharts from './dashboardCharts';
import {
  TopClients,
  TeamPerformance,
  ProjectHealth,
  RecentActivities,
  UpcomingDeadlines,
} from './dashboardLists';
import DashboardQuickActions from './dashboardQuickActions';
import { useTheme } from '@/context/CustomThemeContext';

interface DashboardContentProps {
  bulId?: string;
  buId?: string;
  onSelectTab?: (tab: string) => void;
}

export default function DashboardContent({ bulId, buId, onSelectTab }: DashboardContentProps) {
  const { theme } = useTheme();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top scrollable stats */}
      <DashboardStats bulId={bulId} />

      {/* Charts */}
      <DashboardCharts bulId={bulId} />

      {/* Lists & Actions grouped for mobile stack */}
      <View style={styles.cardsContainer}>
        <TopClients bulId={bulId} />
        {/* <TeamPerformance /> */}
        <ProjectHealth bulId={bulId} />
        <RecentActivities bulId={bulId} />
        {/* <UpcomingDeadlines /> */}
        <DashboardQuickActions onSelectTab={onSelectTab} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  cardsContainer: {
    paddingHorizontal: 16,
  },
});
