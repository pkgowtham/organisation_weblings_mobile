import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { ArrowBackIos } from '@/svg_icons';
import Avatar from '@/components/ui/avatar';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useActiveBul } from '@/hooks/useActiveBul';

export default function ProjectDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safeBack } = useSafeNavigation();
  const params = useLocalSearchParams<{ projectId: string }>();
  const projectId = params.projectId;

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { activeBulId } = useActiveBul();

  useEffect(() => {
    // Check if project exists in store list
    const rawList = store.project?.projectList || [];
    const found = rawList.find((p: any) => String(p.id || p._id) === String(projectId));
    if (found) {
      setProjectData(found);
    }

    if (projectId) {
      setIsLoading(true);
      dispatch({
        type: 'PROJECT_GET_API_REQUEST',
        payload: {
          url: '/project',
          method: 'GET',
          params: projectId,
          query: { bulId: activeBulId },
        },
      }).then((res: any) => {
        setIsLoading(false);
        const detail = res?.data?.content || res?.data?.data || res?.data || res;
        if (detail && typeof detail === 'object' && !res.error) {
          setProjectData(detail);
        }
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [projectId, activeBulId, dispatch]);

  const toggleTeam = (id: string) => {
    if (expandedTeam === id) {
      setExpandedTeam(null);
    } else {
      setExpandedTeam(id);
    }
  };

  const getProjectTeamLeads = (project: any) => {
    if (!project) return [];
    const teams = project.teams || project.teamsList || [];
    const leadsMap = new Map();

    teams.forEach((t: any) => {
      const lead = t.teamLead || (t.leadName ? { displayName: t.leadName, name: t.leadName } : null);
      if (lead) {
        const key = lead.id || lead.displayName || lead.name || lead.email;
        if (key && !leadsMap.has(key)) {
          leadsMap.set(key, {
            id: key,
            name: lead.displayName || lead.name || lead.email || 'Team Lead',
          });
        }
      }
    });

    if (leadsMap.size === 0 && project.teamLead) {
      const tl = project.teamLead;
      if (Array.isArray(tl)) {
        tl.forEach((item: any, idx: number) => {
          const k = item.id || item.displayName || item.name || idx;
          leadsMap.set(k, {
            id: k,
            name: item.displayName || item.name || (typeof item === 'string' ? item : 'Team Lead'),
          });
        });
      } else if (typeof tl === 'object') {
        leadsMap.set(tl.id || 'tl-1', {
          id: tl.id || 'tl-1',
          name: tl.displayName || tl.name || 'Team Lead',
        });
      } else if (typeof tl === 'string') {
        leadsMap.set(tl, { id: tl, name: tl });
      }
    }

    return Array.from(leadsMap.values());
  };

  const proj = projectData;

  const title = proj?.projectName || proj?.name || 'Corporate Intranet 2.0';
  const clientName = proj?.client?.clientName || proj?.client?.name || (typeof proj?.client === 'string' ? proj.client : '') || proj?.clientName || 'Alex';
  const managerName = proj?.projectManager?.displayName || proj?.projectManager?.name || (typeof proj?.projectManager === 'string' ? proj.projectManager : '') || proj?.productManager?.name || 'Sarah';
  const durationText = proj?.duration
    ? (typeof proj.duration === 'number' || !isNaN(Number(proj.duration))
      ? `${proj.duration} Month${Number(proj.duration) > 1 ? 's' : ''}`
      : proj.duration)
    : '19 sep, 24 - 28 nov,25';
  const billingText = proj?.billingCurrency?.name || (typeof proj?.billingCurrency === 'string' ? proj.billingCurrency : '') || proj?.billingType?.name || (typeof proj?.billingType === 'string' ? proj.billingType : '') || '$ USD';
  const description = proj?.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
  const teamLeads = getProjectTeamLeads(proj);

  const projectTeams = proj?.teams || proj?.teamsList || [
    {
      id: 't1',
      name: 'Payments Team',
      leadName: 'Janani',
      tagColor: 'positive',
      members: [],
    },
    {
      id: 't2',
      name: 'Customer Service Team',
      leadName: 'Janani',
      tagColor: 'neutral',
      members: [
        { id: 'm1', name: 'Albert Flores', role: 'UI/UX Designer' },
        { id: 'm2', name: 'Devon Lane', role: 'Software Development Manager' },
        { id: 'm3', name: 'Devon Lane', role: 'Software Development Manager' },
      ],
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {isLoading && !proj ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={safeBack} style={styles.backButton}>
              <ArrowBackIos color={theme.colors.neutral.onSurface.light} height={24} width={24} />
              <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light">
                {title}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Top Info Grid */}
          <View style={styles.topGrid}>
            <View style={styles.infoCard}>
              <Typography fontVariant="BM" color="colors.neutral.onSurface.medium">Client</Typography>
              <Typography fontVariant="BM" color="colors.brand.surface.medium">{clientName}</Typography>
            </View>
            <View style={styles.infoCard}>
              <Typography fontVariant="BM" color="colors.neutral.onSurface.medium">Project Manager</Typography>
              <Typography fontVariant="BM" color="colors.brand.surface.medium">{managerName}</Typography>
            </View>
            <View style={styles.infoCard}>
              <Typography fontVariant="BM" color="colors.neutral.onSurface.medium">Team Lead</Typography>
              <View style={styles.avatarGroup}>
                {teamLeads.length > 0 ? (
                  teamLeads.slice(0, 3).map((tl, idx) => (
                    <Avatar key={tl.id || idx} size="xs" name={tl.name} style={styles.avatarOverlap} />
                  ))
                ) : (
                  <Typography fontVariant="BM" color="colors.neutral.onSurface.light">-</Typography>
                )}
              </View>
            </View>
            <View style={styles.infoCard}>
              <Typography fontVariant="BM" color="colors.neutral.onSurface.medium">Duration</Typography>
              <Typography fontVariant="BM" color="colors.neutral.onSurface.light">{durationText}</Typography>
            </View>
            <View style={styles.infoCard}>
              <Typography fontVariant="BM" color="colors.neutral.onSurface.medium">Billing</Typography>
              <Typography fontVariant="BM" color="colors.neutral.onSurface.light">{billingText}</Typography>
            </View>
          </View>

          {/* Description Card */}
          <View style={styles.sectionCard}>
            <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark" style={styles.sectionTitle}>
              Description
            </Typography>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={styles.descText}>
              {description}
            </Typography>
          </View>

          {/* Team Card */}
          <View style={styles.sectionCard}>
            <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark" style={styles.sectionTitle}>
              Team
            </Typography>

            <View style={styles.teamList}>
              {projectTeams.map((team: any, index: number) => {
                const teamId = team.id || team._id || String(index);
                const isExpanded = expandedTeam === teamId;
                const leadName = team.teamLead?.displayName || team.teamLead?.name || team.leadName || 'Team Lead';
                const teamName = team.name || team.teamName || 'Team';
                const membersList = Array.isArray(team.members) ? team.members : [];

                return (
                  <View key={teamId} style={styles.teamAccordion}>
                    <TouchableOpacity
                      style={[styles.accordionHeader, isExpanded && styles.accordionHeaderExpanded]}
                      onPress={() => toggleTeam(teamId)}
                    >
                      <View style={styles.accordionLeft}>
                        <Avatar size="sm" name={leadName} />
                        <Typography fontVariant="BM" color="colors.neutral.onSurface.medium">Team Lead : </Typography>
                        <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark">{leadName}</Typography>

                        <View style={[styles.teamBadge, { backgroundColor: theme.colors.brand.surface.lighter }]}>
                          <Typography fontVariant="BS" style={{ color: theme.colors.brand.surface.medium }}>
                            {teamName}
                          </Typography>
                        </View>
                      </View>
                      <View style={styles.accordionRight}>
                        <ArrowBackIos
                          color={theme.colors.neutral.onSurface.dark}
                          style={{ transform: [{ rotate: isExpanded ? '90deg' : '-90deg' }] }}
                        />
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.accordionContent}>
                        {membersList.length > 0 ? (
                          membersList.map((member: any, mIdx: number) => {
                            const mName = member.displayName || member.name || member.email || 'Member';
                            const mRole = member.jobTitle || member.role || 'Member';

                            return (
                              <View key={member.id || mIdx} style={styles.memberRow}>
                                <Avatar size="sm" name={mName} />
                                <View>
                                  <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark">{mName}</Typography>
                                  <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">{mRole}</Typography>
                                </View>
                              </View>
                            );
                          })
                        ) : (
                          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={{ paddingLeft: theme.spacing.s500 }}>
                            No members in this team.
                          </Typography>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.s600,
    },
    headerRow: {
      paddingHorizontal: theme.spacing.s400,
      paddingVertical: theme.spacing.s400,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s200,
    },
    topGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: theme.spacing.s400,
      justifyContent: 'space-between',
    },
    infoCard: {
      width: '48%',
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      padding: theme.spacing.s400,
      marginBottom: theme.spacing.s400,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.s200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
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
    sectionCard: {
      marginHorizontal: theme.spacing.s400,
      marginBottom: theme.spacing.s400,
      padding: theme.spacing.s500,
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
    },
    sectionTitle: {
      marginBottom: theme.spacing.s300,
    },
    descText: {
      lineHeight: 22,
    },
    teamList: {
      gap: theme.spacing.s300,
    },
    teamAccordion: {
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      borderRadius: theme.borderRadius.b300,
      overflow: 'hidden',
    },
    accordionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.s300,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    accordionHeaderExpanded: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    accordionLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s200,
      flexWrap: 'wrap',
      paddingRight: theme.spacing.s200,
    },
    teamBadge: {
      paddingHorizontal: theme.spacing.s300,
      paddingVertical: theme.spacing.s100,
      borderRadius: theme.borderRadius.b100,
      marginLeft: theme.spacing.s200,
    },
    accordionRight: {
      paddingLeft: theme.spacing.s200,
    },
    accordionContent: {
      padding: theme.spacing.s400,
      backgroundColor: theme.colors.neutral.surface.lighter,
      gap: theme.spacing.s400,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s300,
      paddingLeft: theme.spacing.s500,
    },
  });
