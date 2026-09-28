import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import CustomButton from '@/components/ui/button';
import DataTable, { DataTableColumn, DataTableRow } from '@/components/ui/dataTable';
import { useTheme } from '@/context/CustomThemeContext';
import { Search } from '@/svg_icons';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import Avatar from '@/components/ui/avatar';
import Dialog from '@/components/ui/dialog';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useToast } from '@/context/ToastContext';
import { useActiveBul } from '@/hooks/useActiveBul';

interface TeamsListProps {
  buId?: string;
  locationId?: string;
  bulId?: string;
}

export default function TeamsList({ buId, locationId, bulId }: TeamsListProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [search, setSearch] = useState('');
  const { safePush } = useSafeNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { activeBulId } = useActiveBul({ buId, locationId, bulId });

  // Fetch team list from API
  const fetchTeams = useCallback(() => {
    const query: any = { limit: 50, page: 1 };
    if (activeBulId) {
      query.bulId = activeBulId;
      query.locationId = activeBulId;
    }
    if (buId) {
      query.buId = buId;
    }

    dispatch({
      type: 'TEAMS_GETLIST_API_REQUEST',
      payload: {
        url: '/team',
        method: 'GET',
        query,
      },
    });
  }, [dispatch, activeBulId, buId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const rawTeams = store.team?.teamList || [];
  const isLoading = store.team?.isLoadingGetList;

  const columns: DataTableColumn[] = [
    { key: 'sno', label: 'S.NO', width: 60 },
    { key: 'teamName', label: 'Team name', flex: 1.5 },
    { key: 'project', label: 'Project', flex: 1.5 },
    { key: 'lead', label: 'Team lead', flex: 1.5 },
    {
      key: 'members',
      label: 'Members',
      flex: 1.5,
      renderCell: (row) => {
        const list = Array.isArray(row.rawMembers) ? row.rawMembers : [];
        if (list.length === 0) {
          return (
            <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
              —
            </Typography>
          );
        }
        return (
          <View style={styles.avatarGroup}>
            {list.slice(0, 3).map((m: any, idx: number) => {
              const name = m.displayName || m.name || m.firstName || 'Member';
              const uri = m.dp || m.dP || m.avatar || undefined;
              return (
                <Avatar
                  key={m.id || m._id || idx}
                  size="xs"
                  source={uri ? { uri } : undefined}
                  name={name}
                  style={idx > 0 ? styles.avatarOverlap : undefined}
                />
              );
            })}
            {list.length > 3 && (
              <View style={[styles.avatarOverlap, styles.moreBadge]}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.medium">
                  +{list.length - 3}
                </Typography>
              </View>
            )}
          </View>
        );
      },
    },
  ];

  const formattedData: DataTableRow[] = rawTeams.map((item: any, index: number) => {
    const rawMembers = item.employeeList || item.employees || [];
    return {
      ...item,
      id: item.id || item._id || String(index + 1),
      sno: index + 1,
      teamName: item.name || item.teamName || 'Unnamed Team',
      project: item.project?.name || item.project?.projectName || (typeof item.project === 'string' ? item.project : '-'),
      lead: item.lead?.name || item.lead?.displayName || item.teamLead?.name || item.teamLead?.displayName || (typeof item.lead === 'string' ? item.lead : typeof item.teamLead === 'string' ? item.teamLead : '-'),
      rawMembers,
    };
  });

  const [deleteTarget, setDeleteTarget] = useState<DataTableRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const filteredData = formattedData.filter((item) =>
    String(item.teamName).toLowerCase().includes(search.toLowerCase()) ||
    String(item.project).toLowerCase().includes(search.toLowerCase()) ||
    String(item.lead).toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteTeam = (row: DataTableRow) => {
    setDeleteTarget(row);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res: any = await dispatch({
        type: 'TEAMS_DESTROY_API_REQUEST',
        payload: {
          url: '/team',
          method: 'DELETE',
          query: { id: deleteTarget.id },
        },
      });
      setIsDeleting(false);
      setDeleteTarget(null);
      if (res && res.success !== false) {
        showToast({
          type: 'success',
          iconType: 'success',
          title: 'Team deleted successfully',
        });
        fetchTeams();
      } else {
        showToast({
          type: 'error',
          iconType: 'error',
          title: res?.message || 'Failed to delete team',
        });
      }
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteTarget(null);
      showToast({
        type: 'error',
        iconType: 'error',
        title: err?.message || 'Failed to delete team',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light">
              Teams
            </Typography>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
              list of teams in organization
            </Typography>
          </View>
          <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
            <View style={[styles.searchContainer, isMobile && styles.searchContainerMobile]}>
              <Input
                placeholder="Search"
                value={search}
                onChangeText={setSearch}
                leftIcon={<Search color={theme.colors.neutral.onSurface.light} />}
                containerStyle={styles.inputContainer}
              />
            </View>
            <CustomButton
              title="+ Create team"
              variant="outlineActive"
              size="small"
              onPress={() => safePush('/(protected)/(teams)/createTeam')}
            />
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
          </View>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            showView={true}
            showEdit={false}
            showDelete={true}
            onView={(row) => safePush(`/(protected)/(teams)/${row.id}`)}
            onDelete={handleDeleteTeam}
            totalRecords={filteredData.length}
          />
        )}
      </View>

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={!!deleteTarget}
        variant="negative"
        title="Delete the Team?"
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        onCancel={() => !isDeleting && setDeleteTarget(null)}
        onDismiss={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      >
        <Typography fontVariant="BS" color="colors.neutral.onSurface.dark">
          This will permanently remove "{deleteTarget?.teamName || 'this team'}". Are you sure you want to proceed?
        </Typography>
      </Dialog>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.s400,
    },
    card: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      padding: theme.spacing.s400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s400,
      flexWrap: 'wrap',
      gap: theme.spacing.s300,
    },
    titleContainer: {
      minWidth: 140,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s300,
      flexWrap: 'wrap',
    },
    headerActionsMobile: {
      width: '100%',
      justifyContent: 'space-between',
    },
    searchContainer: {
      width: 240,
    },
    searchContainerMobile: {
      flex: 1,
      minWidth: 140,
      width: undefined,
    },
    inputContainer: {
      marginBottom: 0,
    },
    loaderContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
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
    moreBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.neutral.surface.light,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
