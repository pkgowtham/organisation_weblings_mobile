import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/typography';
import CustomButton from '@/components/ui/button';
import ScrollTabs from '@/components/ui/scrollTabs';
import { useTheme } from '@/context/CustomThemeContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { useStore } from '@/store';
import { Close, Edit } from '@/svg_icons';
import Avatar from '@/components/ui/avatar';
import { useLocalSearchParams } from 'expo-router';

export default function ViewTeamScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safeBack, safePush } = useSafeNavigation();
  const { teamId } = useLocalSearchParams<{ teamId?: string }>();
  const { store } = useStore();

  const [activeTab, setActiveTab] = useState('Team details');
  const tabs = ['Team details', 'Members'];

  const teamList = store.team?.teamList || [];
  const currentTeam = useMemo(() => {
    return (
      teamList.find((t: any) => String(t.id || t._id) === String(teamId)) ||
      teamList[0] ||
      {}
    );
  }, [teamList, teamId]);

  const teamName = currentTeam.name || currentTeam.teamName || 'Team';
  const description = currentTeam.description || 'No description provided';
  const projectName =
    currentTeam.project?.name ||
    currentTeam.project?.projectName ||
    (typeof currentTeam.project === 'string' ? currentTeam.project : '—');
  const leadName =
    currentTeam.teamLead?.displayName ||
    currentTeam.teamLead?.name ||
    currentTeam.lead?.name ||
    currentTeam.lead?.displayName ||
    (typeof currentTeam.lead === 'string'
      ? currentTeam.lead
      : typeof currentTeam.teamLead === 'string'
        ? currentTeam.teamLead
        : '—');
  const leadRole =
    currentTeam.teamLead?.jobTitle ||
    currentTeam.teamLead?.role ||
    currentTeam.lead?.role ||
    'Team Lead';
  const leadAvatar =
    currentTeam.teamLead?.dp ||
    currentTeam.teamLead?.dP ||
    currentTeam.teamLead?.avatar ||
    undefined;

  const membersList = currentTeam.employeeList || currentTeam.employees || [];

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

        <ScrollTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          containerStyle={styles.tabsContainer}
        />

        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentPadding} showsVerticalScrollIndicator={false}>
          {activeTab === 'Team details' ? (
            <View style={styles.detailsTab}>
              <View style={styles.sectionHeader}>
                <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark">
                  Team Details
                </Typography>
                <CustomButton
                  title="Edit"
                  variant="outline"
                  size="small"
                  onPress={() => safePush('/(protected)/(teams)/editTeam')}
                />
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={styles.label}>
                    Team name
                  </Typography>
                  <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark">
                    {teamName}
                  </Typography>
                </View>

                <View style={styles.detailItem}>
                  <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={styles.label}>
                    Description
                  </Typography>
                  <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark">
                    {description}
                  </Typography>
                </View>

                <View style={styles.detailItem}>
                  <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={styles.label}>
                    Team lead
                  </Typography>
                  <View style={styles.leadRow}>
                    <Avatar size="sm" source={leadAvatar ? { uri: leadAvatar } : undefined} name={leadName} />
                    <View style={styles.leadInfo}>
                      <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark">
                        {leadName}
                      </Typography>
                      <Typography fontVariant="BXS" color="colors.neutral.onSurface.medium">
                        {leadRole}
                      </Typography>
                    </View>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={styles.label}>
                    Project
                  </Typography>
                  <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark">
                    {projectName}
                  </Typography>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.membersTab}>
              <View style={styles.sectionHeader}>
                <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark">
                  Members {membersList.length}
                </Typography>
                <View style={styles.memberActions}>
                  <CustomButton
                    title="Add member"
                    variant="outline"
                    size="small"
                    onPress={() =>
                      safePush('/(protected)/(teams)/addMembersToTeam', {
                        teamId: String(currentTeam?.id || currentTeam?._id || teamId),
                      })
                    }
                  />
                  <CustomButton
                    title="Remove member"
                    variant="outline"
                    size="small"
                    onPress={() =>
                      safePush('/(protected)/(teams)/removeMembers', {
                        teamId: String(currentTeam?.id || currentTeam?._id || teamId),
                      })
                    }
                  />
                </View>
              </View>

              <View style={styles.membersList}>
                {membersList.length > 0 ? (
                  membersList.map((member: any, idx: number) => {
                    const empName =
                      member.displayName ||
                      member.name ||
                      `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
                      'Member';
                    const empRole = member.jobTitle || member.role || member.designation || 'Team Member';
                    const empAvatar = member.dp || member.dP || member.avatar || undefined;
                    return (
                      <View key={member.id || member._id || idx} style={styles.memberRow}>
                        <Avatar size="sm" source={empAvatar ? { uri: empAvatar } : undefined} name={empName} />
                        <View style={styles.memberInfo}>
                          <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark">
                            {empName}
                          </Typography>
                          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                            {empRole}
                          </Typography>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                    No members in this team.
                  </Typography>
                )}
              </View>
            </View>
          )}
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
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.border.light,
    paddingHorizontal: theme.spacing.s400,
  },
  contentScroll: {
    flex: 1,
  },
  contentPadding: {
    padding: theme.spacing.s400,
    paddingBottom: theme.spacing.s600,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s500,
    flexWrap: 'wrap',
    gap: theme.spacing.s300,
  },
  detailsTab: {
    flex: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: theme.spacing.s500,
    columnGap: theme.spacing.s500,
  },
  detailItem: {
    width: '45%',
    minWidth: 250,
  },
  label: {
    marginBottom: theme.spacing.s100,
  },
  leadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s300,
    marginTop: theme.spacing.s100,
  },
  leadInfo: {
    flex: 1,
  },
  membersTab: {
    flex: 1,
  },
  memberActions: {
    flexDirection: 'row',
    gap: theme.spacing.s300,
  },
  membersList: {
    gap: theme.spacing.s400,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s300,
  },
  memberInfo: {
    flex: 1,
  },
});
