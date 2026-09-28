import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Avatar from '@/components/ui/avatar';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';

interface ChatCardProps {
  name: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl?: string;
  unreadCount?: number;
  isOnline?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

const ChatCard: React.FC<ChatCardProps> = ({
  name,
  lastMessage,
  timestamp,
  avatarUrl,
  unreadCount = 0,
  isOnline = false,
  onPress,
  onLongPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrapper}>
        <Avatar
          source={avatarUrl ? { uri: avatarUrl } : undefined}
          name={name}
          size="lg"
        />
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.contentSection}>
        <View style={styles.topRow}>
          <Typography
            fontVariant="BS"
            variant="semibold"
            color="colors.neutral.onSurface.light"
            style={styles.nameText}
            numberOfLines={1}
          >
            {name}
          </Typography>
          <Typography
            fontVariant="BXS"
            color="colors.neutral.onSurface.dark"
          >
            {timestamp}
          </Typography>
        </View>

        <View style={styles.bottomRow}>
          <Typography
            fontVariant="BXS"
            color="colors.neutral.onSurface.dark"
            style={styles.messageText}
            numberOfLines={1}
          >
            {lastMessage}
          </Typography>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Typography
                fontVariant="BXS"
                variant="semibold"
                color="colors.neutral.onSurface.inverse"
                style={styles.badgeText}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Typography>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.s400,
      paddingVertical: theme.spacing.s300,
    },
    avatarWrapper: {
      position: 'relative',
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.positive.surface.medium,
      borderWidth: 2,
      borderColor: theme.colors.neutral.surface.lighter,
    },
    contentSection: {
      flex: 1,
      marginLeft: theme.spacing.s300,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      paddingBottom: theme.spacing.s300,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s100,
    },
    nameText: {
      flex: 1,
      marginRight: theme.spacing.s200,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    messageText: {
      flex: 1,
      marginRight: theme.spacing.s200,
    },
    badge: {
      backgroundColor: theme.colors.brand.surface.medium,
      borderRadius: theme.borderRadius.b2500,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      fontSize: 10,
      lineHeight: 14,
    },
  });

export default ChatCard;
