import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import TextField from '@/components/ui/textField';
import Dropdown from '@/components/ui/dropdown';
import CustomButton from '@/components/ui/button';
import { useTheme } from '@/context/CustomThemeContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useToast } from '@/context/ToastContext';
import { useActiveBul } from '@/hooks/useActiveBul';
import { Close } from '@/svg_icons';
import { useLocalSearchParams } from 'expo-router';

export default function EditTeamScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safeBack } = useSafeNavigation();
  const { showToast } = useToast();
  const { teamId } = useLocalSearchParams<{ teamId?: string }>();

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { activeBulId } = useActiveBul();

  const teamList = store.team?.teamList || [];
  const currentTeam = useMemo(() => {
    return teamList.find((t: any) => String(t.id || t._id) === String(teamId)) || teamList[0] || {};
  }, [teamList, teamId]);

  const [project, setProject] = useState(
    currentTeam.projectId || currentTeam.project?.id || currentTeam.project?._id || ''
  );
  const [teamName, setTeamName] = useState(currentTeam.name || currentTeam.teamName || '');
  const [desc, setDesc] = useState(currentTeam.description || '');
  const [lead, setLead] = useState(
    currentTeam.teamLeadId || currentTeam.teamLead?.id || currentTeam.lead?.id || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Projects and Employees on Mount
  useEffect(() => {
    const query: any = { limit: 50, page: 1 };
    if (activeBulId) query.bulId = activeBulId;

    dispatch({
      type: 'PROJECT_GETLIST_API_REQUEST',
      payload: { url: '/project', method: 'GET', query },
    });
    dispatch({
      type: 'EMPLOYEE_LIST_GETLIST_API_REQUEST',
      payload: { url: '/employee', method: 'GET', query },
    });
  }, [dispatch, activeBulId]);

  const rawProjects = store.project?.projectList || [];
  const projectOptions = useMemo(() => {
    if (!Array.isArray(rawProjects)) return [];
    return rawProjects.map((p: any) => ({
      label: p.projectName || p.name || p.title || 'Project',
      value: p.id || p._id,
    }));
  }, [rawProjects]);

  const rawEmployees =
    store.employee?.employeeList ||
    (store as any).employeeGet?.dataGetList?.data ||
    [];
  const employeeOptions = useMemo(() => {
    if (!Array.isArray(rawEmployees)) return [];
    return rawEmployees.map((e: any) => {
      const name =
        e.displayName ||
        e.name ||
        `${e.firstName || ''} ${e.lastName || ''}`.trim() ||
        e.email ||
        'Employee';
      return {
        label: name,
        value: e.id || e._id,
      };
    });
  }, [rawEmployees]);

  const handleSave = async () => {
    const targetTeamId = currentTeam.id || currentTeam._id || teamId;
    if (!targetTeamId) {
      showToast({ type: 'error', iconType: 'error', title: 'Team ID missing' });
      return;
    }
    if (!teamName.trim()) {
      showToast({ type: 'error', iconType: 'error', title: 'Team name is required' });
      return;
    }

    setIsSubmitting(true);
    const payload: any = {
      name: teamName.trim(),
      projectId: project || undefined,
      teamLead: lead || undefined,
      description: desc.trim(),
    };
    if (activeBulId) payload.bulId = activeBulId;

    try {
      const res: any = await dispatch({
        type: 'TEAMS_UPDATE_API_REQUEST',
        payload: {
          url: '/team',
          method: 'PUT',
          query: { id: targetTeamId },
          body: payload,
        },
      });

      setIsSubmitting(false);
      if (res && res.success !== false) {
        showToast({ type: 'success', iconType: 'success', title: 'Team updated successfully' });
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
        showToast({ type: 'error', iconType: 'error', title: res?.message || 'Failed to update team' });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      showToast({ type: 'error', iconType: 'error', title: err?.message || 'Failed to update team' });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark">
            {teamName || 'Edit Team'}
          </Typography>
          <TouchableOpacity onPress={safeBack} style={styles.closeBtn}>
            <Close color={theme.colors.neutral.onSurface.dark} width={20} height={20} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark">
              Edit team details
            </Typography>
            <View style={styles.actions}>
              <TouchableOpacity onPress={safeBack} style={styles.discardBtn}>
                <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark">
                  Discard
                </Typography>
              </TouchableOpacity>
              <CustomButton
                title="Save changes"
                variant="primary"
                size="small"
                loading={isSubmitting}
                disabled={isSubmitting}
                onPress={handleSave}
              />
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Dropdown
                label="Project"
                placeholder="Select Project"
                options={projectOptions}
                selectedValue={project}
                onValueChange={setProject}
              />
            </View>

            <View style={styles.formGroup}>
              <Input
                label="Team name *"
                placeholder="Enter team name"
                value={teamName}
                onChangeText={setTeamName}
              />
            </View>

            <View style={styles.formGroup}>
              <TextField
                label="Description"
                placeholder="Enter description"
                value={desc}
                onChangeText={setDesc}
                expandable={true}
                minHeight={80}
                maxHeight={160}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>

            <View style={styles.formGroup}>
              <Dropdown
                label="Team lead"
                placeholder="Select team lead"
                options={employeeOptions}
                selectedValue={lead}
                onValueChange={setLead}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.s400,
    paddingBottom: theme.spacing.s600,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.s400,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.surface.light,
    marginBottom: theme.spacing.s500,
    flexWrap: 'wrap',
    gap: theme.spacing.s400,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s400,
  },
  discardBtn: {
    paddingHorizontal: theme.spacing.s200,
  },
  formContainer: {
    width: '100%',
  },
  formGroup: {
    marginBottom: theme.spacing.s400,
  },
});

