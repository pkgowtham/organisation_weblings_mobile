import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { Folder, AddPerson, Person, QueryBuilder } from '@/svg_icons';
import { useTheme } from '@/context/CustomThemeContext';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { getItemAsync } from '@/utils/secureStorage';

interface DashboardStatsProps {
  bulId?: string;
}

export default function DashboardStats({ bulId }: DashboardStatsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();

  const statsData = store.organisationDashboard?.statsData;
  const isLoading = store.organisationDashboard?.isLoadingStats;

  useEffect(() => {
    (async () => {
      const orgId =
        store.auth.orgAuthId ||
        (await getItemAsync('orgAuthId')) ||
        '';

      const queryParams: any = {};
      if (orgId) {
        queryParams.orgId = orgId;
      }
      if (bulId && bulId.trim()) {
        queryParams.bulId = bulId.trim();
      }

      dispatch({
        type: 'ORGANISATION_DASHBOARD_STATS_API_REQUEST',
        payload: {
          url: '/organisationDashboard',
          method: 'GET',
          query: queryParams,
        },
      });
    })();
  }, [dispatch, bulId, store.auth.orgAuthId]);

  const statItems = [
    {
      id: 'totalProjects',
      title: 'Total Projects',
      count: statsData?.totalProjects ?? 0,
      Icon: Folder,
      iconColor: theme.colors.brand.onSurface.light,
      bgColor: theme.colors.brand.surface.lighter,
    },
    {
      id: 'clients',
      title: 'Clients',
      count: statsData?.clients ?? 0,
      Icon: AddPerson,
      iconColor: theme.colors.info.onSurface.light,
      bgColor: theme.colors.info.surface.lighter,
    },
    {
      id: 'totalEmployees',
      title: 'Total Employee',
      count: statsData?.totalEmployees ?? 0,
      Icon: Person,
      iconColor: theme.colors.negative.onSurface.light,
      bgColor: theme.colors.negative.surface.lighter,
    },
    {
      id: 'pendingTimesheets',
      title: 'Pending Timesheets',
      count: statsData?.pendingTimesheets ?? 0,
      Icon: QueryBuilder,
      iconColor: theme.colors.warning.onSurface.light,
      bgColor: theme.colors.warning.surface.lighter,
    },
    {
      id: 'totalTeams',
      title: 'Total teams',
      count: statsData?.totalTeams ?? 0,
      Icon: Person,
      iconColor: theme.colors.positive.onSurface.light,
      bgColor: theme.colors.positive.surface.lighter,
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
    >
      {statItems.map((stat) => {
        const Icon = stat.Icon;
        return (
          <View key={stat.id} style={styles.card}>
            <View style={styles.headerRow}>
              <Typography fontVariant="BS" color="colors.neutral.onSurface.light">
                {stat.title}
              </Typography>
              <View style={[styles.iconCircle, { backgroundColor: stat.bgColor }]}>
                <Icon color={stat.iconColor} width={16} height={16} />
              </View>
            </View>
            {isLoading && !statsData ? (
              <ActivityIndicator size="small" color={theme.colors.brand.surface.medium} />
            ) : (
              <Typography fontVariant="HM" variant="bold" color="colors.neutral.onSurface.light" style={styles.countText}>
                {String(stat.count)}
              </Typography>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 0,
      marginBottom: theme.spacing.s400,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.s400,
      gap: theme.spacing.s300,
    },
    card: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      padding: theme.spacing.s400,
      width: 180,
      shadowColor: theme.colors.neutral.surface.inverse,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s400,
    },
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    countText: {},
  });
