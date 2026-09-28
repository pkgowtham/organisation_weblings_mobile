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
import { useActiveBul } from '@/hooks/useActiveBul';
import { ArrowBackIos, Search, Close } from '@/svg_icons';
import Avatar from '@/components/ui/avatar';

export default function AddTeamMembersScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safeBack } = useSafeNavigation();
  const [search, setSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { activeBulId } = useActiveBul();

  // Fetch Employees on Mount
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

  const rawEmployees =
    store.employee?.employeeList ||
    (store as any).employeeGet?.dataGetList?.data ||
    [];
  const isLoading = store.employee?.isLoadingGetList;

  // Group filtered employees alphabetically
  const groupedEmployees = useMemo(() => {
    if (!Array.isArray(rawEmployees)) return [];

    const filtered = rawEmployees.filter((emp: any) => {
      const name =
        emp.displayName ||
        emp.name ||
        `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
        emp.email ||
        '';
      const role = emp.jobTitle || emp.role || emp.designation || '';
      const term = search.toLowerCase();
      return name.toLowerCase().includes(term) || role.toLowerCase().includes(term);
    });

    const groups: Record<string, any[]> = {};
    filtered.forEach((emp: any) => {
      const name =
        emp.displayName ||
        emp.name ||
        `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
        'Employee';
      const letter = (name[0] || '#').toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(emp);
    });

    return Object.keys(groups)
      .sort()
      .map((letter) => ({ letter, data: groups[letter] }));
  }, [rawEmployees, search]);

  const toggleSelectMember = (emp: any) => {
    const empId = emp.id || emp._id;
    const isSelected = selectedMembers.some((m) => (m.id || m._id) === empId);
    if (isSelected) {
      setSelectedMembers((prev) => prev.filter((m) => (m.id || m._id) !== empId));
    } else {
      setSelectedMembers((prev) => [...prev, emp]);
    }
  };

  const removeMember = (empId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => (m.id || m._id) !== empId));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.leftPanel}>
          <View style={styles.panelHeader}>
            <TouchableOpacity onPress={safeBack} style={styles.backBtn}>
              <ArrowBackIos color={theme.colors.neutral.onSurface.dark} width={20} height={20} />
              <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark">
                Add team members
              </Typography>
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <Input
              placeholder="Search for people by name or role"
              value={search}
              onChangeText={setSearch}
              leftIcon={<Search color={theme.colors.neutral.onSurface.light} />}
            />
          </View>

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.peopleList}>
              {groupedEmployees.map((group) => (
                <View key={group.letter} style={styles.group}>
                  <Typography
                    fontVariant="BM"
                    variant="bold"
                    color="colors.neutral.onSurface.dark"
                    style={styles.groupLetter}
                  >
                    {group.letter}
                  </Typography>
                  {group.data.map((person: any) => {
                    const empId = person.id || person._id;
                    const name =
                      person.displayName ||
                      person.name ||
                      `${person.firstName || ''} ${person.lastName || ''}`.trim() ||
                      'Employee';
                    const role = person.jobTitle || person.role || person.designation || 'Team Member';
                    const avatarUrl = person.dp || person.dP || person.avatar || undefined;
                    const isSelected = selectedMembers.some((m) => (m.id || m._id) === empId);

                    return (
                      <TouchableOpacity
                        key={empId}
                        style={[styles.personRow, isSelected && styles.personRowSelected]}
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
                </View>
              ))}
              {groupedEmployees.length === 0 && !isLoading && (
                <View style={styles.emptySearch}>
                  <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                    No employees found matching your search.
                  </Typography>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        <View style={styles.rightPanel}>
          <View style={styles.panelContent}>
            <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark" style={styles.selectedCount}>
              Selected {selectedMembers.length}
            </Typography>

            {selectedMembers.length === 0 ? (
              <View style={styles.emptyState}>
                <Typography fontVariant="BM" color="colors.neutral.onSurface.medium">
                  No members selected
                </Typography>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.selectedList}>
                {selectedMembers.map((m) => {
                  const empId = m.id || m._id;
                  const name =
                    m.displayName ||
                    m.name ||
                    `${m.firstName || ''} ${m.lastName || ''}`.trim() ||
                    'Employee';
                  const avatarUrl = m.dp || m.dP || m.avatar || undefined;

                  return (
                    <View key={empId} style={styles.selectedItem}>
                      <Avatar size="xs" source={avatarUrl ? { uri: avatarUrl } : undefined} name={name} />
                      <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.selectedName} numberOfLines={1}>
                        {name}
                      </Typography>
                      <TouchableOpacity onPress={() => removeMember(empId)} style={styles.removeBtn}>
                        <Close color={theme.colors.neutral.onSurface.medium} width={14} height={14} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={styles.rightFooter}>
            <CustomButton
              title={`Done (${selectedMembers.length})`}
              variant="primary"
              size="medium"
              onPress={safeBack}
              disabled={selectedMembers.length === 0}
            />
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
      flex: 1,
      flexDirection: 'row',
    },
    leftPanel: {
      flex: 1.2,
      borderRightWidth: 1,
      borderRightColor: theme.colors.neutral.border.light,
      display: 'flex',
      flexDirection: 'column',
    },
    panelHeader: {
      padding: theme.spacing.s400,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s200,
    },
    searchWrap: {
      paddingHorizontal: theme.spacing.s400,
      marginBottom: theme.spacing.s300,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    peopleList: {
      flex: 1,
      paddingHorizontal: theme.spacing.s400,
    },
    group: {
      marginBottom: theme.spacing.s400,
    },
    groupLetter: {
      marginBottom: theme.spacing.s200,
      paddingLeft: theme.spacing.s100,
    },
    personRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s300,
      paddingVertical: theme.spacing.s200,
      paddingHorizontal: theme.spacing.s200,
      borderRadius: theme.borderRadius.b100,
      marginBottom: theme.spacing.s100,
    },
    personRowSelected: {
      backgroundColor: theme.colors.brand.surface.lighter || theme.colors.neutral.surface.light,
    },
    personInfo: {
      flex: 1,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.colors.neutral.border.medium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: theme.colors.brand.surface.medium,
      borderColor: theme.colors.brand.surface.medium,
    },
    emptySearch: {
      padding: theme.spacing.s500,
      alignItems: 'center',
    },
    rightPanel: {
      flex: 0.8,
      display: 'flex',
      flexDirection: 'column',
    },
    panelContent: {
      flex: 1,
      padding: theme.spacing.s400,
    },
    selectedCount: {
      marginBottom: theme.spacing.s400,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedList: {
      flex: 1,
    },
    selectedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s200,
      paddingVertical: theme.spacing.s200,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.lighter,
    },
    selectedName: {
      flex: 1,
    },
    removeBtn: {
      padding: 4,
    },
    rightFooter: {
      padding: theme.spacing.s400,
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral.border.light,
    },
  });

