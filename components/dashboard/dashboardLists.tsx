import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import { ArrowForwardIos } from '@/svg_icons';
import Avatar from '@/components/ui/avatar';
import Tag from '@/components/ui/tag';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';

const BADGE_COLORS = [
  '#0F172A',
  '#16A34A',
  '#2563EB',
  '#DC2626',
  '#8B5CF6',
  '#EA580C',
  '#0284C7',
  '#D97706',
];

const getHealthStatusColor = (status: string, customColor?: string): string => {
  if (customColor) return customColor;
  const s = status.toLowerCase();
  if (s.includes('health')) return '#16A34A';
  if (s.includes('risk')) return '#3B82F6';
  if (s.includes('delay')) return '#EF4444';
  if (s.includes('crit')) return '#EA580C';
  return '#10B981';
};

const CardHeader = ({
  title,
  theme,
  styles,
  onViewAll,
  showViewAll = true,
}: {
  title: string;
  theme: any;
  styles: any;
  onViewAll?: () => void;
  showViewAll?: boolean;
}) => (
  <View style={styles.cardHeader}>
    <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light">
      {title}
    </Typography>
    {showViewAll && (
      <TouchableOpacity onPress={onViewAll}>
        <Typography fontVariant="BS" variant="semibold" color="colors.brand.surface.medium">
          View All
        </Typography>
      </TouchableOpacity>
    )}
  </View>
);

export function TopClients({ bulId }: { bulId?: string }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();

  const topClientsData = store.organisationDashboard?.topClientsData;
  const isLoading = store.organisationDashboard?.isLoadingTopClients;

  useEffect(() => {
    if (!bulId || bulId.trim() === '') {
      dispatch({ type: 'ORGANISATION_DASHBOARD_TOP_CLIENTS_API_CLEAR' });
      return;
    }

    dispatch({
      type: 'ORGANISATION_DASHBOARD_TOP_CLIENTS_API_REQUEST',
      payload: {
        url: '/organisationDashboard/topClients',
        method: 'GET',
        query: { bulId: bulId.trim() },
      },
    });
  }, [dispatch, bulId]);

  const clients = useMemo(() => {
    if (
      topClientsData?.clients &&
      Array.isArray(topClientsData.clients) &&
      topClientsData.clients.length > 0
    ) {
      return topClientsData.clients.slice(0, 5).map((c: any, idx: number) => ({
        id: c.id || String(idx),
        name: c.clientName || 'Unnamed Client',
        sub:
          typeof c.projectsCount === 'number'
            ? `${c.projectsCount} Projects`
            : c.projectsCount || '0 Projects',
        letter: (c.clientName || 'C').charAt(0).toUpperCase(),
        color: BADGE_COLORS[idx % BADGE_COLORS.length],
      }));
    }
    return [];
  }, [topClientsData]);

  return (
    <View style={styles.card}>
      <CardHeader title="Top Clients" theme={theme} styles={styles} showViewAll={clients.length > 0} />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.brand.surface.medium} />
        </View>
      ) : clients.length > 0 ? (
        clients.map((item, i) => (
          <View
            key={item.id}
            style={[styles.listItem, i === clients.length - 1 && { borderBottomWidth: 0 }]}
          >
            <View style={styles.leftRow}>
              <View style={[styles.letterAvatar, { backgroundColor: item.color }]}>
                <Typography fontVariant="BM" variant="bold" color="colors.neutral.surface.lighter">
                  {item.letter}
                </Typography>
              </View>
              <View style={{ flex: 1 }}>
                <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light" numberOfLines={1}>
                  {item.name}
                </Typography>
                <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                  {item.sub}
                </Typography>
              </View>
            </View>
            <ArrowForwardIos color={theme.colors.neutral.onSurface.light} width={14} height={14} />
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
            No clients available
          </Typography>
        </View>
      )}
    </View>
  );
}

const MOCK_TEAM = [
  { id: '1', name: 'John Carter', role: 'Product Manager', img: 'https://i.pravatar.cc/150?u=1', val: '95%' },
  { id: '2', name: 'Helen Miller', role: 'Senior Designer', img: 'https://i.pravatar.cc/150?u=2', val: '92%' },
  { id: '3', name: 'Siddharth Sen', role: 'Lead Dev', img: 'https://i.pravatar.cc/150?u=3', val: '89%' },
  { id: '4', name: 'Carla Gomez', role: 'UX Researcher', img: 'https://i.pravatar.cc/150?u=4', val: '88%' },
];

export function TeamPerformance() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.card}>
      <CardHeader title="Team Performance" theme={theme} styles={styles} />
      {MOCK_TEAM.map((item, i) => (
        <View key={item.id} style={[styles.listItem, i === MOCK_TEAM.length - 1 && { borderBottomWidth: 0 }]}>
          <View style={styles.leftRow}>
            <Avatar size="sm" source={{ uri: item.img }} />
            <View>
              <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light">{item.name}</Typography>
              <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">{item.role}</Typography>
            </View>
          </View>
          <Typography fontVariant="BM" variant="bold" color="colors.positive.surface.medium">{item.val}</Typography>
        </View>
      ))}
    </View>
  );
}

export function ProjectHealth({ bulId }: { bulId?: string }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();

  const projectHealthData = store.organisationDashboard?.projectHealthData;
  const isLoading = store.organisationDashboard?.isLoadingProjectHealth;

  useEffect(() => {
    if (!bulId || bulId.trim() === '') {
      dispatch({ type: 'ORGANISATION_DASHBOARD_PROJECT_HEALTH_API_CLEAR' });
      return;
    }

    dispatch({
      type: 'ORGANISATION_DASHBOARD_PROJECT_HEALTH_API_REQUEST',
      payload: {
        url: '/organisationDashboard/projectHealth',
        method: 'GET',
        query: { bulId: bulId.trim() },
      },
    });
  }, [dispatch, bulId]);

  const healthData = useMemo(() => {
    if (
      projectHealthData?.projects &&
      Array.isArray(projectHealthData.projects) &&
      projectHealthData.projects.length > 0
    ) {
      return projectHealthData.projects.slice(0, 5).map((p: any, idx: number) => {
        const status =
          p.health ||
          (p.progress && p.progress >= 80
            ? 'Healthy'
            : p.progress && p.progress >= 60
              ? 'At Risk'
              : 'Delayed');
        const progressRatio = typeof p.progress === 'number' ? Math.min(1, Math.max(0, p.progress / 100)) : 0;
        const color = getHealthStatusColor(status, p.healthColor);
        return {
          id: p.id || String(idx),
          name: p.projectName || 'Unnamed Project',
          status,
          progress: progressRatio,
          color,
        };
      });
    }
    return [];
  }, [projectHealthData]);

  return (
    <View style={styles.card}>
      <CardHeader title="Project Health" theme={theme} styles={styles} showViewAll={healthData.length > 0} />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.brand.surface.medium} />
        </View>
      ) : healthData.length > 0 ? (
        healthData.map((item, i) => (
          <View
            key={item.id}
            style={[styles.healthItem, i === healthData.length - 1 && { borderBottomWidth: 0 }]}
          >
            <View style={styles.healthRow}>
              <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light" numberOfLines={1} style={{ flex: 1 }}>
                {item.name}
              </Typography>
              <Typography fontVariant="BXS" variant="semibold" style={{ color: item.color, marginLeft: 8 }}>
                {item.status}
              </Typography>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.round(item.progress * 100)}%`, backgroundColor: item.color }]} />
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
            No projects health data available
          </Typography>
        </View>
      )}
    </View>
  );
}

export function RecentActivities({ bulId }: { bulId?: string }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();

  const clientActivitiesData = store.organisationDashboard?.clientActivitiesData;
  const isLoading = store.organisationDashboard?.isLoadingClientActivities;

  useEffect(() => {
    if (!bulId || bulId.trim() === '') {
      dispatch({ type: 'ORGANISATION_DASHBOARD_CLIENT_ACTIVITIES_API_CLEAR' });
      return;
    }

    dispatch({
      type: 'ORGANISATION_DASHBOARD_CLIENT_ACTIVITIES_API_REQUEST',
      payload: {
        url: '/organisationDashboard/clientActivities',
        method: 'GET',
        query: { bulId: bulId.trim() },
      },
    });
  }, [dispatch, bulId]);

  const activities = useMemo(() => {
    if (
      clientActivitiesData?.activities &&
      Array.isArray(clientActivitiesData.activities) &&
      clientActivitiesData.activities.length > 0
    ) {
      return clientActivitiesData.activities.slice(0, 5).map((act: any, idx: number) => {
        const targetText = act.client?.clientName
          ? `for client ${act.client.clientName}`
          : act.project?.projectName
            ? `in project ${act.project.projectName}`
            : '';
        const userName = act.user?.displayName || 'User';
        const actionText = act.name ? `added "${act.name}"` : 'performed an activity';
        const time =
          act.formattedDate ||
          (act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

        const isDelete = act.description?.toLowerCase().includes('delete');
        const isEdit =
          act.description?.toLowerCase().includes('edit') ||
          act.description?.toLowerCase().includes('update');
        const color = isDelete ? '#EF4444' : isEdit ? '#3B82F6' : '#10B981';

        return {
          id: act.id || String(idx),
          text: `${userName} ${actionText} ${targetText}`.trim(),
          time,
          color,
        };
      });
    }
    return [];
  }, [clientActivitiesData]);

  return (
    <View style={styles.card}>
      <CardHeader title="Recent Activities" theme={theme} styles={styles} showViewAll={activities.length > 0} />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.brand.surface.medium} />
        </View>
      ) : activities.length > 0 ? (
        <View style={styles.timelineContainer}>
          <View style={styles.timelineLine} />
          {activities.map((item) => (
            <View key={item.id} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
              <View style={styles.timelineContent}>
                <Typography fontVariant="BM" color="colors.neutral.onSurface.light">
                  {item.text}
                </Typography>
                <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                  {item.time}
                </Typography>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
            No recent activities available
          </Typography>
        </View>
      )}
    </View>
  );
}

const MOCK_DEADLINES = [
  { id: '1', title: 'UI Kit Redesign', date: 'May 25, 2018', priority: 'High', color: 'negative' },
  { id: '2', title: 'Client Review', date: 'May 28, 2018', priority: 'Medium', color: 'info' },
  { id: '3', title: 'Final Delivery', date: 'Jun 02, 2018', priority: 'Normal', color: 'positive' },
];

export function UpcomingDeadlines() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.card}>
      <CardHeader title="Upcoming Deadlines" theme={theme} styles={styles} />
      {MOCK_DEADLINES.map((item, i) => (
        <View key={item.id} style={[styles.listItem, i === MOCK_DEADLINES.length - 1 && { borderBottomWidth: 0 }]}>
          <View>
            <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light">{item.title}</Typography>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">{item.date}</Typography>
          </View>
          <Tag label={item.priority} color={item.color as any} variant="filled" />
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      padding: theme.spacing.s400,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.s300,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    leftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    letterAvatar: {
      width: 36,
      height: 36,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    healthItem: {
      paddingVertical: theme.spacing.s200,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      gap: 6,
    },
    healthRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressBg: {
      height: 6,
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    timelineContainer: {
      position: 'relative',
      paddingLeft: 12,
    },
    timelineLine: {
      position: 'absolute',
      left: 17,
      top: 8,
      bottom: 8,
      width: 2,
      backgroundColor: theme.colors.neutral.border.light,
    },
    timelineItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 14,
      gap: 12,
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginTop: 4,
      flexShrink: 0,
    },
    timelineContent: {
      flex: 1,
    },
    loadingContainer: {
      paddingVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      paddingVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
