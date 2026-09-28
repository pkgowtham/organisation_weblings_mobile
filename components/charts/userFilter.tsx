import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { MediumText, SemiBoldText } from '../ui/typography';

type UserFilterProps = {
  users: Array<{ label: string; color: string }>;
  selectedUsers: Set<string>;
  onUserToggle: (userLabel: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
};

export default function UserFilter({ 
  users, 
  selectedUsers, 
  onUserToggle, 
  onSelectAll, 
  onDeselectAll 
}: UserFilterProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.userFilterContainer}>
      <View style={styles.userFilterHeader}>
        <SemiBoldText fontVariant="BS" style={styles.userFilterTitle}>
          Filter Users
        </SemiBoldText>
        <View style={styles.userFilterActions}>
          <Pressable onPress={onSelectAll} style={styles.filterActionButton}>
            <MediumText fontVariant="BS" style={styles.filterActionText}>
              All
            </MediumText>
          </Pressable>
          <Pressable onPress={onDeselectAll} style={styles.filterActionButton}>
            <MediumText fontVariant="BS" style={styles.filterActionText}>
              None
            </MediumText>
          </Pressable>
        </View>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.userFilterScroll}
      >
        <View style={styles.userFilterList}>
          {users.map((user, index) => {
            const isSelected = selectedUsers.has(user.label);
            return (
              <Pressable
                key={`user-filter-${index}`}
                onPress={() => onUserToggle(user.label)}
                style={[
                  styles.userFilterItem,
                  { 
                    backgroundColor: isSelected ? user.color : theme.colors.neutral.surface.light,
                    borderColor: user.color
                  }
                ]}
              >
                <View style={styles.userFilterIndicator}>
                  <View 
                    style={[
                      styles.userFilterDot,
                      { backgroundColor: isSelected ? 'white' : user.color }
                    ]} 
                  />
                </View>
                <MediumText 
                  fontVariant="BS" 
                  style={[
                    styles.userFilterText,
                    { color: isSelected ? 'white' : theme.colors.neutral.onSurface.light }
                  ]}
                >
                  {user.label}
                </MediumText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    userFilterContainer: {
      width: '100%',
      paddingHorizontal: 8,
      marginBottom: 16,
    },
    userFilterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    userFilterTitle: {
      color: theme.colors.neutral.onSurface.light,
      fontSize: 14,
    },
    userFilterActions: {
      flexDirection: 'row',
      gap: 12,
    },
    filterActionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: 6,
    },
    filterActionText: {
      color: theme.colors.neutral.onSurface.dark,
      fontSize: 12,
    },
    userFilterScroll: {
      width: '100%',
    },
    userFilterList: {
      flexDirection: 'row',
      gap: 8,
      paddingRight: 16,
    },
    userFilterItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      gap: 6,
    },
    userFilterIndicator: {
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userFilterDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    userFilterText: {
      fontSize: 12,
      fontWeight: '500',
    },
  });