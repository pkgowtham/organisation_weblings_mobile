import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import CustomButton from '@/components/ui/button';
import Tag from '@/components/ui/tag';
import Avatar from '@/components/ui/avatar';
import { useTheme } from '@/context/CustomThemeContext';
import { Search, Eye, Delete, CalendarToday, Document } from '@/svg_icons';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useActiveBul } from '@/hooks/useActiveBul';

interface ProjectsListProps {
  buId?: string;
  locationId?: string;
  bulId?: string;
}

export default function ProjectsList({ buId, locationId, bulId }: ProjectsListProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [search, setSearch] = useState('');
  const { safePush } = useSafeNavigation();
  const { width } = useWindowDimensions();

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { activeBulId } = useActiveBul({ buId, locationId, bulId });

  // Fetch project list from API
  useEffect(() => {
    if (activeBulId) {
      dispatch({
        type: 'PROJECT_GETLIST_API_REQUEST',
        payload: {
          url: '/project',
          method: 'GET',
          query: { bulId: activeBulId, locationId: activeBulId, limit: 50, page: 1 },
        },
      });
    }
  }, [dispatch, activeBulId]);

  const rawProjects = store.project?.projectList || [];
  const isLoading = store.project?.isLoadingGetList;

  // Determine card width dynamically for responsive layout
  const getCardWidth = () => {
    if (width > 1024) return '31%';
    if (width > 768) return '48%';
    return '100%';
  };
  const cardWidth = getCardWidth();

  const filteredProjects = rawProjects.filter((item: any) => {
    const title = item.projectName || item.name || item.title || '';
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchWrapper}>
          <Input
            placeholder="Search for Project"
            value={search}
            onChangeText={setSearch}
            leftIcon={<Search color={theme.colors.neutral.onSurface.light} />}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
        <View>
          <CustomButton
            title="+ Add"
            variant="primary"
            size="small"
            onPress={() => safePush('/(protected)/(projects)/createProject')}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
        </View>
      ) : filteredProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
            No projects found.
          </Typography>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {filteredProjects.map((proj: any, index: number) => {
            const projId = proj.id || proj._id || String(index);
            const title = proj.projectName || proj.name || proj.title || 'Untitled Project';
            const clientName = proj.client?.clientName || proj.client?.name || proj.client || 'Client';
            const managerName = proj.projectManager?.name || proj.projectManager?.displayName || proj.manager || 'Project Manager';
            const status = proj.status || 'Active';
            const desc = proj.description || proj.desc || 'No description provided.';
            const duration = proj.startDate && proj.endDate ? `${proj.startDate} - ${proj.endDate}` : proj.duration || 'Flexible';
            const billing = proj.billingType?.name || proj.billingCurrency?.code || proj.billing || '$ USD';

            return (
              <TouchableOpacity
                key={projId}
                style={[styles.card, { width: cardWidth }]}
                onPress={() => safePush(`/(protected)/(projects)/${projId}`)}
              >
                <View style={styles.cardHeader}>
                  <Tag label={status.toUpperCase()} color={status.toLowerCase() === 'active' ? 'positive' : 'warning'} variant="filled" />
                  <View style={styles.cardActions}>
                    <Eye color={theme.colors.neutral.onSurface.dark} width={18} height={18} />
                    <Delete color={theme.colors.neutral.onSurface.dark} width={18} height={18} />
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.title}>
                    {title}
                  </Typography>
                  <Typography fontVariant="BM" color="colors.brand.surface.medium" style={styles.clientLink}>
                    Client: {clientName}
                  </Typography>

                  <View style={styles.row}>
                    <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.label}>
                      Project Manager
                    </Typography>
                    <View style={styles.person}>
                      <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light">
                        {managerName}
                      </Typography>
                    </View>
                  </View>

                  <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={styles.desc} numberOfLines={3}>
                    {desc}
                  </Typography>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.footerRow}>
                    <View style={styles.footerItem}>
                      <CalendarToday color={theme.colors.neutral.onSurface.medium} width={14} height={14} />
                      <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">Duration</Typography>
                      <Typography fontVariant="BS" color="colors.neutral.onSurface.light">{duration}</Typography>
                    </View>
                  </View>
                  <View style={styles.footerRow}>
                    <View style={styles.footerItem}>
                      <Document color={theme.colors.neutral.onSurface.medium} width={14} height={14} />
                      <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">Billing</Typography>
                      <Typography fontVariant="BS" color="colors.neutral.onSurface.light">{billing}</Typography>
                    </View>
                  </View>

                  <View style={styles.teamRow}>
                    <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">Team :</Typography>
                    <View style={styles.avatarGroup}>
                      <Avatar size="xs" source={{ uri: 'https://i.pravatar.cc/150?u=4' }} style={styles.avatarOverlap} />
                      <Avatar size="xs" source={{ uri: 'https://i.pravatar.cc/150?u=5' }} style={styles.avatarOverlap} />
                      <Avatar size="xs" source={{ uri: 'https://i.pravatar.cc/150?u=6' }} style={styles.avatarOverlap} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.s400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s400,
    flexWrap: 'wrap',
    gap: theme.spacing.s300,
  },
  searchWrapper: {
    flex: 1,
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '2%',
    paddingBottom: theme.spacing.s600,
  },
  card: {
    backgroundColor: theme.colors.neutral.surface.lighter,
    borderRadius: theme.borderRadius.b300,
    borderWidth: 1,
    borderColor: theme.colors.neutral.border.light,
    marginBottom: theme.spacing.s400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.s400,
    paddingBottom: 0,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.s300,
  },
  cardBody: {
    padding: theme.spacing.s400,
  },
  title: {
    marginBottom: theme.spacing.s100,
  },
  clientLink: {
    marginBottom: theme.spacing.s400,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s200,
  },
  label: {
    width: 120,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s200,
  },
  avatarGroup: {
    flexDirection: 'row',
    paddingLeft: 8,
  },
  avatarOverlap: {
    marginLeft: -8,
    borderWidth: 2,
    borderColor: theme.colors.neutral.surface.lighter,
  },
  desc: {
    marginTop: theme.spacing.s300,
    lineHeight: 20,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral.border.light,
    padding: theme.spacing.s400,
    gap: theme.spacing.s200,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s200,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s200,
    marginTop: theme.spacing.s200,
  },
});
