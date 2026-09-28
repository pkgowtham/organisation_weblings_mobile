import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import CustomButton from '@/components/ui/button';
import { useTheme } from '@/context/CustomThemeContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useToast } from '@/context/ToastContext';
import { useActiveBul } from '@/hooks/useActiveBul';
import { Close, Search } from '@/svg_icons';
import Avatar from '@/components/ui/avatar';
import { useLocalSearchParams } from 'expo-router';

export default function AddMembersToTeamScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safeBack } = useSafeNavigation();
  const { showToast } = useToast();
  const { teamId } = useLocalSearchParams<{ teamId?: string }>();

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { activeBulId } = useActiveBul();

  const [search, setSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Employees
  useEffect(() => {
    const query: any = { limit: 100, page: 1 };
    if (activeBulId) query.bulId = activeBulId;

    dispatch({
      type: 'EMPLOYEE_LIST_GETLIST_API_REQUEST',
      payload: {
        url: '/employee',
        method: 'GET',
        query,
      },
    });
  }, [dispatch, activeBulId]);

  const teamList = store.team?.teamList || [];
  const currentTeam = useMemo(() => {
    return teamList.find((t: any) => String(t.id || t._id) === String(teamId)) || teamList[0] || {};
  }, [teamList, teamId]);

  const teamName = currentTeam.name || currentTeam.teamName || 'Team';
  const existingMembers = useMemo(() => {
    return currentTeam.employeeList || currentTeam.employees || [];
  }, [currentTeam]);

  const existingMemberIds = useMemo(() => {
    return new Set(existingMembers.map((m: any) => String(m.id || m._id || m.employeeId || '')));
  }, [existingMembers]);

  const rawEmployees =
    store.employee?.employeeList ||
    (store as any).employeeGet?.dataGetList?.data ||
    [];
  const isLoadingEmployees = store.employee?.isLoadingGetList;

  // Filter employees for search, excluding existing members
  const searchResults = useMemo(() => {
    if (!Array.isArray(rawEmployees)) return [];
    return rawEmployees.filter((emp: any) => {
      const empId = String(emp.id || emp._id || '');
      if (existingMemberIds.has(empId)) return false;

      const name =
        emp.displayName ||
        emp.name ||
        `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
        emp.email ||
        '';
      const role = emp.jobTitle || emp.role || emp.designation || '';
      const term = search.toLowerCase().trim();
      if (!term) return true;
      return name.toLowerCase().includes(term) || role.toLowerCase().includes(term);
    });
  }, [rawEmployees, search, existingMemberIds]);

  const toggleSelectMember = (emp: any) => {
    const empId = emp.id || emp._id;
    const isSelected = selectedMembers.some((m) => (m.id || m._id) === empId);
    if (isSelected) {
      setSelectedMembers((prev) => prev.filter((m) => (m.id || m._id) !== empId));
    } else {
      setSelectedMembers((prev) => [...prev, emp]);
    }
  };

  const removeSelectedMember = (empId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => (m.id || m._id) !== empId));
  };

  const handleAddMembersSubmit = async () => {
    const targetTeamId = currentTeam.id || currentTeam._id || teamId;
    if (!targetTeamId) {
      showToast({ type: 'error', iconType: 'error', title: 'Team ID missing' });
      return;
    }
    if (selectedMembers.length === 0) {
      showToast({ type: 'warning', iconType: 'warning', title: 'No members selected' });
      return;
    }

    const newMemberIds = selectedMembers.map((m) => m.id || m._id);

    setIsSubmitting(true);
    try {
      const res: any = await dispatch({
        type: 'TEAMS_WITH_MEMBERS_UPDATE_API_REQUEST',
        payload: {
          url: '/team/members',
          method: 'PUT',
          query: { id: targetTeamId },
          body: { addMember: newMemberIds },
        },
      });

      setIsSubmitting(false);
      if (res && res.success !== false) {
        showToast({ type: 'success', iconType: 'success', title: 'Members added successfully' });
        dispatch({
          type: 'TEAMS_GETLIST_API_REQUEST',
          payload: {
            url: '/team',
            method: 'GET',
            query: { limit: 50, page: 1, ...(activeBulId ? { bulId: activeBulId } : {}) },
          },
        });
        safeBack();
      } else {
        showToast({ type: 'error', iconType: 'error', title: res?.message || 'Failed to add members' });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      showToast({ type: 'error', iconType: 'error', title: err?.message || 'Failed to add members' });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark">
            {teamName}
          </Typography>
          <TouchableOpacity onPress={safeBack} style={styles.closeBtn}>
            <Close color={theme.colors.neutral.onSurface.dark} width={20} height={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark" style={styles.sectionTitle}>
            Add new members
          </Typography>
        </View>

        <View style={styles.actionsBar}>
          <TouchableOpacity onPress={safeBack} style={styles.discardBtn}>
            <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark">
              Cancel
            </Typography>
          </TouchableOpacity>
          <CustomButton
            title={`Add ${selectedMembers.length} new member${selectedMembers.length === 1 ? '' : 's'}`}
            variant="primary"
            size="small"
            disabled={selectedMembers.length === 0 || isSubmitting}
            onPress={handleAddMembersSubmit}
          />
        </View>

        <View style={styles.splitContent}>
          {/* Left Panel - Employee Search & Pick */}
          <View style={styles.leftPanel}>
            <View style={styles.searchWrap}>
              <Input
                placeholder="Search employees"
                value={search}
                onChangeText={setSearch}
                leftIcon={<Search color={theme.colors.neutral.onSurface.light} />}
                rightIcon={
                  search ? (
                    <TouchableOpacity onPress={() => setSearch('')}>
                      <Close color={theme.colors.neutral.onSurface.medium} width={16} height={16} />
                    </TouchableOpacity>
                  ) : undefined
                }
              />
            </View>

            {isLoadingEmployees ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={theme.colors.brand.surface.medium} />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.peopleList}>
                {searchResults.map((person: any) => {
                  const empId = person.id || person._id;
                  const name =
                    person.displayName ||
                    person.name ||
                    `${person.firstName || ''} ${person.lastName || ''}`.trim() ||
                    'Employee';
                  const role = person.jobTitle || person.role || person.designation || 'Employee';
                  const avatarUrl = person.dp || person.dP || person.avatar || undefined;
                  const isSelected = selectedMembers.some((m) => (m.id || m._id) === empId);

                  return (
                    <TouchableOpacity
                      key={empId}
                      style={[styles.personRow, isSelected && styles.personRowActive]}
                      onPress={() => toggleSelectMember(person)}
                      activeOpacity={0.7}
                    >
                      <Avatar size="sm" source={avatarUrl ? { uri: avatarUrl } : undefined} name={name} />
                      <View style={styles.personInfo}>
                        <Typography fontVariant="BM" variant={isSelected ? 'bold' : 'regular'} color="colors.neutral.onSurface.dark">
                          {name}
                        </Typography>
                        <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                          {role}
                        </Typography>
                      </View>
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && (
                          <Typography fontVariant="BXS" color="colors.neutral.surface.lighter">
                            ✓
                          </Typography>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {searchResults.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                      No employees available to add
                    </Typography>
                  </View>
                )}
              </ScrollView>
            )}
          </View>

          {/* Right Panel - Selected & Existing Members */}
          <View style={styles.rightPanel}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.rightScrollContent}>
              {/* Newly Selected */}
              <View style={styles.groupSection}>
                <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark" style={styles.groupTitle}>
                  Newly Selected {selectedMembers.length}
                </Typography>
                {selectedMembers.length > 0 ? (
                  <View style={styles.chipGrid}>
                    {selectedMembers.map((p) => {
                      const empId = p.id || p._id;
                      const name =
                        p.displayName ||
                        p.name ||
                        `${p.firstName || ''} ${p.lastName || ''}`.trim() ||
                        'Employee';
                      const avatarUrl = p.dp || p.dP || p.avatar || undefined;
                      return (
                        <View key={empId} style={styles.chip}>
                          <Avatar size="xs" source={avatarUrl ? { uri: avatarUrl } : undefined} name={name} />
                          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.chipText}>
                            {name}
                          </Typography>
                          <TouchableOpacity onPress={() => removeSelectedMember(empId)}>
                            <Close color={theme.colors.neutral.onSurface.medium} width={14} height={14} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                    Tap employees on the left to add them
                  </Typography>
                )}
              </View>

              <View style={styles.divider} />

              {/* Existing Members */}
              <View style={styles.groupSection}>
                <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark" style={styles.groupTitle}>
                  Existing members {existingMembers.length}
                </Typography>
                {existingMembers.length > 0 ? (
                  <View style={styles.chipGrid}>
                    {existingMembers.map((p: any, idx: number) => {
                      const empId = p.id || p._id || p.employeeId || idx;
                      const name =
                        p.displayName ||
                        p.name ||
                        `${p.firstName || ''} ${p.lastName || ''}`.trim() ||
                        'Employee';
                      const avatarUrl = p.dp || p.dP || p.avatar || undefined;
                      return (
                        <View key={empId} style={styles.chipExisting}>
                          <Avatar size="xs" source={avatarUrl ? { uri: avatarUrl } : undefined} name={name} />
                          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.chipText}>
                            {name}
                          </Typography>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                    No existing members
                  </Typography>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    container: {
      width: '100%',
      maxWidth: 900,
      alignSelf: 'center',
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.s400,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    closeBtn: {
      padding: theme.spacing.s100,
    },
    sectionHeader: {
      padding: theme.spacing.s400,
      backgroundColor: theme.colors.brand.surface.lighter,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    sectionTitle: {},
    actionsBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: theme.spacing.s400,
      padding: theme.spacing.s400,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    discardBtn: {
      paddingHorizontal: theme.spacing.s200,
    },
    splitContent: {
      flex: 1,
      flexDirection: 'row',
    },
    leftPanel: {
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: theme.colors.neutral.border.light,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: theme.spacing.s400,
    },
    searchWrap: {
      paddingHorizontal: theme.spacing.s400,
      marginBottom: theme.spacing.s400,
    },
    loaderContainer: {
      padding: theme.spacing.s600,
      alignItems: 'center',
    },
    emptyContainer: {
      padding: theme.spacing.s400,
      alignItems: 'center',
    },
    peopleList: {
      flex: 1,
    },
    personRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s300,
      paddingVertical: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s400,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.lighter || '#F1F5F9',
    },
    personRowActive: {
      backgroundColor: theme.colors.brand.surface.lighter,
    },
    personInfo: {
      flex: 1,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: theme.colors.neutral.border.medium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: theme.colors.brand.surface.medium,
      borderColor: theme.colors.brand.surface.medium,
    },
    rightPanel: {
      flex: 1.5,
    },
    rightScrollContent: {
      padding: theme.spacing.s500,
    },
    groupSection: {
      marginBottom: theme.spacing.s500,
    },
    groupTitle: {
      marginBottom: theme.spacing.s400,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.s300,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.brand.surface.lighter,
      padding: theme.spacing.s100,
      paddingRight: theme.spacing.s200,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.brand.border.light,
    },
    chipExisting: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.neutral.surface.light,
      padding: theme.spacing.s100,
      paddingRight: theme.spacing.s300,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
    },
    chipText: {
      marginHorizontal: theme.spacing.s200,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.neutral.border.light,
      marginVertical: theme.spacing.s400,
    },
  });
