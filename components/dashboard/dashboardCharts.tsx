import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { ChevronDown } from '@/svg_icons';

const { width } = Dimensions.get('window');

const DEFAULT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#F97316',
  '#64748B',
];

interface DashboardChartsProps {
  bulId?: string;
}

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

const renderDonutChart = (
  data: DonutItem[],
  centerText: string,
  centerSubtext: string,
  theme: any,
  isLoading: boolean
) => {
  const styles = createStyles(theme);
  const size = 120;
  const strokeWidth = 16;
  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (isLoading) {
    return (
      <View style={[styles.emptyContainer, { height: 120 }]}>
        <ActivityIndicator size="small" color={theme.colors.brand.surface.medium} />
      </View>
    );
  }

  if (data.length === 0 || total === 0) {
    return (
      <View style={[styles.emptyContainer, { height: 120 }]}>
        <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
          No data available
        </Typography>
      </View>
    );
  }

  let currentAngle = -90; // Start at top
  const rect = {
    x: strokeWidth / 2,
    y: strokeWidth / 2,
    width: size - strokeWidth,
    height: size - strokeWidth,
  };

  return (
    <View style={styles.chartRow}>
      <View style={styles.chartContainer}>
        <Canvas style={{ width: size, height: size }}>
          {data.map((item, index) => {
            const sweepAngle = (item.value / total) * 360;
            const path = Skia.Path.Make();
            path.addArc(rect, currentAngle, sweepAngle);
            currentAngle += sweepAngle;

            return (
              <Path
                key={index}
                path={path}
                style="stroke"
                strokeWidth={strokeWidth}
                color={item.color}
              />
            );
          })}
        </Canvas>
        <View style={styles.centerTextContainer}>
          <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark">
            {centerText}
          </Typography>
          <Typography fontVariant="LXS" color="colors.neutral.onSurface.medium">
            {centerSubtext}
          </Typography>
        </View>
      </View>
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s200, flex: 1 }}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Typography fontVariant="BS" color="colors.neutral.onSurface.light" numberOfLines={1}>
                {item.label}
              </Typography>
            </View>
            <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light" style={{ marginLeft: 8 }}>
              {item.value}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
};

// --- Timesheet Overview Bar Chart ---
const TIMESHEET_DATA = [
  { month: 'Jan', approved: 40, submitted: 50 },
  { month: 'Feb', approved: 60, submitted: 45 },
  { month: 'Mar', approved: 80, submitted: 90 },
  { month: 'Apr', approved: 35, submitted: 30 },
  { month: 'May', approved: 65, submitted: 75 },
  { month: 'Jun', approved: 85, submitted: 70 },
];

const renderBarChart = (theme: any) => {
  const styles = createStyles(theme);
  return (
    <View style={styles.barChartWrapper}>
      <View style={styles.barsArea}>
        {TIMESHEET_DATA.map((item, index) => (
          <View key={index} style={styles.barGroup}>
            <View style={styles.barPair}>
              <View
                style={[
                  styles.bar,
                  { height: item.approved, backgroundColor: theme.colors.brand.surface.medium },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  { height: item.submitted, backgroundColor: theme.colors.brand.surface.light },
                ]}
              />
            </View>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={styles.barLabel}>
              {item.month}
            </Typography>
          </View>
        ))}
      </View>
      <View style={styles.barLegend}>
        <View style={styles.legendItemCenter}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.brand.surface.medium }]} />
          <Typography fontVariant="BS" color="colors.neutral.onSurface.light">
            Approved
          </Typography>
        </View>
        <View style={styles.legendItemCenter}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.brand.surface.light }]} />
          <Typography fontVariant="BS" color="colors.neutral.onSurface.light">
            Submitted
          </Typography>
        </View>
      </View>
    </View>
  );
};

export default function DashboardCharts({ bulId }: DashboardChartsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();

  // Projects Overview state
  const [projectOptions, setProjectOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedProjectName, setSelectedProjectName] = useState<string>('');
  const [showProjectPicker, setShowProjectPicker] = useState<boolean>(false);

  const overviewData = store.organisationDashboard?.projectsOverviewData;
  const isLoadingProjects = store.organisationDashboard?.isLoadingProjectsOverview;

  const employeeOverviewData = store.organisationDashboard?.employeeOverviewData;
  const isLoadingEmployees = store.organisationDashboard?.isLoadingEmployeeOverview;

  // 1. Fetch Projects for Dropdown when bulId changes
  useEffect(() => {
    if (!bulId || bulId.trim() === '') {
      setProjectOptions([]);
      setSelectedProjectId('');
      setSelectedProjectName('');
      dispatch({ type: 'ORGANISATION_DASHBOARD_PROJECTS_OVERVIEW_API_CLEAR' });
      return;
    }

    dispatch({
      type: 'PROJECT_GETLIST_API_REQUEST',
      payload: {
        url: '/project',
        method: 'GET',
        query: { limit: 20, page: 1, bulId: bulId.trim() },
      },
    }).then((res: any) => {
      const raw = res?.data?.content || res?.data?.data || res?.data || res || [];
      if (Array.isArray(raw) && raw.length > 0) {
        const mapped = raw.map((p: any) => ({
          id: p.id || p._id,
          name: p.projectName || p.name || 'Unnamed Project',
        }));
        setProjectOptions(mapped);
        const first = mapped[0];
        setSelectedProjectId(first.id);
        setSelectedProjectName(first.name);

        // Fetch overview for the first project
        dispatch({
          type: 'ORGANISATION_DASHBOARD_PROJECTS_OVERVIEW_API_REQUEST',
          payload: {
            url: '/organisationDashboard/projectsOverview',
            method: 'GET',
            query: { projectId: first.id },
          },
        });
      } else {
        setProjectOptions([]);
        setSelectedProjectId('');
        setSelectedProjectName('');
        dispatch({ type: 'ORGANISATION_DASHBOARD_PROJECTS_OVERVIEW_API_CLEAR' });
      }
    });
  }, [dispatch, bulId]);

  // 2. Fetch Employee Overview when bulId changes
  useEffect(() => {
    if (!bulId || bulId.trim() === '') {
      dispatch({ type: 'ORGANISATION_DASHBOARD_EMPLOYEE_OVERVIEW_API_CLEAR' });
      return;
    }

    dispatch({
      type: 'ORGANISATION_DASHBOARD_EMPLOYEE_OVERVIEW_API_REQUEST',
      payload: {
        url: '/organisationDashboard/employeeOverview',
        method: 'GET',
        query: { bulId: bulId.trim() },
      },
    });
  }, [dispatch, bulId]);

  const handleSelectProject = (project: { id: string; name: string }) => {
    setSelectedProjectId(project.id);
    setSelectedProjectName(project.name);
    setShowProjectPicker(false);

    dispatch({
      type: 'ORGANISATION_DASHBOARD_PROJECTS_OVERVIEW_API_REQUEST',
      payload: {
        url: '/organisationDashboard/projectsOverview',
        method: 'GET',
        query: { projectId: project.id },
      },
    });
  };

  // Parse Projects Donut Data
  const projectsData: DonutItem[] = useMemo(() => {
    if (
      overviewData?.statuses &&
      Array.isArray(overviewData.statuses) &&
      overviewData.statuses.length > 0
    ) {
      return overviewData.statuses.map((s: any, idx: number) => ({
        label: s.name || 'Status',
        value: Number(s.taskCount) || 0,
        color: s.colorCode || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      }));
    }
    return [];
  }, [overviewData]);

  const totalTasks = useMemo(() => {
    if (overviewData?.totalTasks !== undefined && overviewData?.totalTasks !== null) {
      return Number(overviewData.totalTasks);
    }
    return projectsData.reduce((acc, curr) => acc + curr.value, 0);
  }, [overviewData, projectsData]);

  // Parse Employee Donut Data
  const employeeData: DonutItem[] = useMemo(() => {
    if (
      employeeOverviewData?.departments &&
      Array.isArray(employeeOverviewData.departments) &&
      employeeOverviewData.departments.length > 0
    ) {
      return employeeOverviewData.departments.map((dept: any, idx: number) => ({
        label: dept.name || 'Department',
        value: Number(dept.employeeCount) || 0,
        color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      }));
    }
    return [];
  }, [employeeOverviewData]);

  const totalEmployees = useMemo(() => {
    if (
      employeeOverviewData?.totalEmployees !== undefined &&
      employeeOverviewData?.totalEmployees !== null
    ) {
      return Number(employeeOverviewData.totalEmployees);
    }
    return employeeData.reduce((acc, curr) => acc + curr.value, 0);
  }, [employeeOverviewData, employeeData]);

  return (
    <View style={styles.container}>
      {/* Projects Overview Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light">
            Projects Overview
          </Typography>
          {projectOptions.length > 0 && (
            <TouchableOpacity
              style={styles.projectDropdownTrigger}
              onPress={() => setShowProjectPicker(!showProjectPicker)}
            >
              <Typography fontVariant="BS" color="colors.brand.surface.medium" numberOfLines={1} style={{ maxWidth: 140 }}>
                {selectedProjectName || 'Select project'}
              </Typography>
              <ChevronDown color={theme.colors.brand.surface.medium} width={14} height={14} />
            </TouchableOpacity>
          )}
        </View>

        {showProjectPicker && (
          <View style={styles.projectPickerCon}>
            <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
              {projectOptions.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.projectPickerItem,
                    p.id === selectedProjectId && { backgroundColor: theme.colors.brand.surface.lighter },
                  ]}
                  onPress={() => handleSelectProject(p)}
                >
                  <Typography
                    fontVariant="BS"
                    color={p.id === selectedProjectId ? 'colors.brand.onSurface.light' : 'colors.neutral.onSurface.light'}
                  >
                    {p.name}
                  </Typography>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {renderDonutChart(projectsData, String(totalTasks), 'Total Tasks', theme, isLoadingProjects)}
      </View>

      {/* Timesheet Overview Card */}
      {/* <View style={styles.card}>
        <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light" style={styles.cardTitle}>
          Timesheet Overview
        </Typography>
        {renderBarChart(theme)}
      </View> */}

      {/* Employee Overview Card */}
      <View style={styles.card}>
        <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light" style={styles.cardTitle}>
          Employee Overview
        </Typography>
        {renderDonutChart(employeeData, String(totalEmployees), 'Employees', theme, isLoadingEmployees)}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.s400,
      gap: theme.spacing.s400,
      marginBottom: theme.spacing.s400,
    },
    card: {
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
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s400,
      gap: 8,
    },
    cardTitle: {
      marginBottom: theme.spacing.s400,
    },
    projectDropdownTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      backgroundColor: theme.colors.neutral.surface.light,
    },
    projectPickerCon: {
      marginBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      backgroundColor: theme.colors.neutral.surface.lighter,
      overflow: 'hidden',
    },
    projectPickerItem: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    chartRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    chartContainer: {
      position: 'relative',
      width: 120,
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerTextContainer: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
    legendContainer: {
      flex: 1,
      marginLeft: 24,
      gap: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      flexShrink: 0,
    },
    emptyContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    barChartWrapper: {
      height: 180,
      justifyContent: 'space-between',
    },
    barsArea: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 140,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    barGroup: {
      alignItems: 'center',
      width: 40,
    },
    barPair: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4,
    },
    bar: {
      width: 12,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    barLabel: {
      position: 'absolute',
      bottom: -24,
    },
    barLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 24,
    },
    legendItemCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });
