import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import TextField from '@/components/ui/textField';
import Dropdown from '@/components/ui/dropdown';
import CustomButton from '@/components/ui/button';
import Avatar from '@/components/ui/avatar';
import { useTheme } from '@/context/CustomThemeContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useToast } from '@/context/ToastContext';
import { useActiveBul } from '@/hooks/useActiveBul';
import { ArrowBackIos, Close, Search } from '@/svg_icons';

export default function CreateTeamScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safeBack } = useSafeNavigation();
  const { showToast } = useToast();

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { activeBulId } = useActiveBul();

  // Form State
  const [projectId, setProjectId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [teamLeadId, setTeamLeadId] = useState('');

  // Members selection state
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  // Loading & validation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Fetch Projects on Mount
  useEffect(() => {
    const query: any = { limit: 50, page: 1 };
    if (activeBulId) query.bulId = activeBulId;

    dispatch({
      type: 'PROJECT_GETLIST_API_REQUEST',
      payload: {
        url: '/project',
        method: 'GET',
        query,
      },
    });
  }, [dispatch, activeBulId]);

  // 2. Fetch Employees on Mount (for Team Lead & Member selection)
  useEffect(() => {
    const query: any = { limit: 50, page: 1 };
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

  // Derive Projects Dropdown options
  const rawProjects = store.project?.projectList || [];
  const projectOptions = useMemo(() => {
    if (!Array.isArray(rawProjects)) return [];
    return rawProjects.map((p: any) => ({
      label: p.projectName || p.name || p.title || 'Unnamed Project',
      value: p.id || p._id,
    }));
  }, [rawProjects]);

  // Derive Employees Dropdown & selection options
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
        raw: e,
      };
    });
  }, [rawEmployees]);

  // Filtered employees for Add Member Modal
  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(rawEmployees)) return [];
    return rawEmployees.filter((emp: any) => {
      const name =
        emp.displayName ||
        emp.name ||
        `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
        emp.email ||
        '';
      const role = emp.jobTitle || emp.role || emp.designation || '';
      const term = memberSearch.toLowerCase();
      return name.toLowerCase().includes(term) || role.toLowerCase().includes(term);
    });
  }, [rawEmployees, memberSearch]);

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!projectId) newErrors.projectId = 'Project is required';
    if (!teamName.trim()) newErrors.teamName = 'Team name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler -> POST /team
  const handleCreateTeam = async () => {
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);

    const memberIds = selectedMembers.map((m) => m.id || m._id);

    const payload: any = {
      name: teamName.trim(),
      projectId,
      description: description.trim(),
    };

    if (teamLeadId) {
      payload.teamLead = teamLeadId;
    }

    if (activeBulId) {
      payload.bulId = activeBulId;
    }

    if (memberIds.length > 0) {
      payload.employeeList = memberIds;
    }

    try {
      const res: any = await dispatch({
        type: 'TEAMS_CREATE_API_REQUEST',
        payload: {
          url: '/team',
          method: 'POST',
          body: payload,
        },
      });

      setIsSubmitting(false);

      if (res && res.success !== false) {
        showToast({
          type: 'success',
          iconType: 'success',
          title: res?.message || 'Team created successfully',
        });

        // Refetch team list
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
        showToast({
          type: 'error',
          iconType: 'error',
          title: res?.message || 'Failed to create team. Please try again.',
        });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      showToast({
        type: 'error',
        iconType: 'error',
        title: err?.message || 'Failed to create team. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={safeBack} style={styles.backButton}>
            <ArrowBackIos color={theme.colors.neutral.onSurface.light} height={20} width={20} />
            <Typography
              fontVariant="TM"
              variant="bold"
              color="colors.neutral.onSurface.light"
              style={styles.pageTitle}
            >
              Create Team
            </Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {/* Project Dropdown */}
          <View style={styles.formGroup}>
            <Dropdown
              label="Project *"
              placeholder="Select Project"
              options={projectOptions}
              selectedValue={projectId}
              onValueChange={(val) => {
                setProjectId(val);
                if (errors.projectId) setErrors((prev) => ({ ...prev, projectId: '' }));
              }}
              error={errors.projectId}
            />
          </View>

          {/* Team Name */}
          <View style={styles.formGroup}>
            <Input
              label="Team Name *"
              placeholder="Enter team name"
              value={teamName}
              onChangeText={(val) => {
                setTeamName(val);
                if (errors.teamName) setErrors((prev) => ({ ...prev, teamName: '' }));
              }}
              error={errors.teamName}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <TextField
              label="Description"
              placeholder="Enter team description"
              value={description}
              onChangeText={setDescription}
              expandable={true}
              minHeight={80}
              maxHeight={160}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>

          {/* Team Lead Dropdown */}
          <View style={styles.formGroup}>
            <Dropdown
              label="Team Lead"
              placeholder="Select Team Lead"
              options={employeeOptions}
              selectedValue={teamLeadId}
              onValueChange={setTeamLeadId}
            />
          </View>

          {/* Team Members Section */}
          <View style={styles.membersSection}>
            <View style={styles.membersHeader}>
              <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light">
                Team Members ({selectedMembers.length})
              </Typography>
              <TouchableOpacity
                onPress={() => setIsMemberModalOpen(true)}
                style={styles.addMemberBtn}
              >
                <Typography fontVariant="BS" variant="bold" color="colors.brand.onSurface.light">
                  + Add Members
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Selected Members Chips */}
            {selectedMembers.length > 0 ? (
              <View style={styles.chipsContainer}>
                {selectedMembers.map((m) => {
                  const empId = m.id || m._id;
                  const name =
                    m.displayName ||
                    m.name ||
                    `${m.firstName || ''} ${m.lastName || ''}`.trim() ||
                    'Member';
                  const avatarUrl = m.dp || m.dP || m.avatar || undefined;

                  return (
                    <View key={empId} style={styles.memberChip}>
                      <Avatar
                        size="xs"
                        source={avatarUrl ? { uri: avatarUrl } : undefined}
                        name={name}
                      />
                      <Typography
                        fontVariant="BXS"
                        color="colors.neutral.onSurface.dark"
                        style={styles.chipName}
                      >
                        {name}
                      </Typography>
                      <TouchableOpacity
                        onPress={() => removeMember(empId)}
                        style={styles.chipClose}
                      >
                        <Close
                          color={theme.colors.neutral.onSurface.medium}
                          width={14}
                          height={14}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={styles.noMembersText}>
                No members added yet. You can add members now or later.
              </Typography>
            )}
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <CustomButton
                title="Cancel"
                variant="outline"
                size="medium"
                onPress={safeBack}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomButton
                title="Create Team"
                variant="primary"
                size="medium"
                loading={isSubmitting || store.team?.isLoadingCreate}
                disabled={isSubmitting || store.team?.isLoadingCreate}
                onPress={handleCreateTeam}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Member Selection Modal */}
      <Modal
        visible={isMemberModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsMemberModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light">
                Add Team Members
              </Typography>
              <TouchableOpacity
                onPress={() => setIsMemberModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Close color={theme.colors.neutral.onSurface.light} width={20} height={20} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.modalSearchWrap}>
              <Input
                placeholder="Search employees by name or role"
                value={memberSearch}
                onChangeText={setMemberSearch}
                leftIcon={<Search color={theme.colors.neutral.onSurface.light} />}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>

            {/* Selected Count */}
            <View style={styles.modalSelectedBanner}>
              <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                Selected: <Typography fontVariant="BS" variant="bold" color="colors.brand.onSurface.light">{selectedMembers.length}</Typography>
              </Typography>
            </View>

            {/* Employee List */}
            <FlatList
              data={filteredEmployees}
              keyExtractor={(item, index) => item.id || item._id || String(index)}
              showsVerticalScrollIndicator={false}
              style={styles.modalList}
              renderItem={({ item }) => {
                const empId = item.id || item._id;
                const isSelected = selectedMembers.some((m) => (m.id || m._id) === empId);
                const name =
                  item.displayName ||
                  item.name ||
                  `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
                  'Employee';
                const role = item.jobTitle || item.role || item.designation || 'Team Member';
                const avatarUrl = item.dp || item.dP || item.avatar || undefined;

                return (
                  <TouchableOpacity
                    style={[styles.memberRow, isSelected && styles.memberRowSelected]}
                    onPress={() => toggleSelectMember(item)}
                    activeOpacity={0.7}
                  >
                    <Avatar
                      size="sm"
                      source={avatarUrl ? { uri: avatarUrl } : undefined}
                      name={name}
                    />
                    <View style={styles.memberInfo}>
                      <Typography
                        fontVariant="BM"
                        variant={isSelected ? 'bold' : 'regular'}
                        color="colors.neutral.onSurface.light"
                      >
                        {name}
                      </Typography>
                      <Typography fontVariant="BXS" color="colors.neutral.onSurface.medium">
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
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                    No employees found
                  </Typography>
                </View>
              }
            />

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <CustomButton
                title={`Done (${selectedMembers.length} selected)`}
                variant="primary"
                size="medium"
                onPress={() => setIsMemberModalOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.s400,
      paddingBottom: theme.spacing.s600,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.s400,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s200,
    },
    pageTitle: {
      paddingLeft: theme.spacing.s100,
    },
    formContainer: {
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    formGroup: {
      marginBottom: theme.spacing.s400,
    },
    membersSection: {
      marginTop: theme.spacing.s200,
      marginBottom: theme.spacing.s400,
      padding: theme.spacing.s300,
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius.b200,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
    },
    membersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s300,
    },
    addMemberBtn: {
      paddingVertical: theme.spacing.s100,
      paddingHorizontal: theme.spacing.s200,
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.s200,
    },
    memberChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      borderRadius: 20,
      paddingVertical: 4,
      paddingHorizontal: 8,
      gap: 6,
    },
    chipName: {
      maxWidth: 120,
    },
    chipClose: {
      padding: 2,
    },
    noMembersText: {
      fontStyle: 'italic',
    },
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.s300,
      marginTop: theme.spacing.s400,
      paddingTop: theme.spacing.s400,
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral.border.light,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderTopLeftRadius: theme.borderRadius.b300,
      borderTopRightRadius: theme.borderRadius.b300,
      maxHeight: '85%',
      minHeight: '60%',
      display: 'flex',
      flexDirection: 'column',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.s400,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    modalCloseBtn: {
      padding: theme.spacing.s100,
    },
    modalSearchWrap: {
      padding: theme.spacing.s400,
      paddingBottom: theme.spacing.s200,
    },
    modalSelectedBanner: {
      paddingHorizontal: theme.spacing.s400,
      paddingBottom: theme.spacing.s200,
    },
    modalList: {
      flex: 1,
      paddingHorizontal: theme.spacing.s400,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s200,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.lighter || theme.colors.neutral.border.light,
      borderRadius: theme.borderRadius.b100,
      gap: theme.spacing.s300,
    },
    memberRowSelected: {
      backgroundColor: theme.colors.brand.surface.lighter || theme.colors.neutral.surface.light,
    },
    memberInfo: {
      flex: 1,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: theme.colors.neutral.border.medium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: theme.colors.brand.surface.medium,
      borderColor: theme.colors.brand.surface.medium,
    },
    emptyList: {
      padding: theme.spacing.s500,
      alignItems: 'center',
    },
    modalFooter: {
      padding: theme.spacing.s400,
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral.border.light,
    },
  });

