import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';

interface SectionCardProps {
  title?: string;
  onEdit?: () => void;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function SectionCard({ title, onEdit, children, style }: SectionCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.card, style]}>
      {title ? (
        <>
          <View style={styles.header}>
            <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.medium">
              {title}
            </Typography>
            {onEdit && (
              <TouchableOpacity onPress={onEdit}>
                <Typography fontVariant="BS" color="colors.brand.onSurface.light" variant="medium">
                  Edit
                </Typography>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.divider} />
        </>
      ) : null}
      <View style={styles.content}>
        {children}
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
      marginTop: theme.spacing.s400,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.s400,
      paddingBottom: theme.spacing.s300,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.neutral.border.light,
      marginHorizontal: theme.spacing.s400,
    },
    content: {
      padding: theme.spacing.s400,
      paddingTop: theme.spacing.s300,
    },
  });
