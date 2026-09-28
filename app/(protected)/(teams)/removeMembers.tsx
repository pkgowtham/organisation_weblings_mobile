import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/typography';
import CustomButton from '@/components/ui/button';
import { useTheme } from '@/context/CustomThemeContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useToast } from '@/context/ToastContext';
import { useActiveBul } from '@/hooks/useActiveBul';
import { Close } from '@/svg_icons';
import Avatar from '@/components/ui/avatar';
import { useLocalSearchParams } from 'expo-router';

export default function RemoveMembersScreen() {
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

  const teamName = currentTeam.name || currentTeam.teamName || 'Team';
  const members = currentTeam.employeeList || currentTeam.employees || [];

  const [removeQueuedIds, setRemoveQueuedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleRemove = (empId: string) => {
    if (!empId) return;
    setRemoveQueuedIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleSave = async () => {
    const targetTeamId = currentTeam.id || currentTeam._id || teamId;
    if (!targetTeamId) {
      showToast({ type: 'error', iconType: 'error', title: 'Team ID missing' });
      return;
    }
    if (removeQueuedIds.length === 0) {
      safeBack();
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await dispatch({
        type: 'TEAMS_WITH_MEMBERS_UPDATE_API_REQUEST',
        payload: {
          url: '/team/members',
          method: 'PUT',
          query: { id: targetTeamId },
          body: { removeMember: removeQueuedIds },
        },
      });

      setIsSubmitting(false);
      if (res && res.success !== false) {
        showToast({ type: 'success', iconType: 'success', title: 'Members updated successfully' });
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
        showToast({ type: 'error', iconType: 'error', title: res?.message || 'Failed to remove members' });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      showToast({ type: 'error', iconType: 'error', title: err?.message || 'Failed to remove members' });
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
            Remove members
          </Typography>
        </View>

        <View style={styles.actionsBar}>
          <TouchableOpacity onPress={safeBack} style={styles.discardBtn}>
            <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark">
              Cancel
            </Typography>
          </TouchableOpacity>
          <CustomButton
            title={`Save changes (${removeQueuedIds.length})`}
            variant="primary"
            size="small"
            loading={isSubmitting}
            disabled={removeQueuedIds.length === 0 || isSubmitting}
            onPress={handleSave}
          />
        </View>

        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark" style={styles.membersCount}>
            Members {members.length}
          </Typography>

          <View style={styles.membersList}>
            {members.length > 0 ? (
              members.map((member: any, index: number) => {
                const empId = member.id || member._id || member.employeeId || String(index);
                const name =
                  member.displayName ||
                  member.name ||
                  `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
                  'Member';
                const role = member.jobTitle || member.role || member.designation || 'Team Member';
                const avatarUrl = member.dp || member.dP || member.avatar || undefined;
                const isQueued = removeQueuedIds.includes(empId);

                return (
                  <View key={empId} style={[
                    styles.memberRow,
                    index !== members.length - 1 && styles.memberRowBorder
                  ]}>
                    <Avatar size="sm" source={avatarUrl ? { uri: avatarUrl } : undefined} name={name} />
                    <View style={styles.memberInfo}>
                      <Typography
                        fontVariant="BM"
                        variant="bold"
                        color={isQueued ? 'colors.neutral.onSurface.medium' : 'colors.neutral.onSurface.dark'}
                        style={isQueued ? styles.strikethrough : undefined}
                      >
                        {name}
                      </Typography>
                      <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                        {role}
                      </Typography>
                    </View>
                    <CustomButton
                      title={isQueued ? 'Undo' : 'Remove'}
                      variant={isQueued ? 'primary' : 'outline'}
                      size="small"
                      onPress={() => toggleRemove(empId)}
                    />
                  </View>
                );
              })
            ) : (
              <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                No members in this team.
              </Typography>
            )}
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
  sectionHeader: {
    padding: theme.spacing.s400,
    backgroundColor: theme.colors.brand.surface.lighter,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.border.light,
  },
  sectionTitle: {
    //
  },
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.s400,
    paddingBottom: theme.spacing.s600,
  },
  membersCount: {
    marginBottom: theme.spacing.s400,
  },
  membersList: {
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s300,
    paddingVertical: theme.spacing.s300,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.border.light,
  },
  memberInfo: {
    flex: 1,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
});

