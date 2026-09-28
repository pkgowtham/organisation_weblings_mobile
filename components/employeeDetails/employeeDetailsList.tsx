import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useActiveBul } from '@/hooks/useActiveBul';

interface EmployeeDetailsListProps {
  buId?: string;
  locationId?: string;
  bulId?: string;
}

export default function EmployeeDetailsList({ buId, locationId, bulId }: EmployeeDetailsListProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { activeBulId } = useActiveBul({ buId, locationId, bulId });

  // Fetch employee details list from API
  useEffect(() => {
    if (activeBulId) {
      dispatch({
        type: 'EMPLOYEE_LIST_GETLIST_API_REQUEST',
        payload: {
          url: '/employee',
          method: 'GET',
          query: { bulId: activeBulId, locationId: activeBulId, limit: 50, page: 1 },
        },
      });
    }
  }, [dispatch, activeBulId]);

  const rawEmployees = store.employee?.employeeList || [];
  const isLoading = store.employee?.isLoadingGetList;

  const getEmployeeName = (emp: any) => {
    if (!emp) return '-';
    return (
      emp.displayName ||
      emp.name ||
      `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
      '-'
    );
  };

  const getEmployeeEmail = (emp: any) => {
    if (!emp) return '-';
    return emp.email || emp.domainName || emp.username || '-';
  };

  const getEmployeeRole = (emp: any) => {
    if (!emp) return '-';
    return emp.jobTitle || emp.role || emp.designation || '-';
  };

  const getEmployeeAvatar = (emp: any, index: number) => {
    if (!emp) return `https://i.pravatar.cc/150?u=emp${index}`;
    const dp = emp.dP || emp.dp || emp.avatar || emp.profilePic;
    if (typeof dp === 'string' && dp.trim()) return dp.trim();
    if (dp && typeof dp === 'object' && dp.fileUrl && typeof dp.fileUrl === 'string') return dp.fileUrl;
    return `https://i.pravatar.cc/150?u=emp${index}`;
  };

  const getEmployeeProjects = (emp: any) => {
    if (!emp) return [];
    const list = emp.projects || emp.projectList || emp.assignedProjects || emp.project || [];
    if (Array.isArray(list)) return list;
    if (typeof list === 'string' && list.trim()) return [list];
    return [];
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
        </View>
      ) : rawEmployees.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
            No employee details found for this location.
          </Typography>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {rawEmployees.map((emp: any, index: number) => {
            const empId = emp.id || emp._id || String(index);
            const name = getEmployeeName(emp);
            const email = getEmployeeEmail(emp);
            const role = getEmployeeRole(emp);
            const avatarUrl = getEmployeeAvatar(emp, index);
            const projects = getEmployeeProjects(emp);

            return (
              <View key={empId} style={[styles.card, isMobile && styles.cardMobile]}>
                <View style={[styles.leftSection, isMobile && styles.leftSectionMobile]}>
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />

                  <View style={styles.infoGroup}>
                    <View style={styles.rowText}>
                      <Typography fontVariant="BXS" color="colors.neutral.onSurface.medium">Name: </Typography>
                      <Typography fontVariant="BXS" variant="bold" color="colors.neutral.onSurface.dark">{name}</Typography>
                    </View>
                    <View style={[styles.rowText, { marginTop: theme.spacing.s200 }]}>
                      <Typography fontVariant="BXS" color="colors.neutral.onSurface.medium">Domain Name: </Typography>
                      <Typography fontVariant="BXS" color="colors.brand.surface.medium">{email}</Typography>
                    </View>
                  </View>
                </View>

                <View style={[styles.roleSection, isMobile && styles.roleSectionMobile]}>
                  <View style={styles.rowText}>
                    <Typography fontVariant="BXS" color="colors.neutral.onSurface.medium">Role: </Typography>
                    <Typography fontVariant="BXS" variant="bold" color="colors.neutral.onSurface.dark">{role}</Typography>
                  </View>
                </View>

                <View style={[styles.projectSection, isMobile && styles.projectSectionMobile]}>
                  <Typography fontVariant="BXS" color="colors.neutral.onSurface.medium" style={{ marginBottom: theme.spacing.s200 }}>
                    Projects
                  </Typography>
                  <View style={styles.tagsContainer}>
                    {projects.length > 0 ? (
                      projects.map((proj: any, idx: number) => {
                        const projName = typeof proj === 'string' ? proj : proj.name || proj.projectName || 'Project';
                        return (
                          <View key={idx} style={styles.tag}>
                            <Typography fontVariant="BS" variant="bold" color="colors.brand.onSurface.medium">{projName}</Typography>
                          </View>
                        );
                      })
                    ) : (
                      <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">-</Typography>
                    )}
                  </View>
                </View>
              </View>
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
  listContent: {
    gap: theme.spacing.s400,
    paddingBottom: theme.spacing.s600,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.surface.lighter,
    borderWidth: 1,
    borderColor: theme.colors.neutral.border.light,
    borderRadius: theme.borderRadius.b300,
    padding: theme.spacing.s400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing.s400,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 2,
    gap: theme.spacing.s400,
  },
  leftSectionMobile: {
    flex: 1,
    width: '100%',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.b200,
    backgroundColor: theme.colors.neutral.surface.light,
  },
  infoGroup: {
    justifyContent: 'center',
  },
  rowText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleSection: {
    flex: 1.5,
    justifyContent: 'center',
  },
  roleSectionMobile: {
    flex: 1,
    width: '100%',
    paddingLeft: 96,
    marginTop: -16,
  },
  projectSection: {
    flex: 1.5,
    justifyContent: 'center',
  },
  projectSectionMobile: {
    flex: 1,
    width: '100%',
    paddingLeft: 96,
    marginTop: -16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s200,
  },
  tag: {
    backgroundColor: theme.colors.brand.surface.medium,
    paddingHorizontal: theme.spacing.s300,
    paddingVertical: theme.spacing.s100,
    borderRadius: theme.borderRadius.b100,
  },
});
