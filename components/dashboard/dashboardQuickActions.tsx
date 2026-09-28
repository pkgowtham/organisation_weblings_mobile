import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import { Folder, Client, Person, AddPerson } from '@/svg_icons';

interface DashboardQuickActionsProps {
  onSelectTab?: (tab: string) => void;
}

const ACTIONS = [
  { id: 'projects', title: 'Project', Icon: Folder, color: '#3B82F6', bgColor: '#EFF6FF', tabName: 'Projects' },
  { id: 'clients', title: 'Client', Icon: Client, color: '#8B5CF6', bgColor: '#F5F3FF', tabName: 'Clients' },
  { id: 'teams', title: 'Team', Icon: Person, color: '#10B981', bgColor: '#ECFDF5', tabName: 'Teams' },
  { id: 'employee', title: 'Employee Details', Icon: AddPerson, color: '#EA580C', bgColor: '#FFF7ED', tabName: 'Employee Details' },
];

export default function DashboardQuickActions({ onSelectTab }: DashboardQuickActionsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light" style={styles.cardTitle}>
        Quick Actions
      </Typography>
      <View style={styles.grid}>
        {ACTIONS.map((item) => {
          const Icon = item.Icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={() => onSelectTab && onSelectTab(item.tabName)}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                <Icon color={item.color} width={20} height={20} />
              </View>
              <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light" style={styles.actionText}>
                {item.title}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      padding: theme.spacing.s400,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      marginBottom: 16,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    actionBtn: {
      width: '48%',
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.s400,
      paddingHorizontal: theme.spacing.s200,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    actionText: {
      textAlign: 'center',
    },
  });
