import React from 'react';
import { View, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import Avatar from '@/components/ui/avatar';
import { Reply, Forward, Delete } from '@/svg_icons';

interface ChatBubbleProps {
  message: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
  senderName?: string;
  senderAvatar?: string;
  showAvatar?: boolean;
  replyTo?: { senderName: string; message: string } | null;
  selectable?: boolean;
  selected?: boolean;
  onReply?: () => void;
  onForward?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  onLongPress?: () => void;
}

const SWIPE_THRESHOLD = 60;
const ACTIONS_WIDTH = 130;
const SINGLE_REPLY_WIDTH = 60;

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  timestamp,
  isSent,
  isRead = false,
  senderName,
  senderAvatar,
  showAvatar = false,
  replyTo,
  selectable = false,
  selected = false,
  onReply,
  onForward,
  onDelete,
  onSelect,
  onLongPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme, isSent);
  const translateX = React.useRef(new Animated.Value(0)).current;
  const actionsOpacity = React.useRef(new Animated.Value(0)).current;
  const autoSnapTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const snapBack = () => {
    if (autoSnapTimer.current) clearTimeout(autoSnapTimer.current);
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 8 }),
      Animated.timing(actionsOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          // ALL messages: Swipe right -> single Reply icon on left
          const clamped = Math.min(gestureState.dx, SINGLE_REPLY_WIDTH);
          translateX.setValue(clamped);
          actionsOpacity.setValue(Math.min(clamped / SWIPE_THRESHOLD, 1));
        } else if (gestureState.dx < 0) {
          // ALL messages: Swipe left -> options on right
          const clamped = Math.max(gestureState.dx, -ACTIONS_WIDTH);
          translateX.setValue(clamped);
          actionsOpacity.setValue(Math.min(Math.abs(clamped) / SWIPE_THRESHOLD, 1));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Trigger reply action immediately
          onReply?.();
          snapBack();
          return;
        }
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swiped left enough to reveal options
          Animated.spring(translateX, { toValue: -(ACTIONS_WIDTH - 10), useNativeDriver: true, friction: 8 }).start();
          autoSnapTimer.current = setTimeout(() => snapBack(), 3000);
          return;
        }
        // Not far enough, snap back
        snapBack();
      },
    })
  ).current;

  const renderCheckbox = () => {
    if (!selectable) return null;
    return (
      <TouchableOpacity style={styles.checkboxContainer} onPress={onSelect}>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Typography fontVariant="BXS" color="colors.brand.onSurface.light">✓</Typography>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.outerWrapper}>
      {renderCheckbox()}
      <Animated.View
        style={[styles.bubbleWrapper, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* Left Action (Single Reply) - revealed on Right swipe */}
        <Animated.View style={[styles.actionsLeft, { opacity: actionsOpacity }]}>
          <View style={styles.actionIcon}>
            <Reply width={18} height={18} viewBox="0 0 24 24" color={theme.colors.brand.surface.medium} />
          </View>
        </Animated.View>

        {/* Avatar */}
        {!isSent && showAvatar && !selectable && (
          <Avatar
            source={senderAvatar ? { uri: senderAvatar } : undefined}
            name={senderName}
            size="sm"
            style={styles.avatar}
          />
        )}

        {/* Bubble */}
        <TouchableOpacity 
          style={styles.bubbleContainer} 
          activeOpacity={selectable ? 0.7 : 1}
          onPress={selectable ? onSelect : undefined}
          onLongPress={onLongPress}
          delayLongPress={300}
        >
          {!isSent && senderName && (
            <Typography fontVariant="BXS" variant="semibold" style={styles.senderName}>
              {senderName}
            </Typography>
          )}

          {/* Reply preview inside bubble */}
          {replyTo && (
            <View style={styles.replyPreview}>
              <View style={styles.replyBar} />
              <View style={styles.replyContent}>
                <Typography fontVariant="BXS" variant="semibold" style={styles.replyName}>
                  {replyTo.senderName}
                </Typography>
                <Typography fontVariant="BXS" style={styles.replyMessage} numberOfLines={1}>
                  {replyTo.message}
                </Typography>
              </View>
            </View>
          )}

          <View style={styles.bubble}>
            <Typography fontVariant="BS" style={styles.messageText}>
              {message}
            </Typography>
          </View>
          <View style={styles.metaRow}>
            <Typography fontVariant="BXS" style={styles.timestamp}>
              {timestamp}
            </Typography>
            {isSent && (
              <Typography fontVariant="BXS" style={styles.readReceipt}>
                {isRead ? '✓✓' : '✓'}
              </Typography>
            )}
          </View>
        </TouchableOpacity>

        {/* Right Actions (Options) - revealed on Left swipe */}
        <Animated.View style={[styles.actionsRight, { opacity: actionsOpacity }]}>
          <TouchableOpacity style={styles.actionIcon} onPress={() => { onForward?.(); snapBack(); }} activeOpacity={0.7}>
            <Forward width={18} height={18} viewBox="0 0 24 24" color={theme.colors.brand.surface.medium} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon} onPress={() => { onReply?.(); snapBack(); }} activeOpacity={0.7}>
            <Reply width={18} height={18} viewBox="0 0 24 24" color={theme.colors.positive.surface.medium} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon} onPress={() => { onDelete?.(); snapBack(); }} activeOpacity={0.7}>
            <Delete width={18} height={18} viewBox="0 0 24 24" color={theme.colors.negative.surface.medium} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const createStyles = (theme: any, isSent: boolean) =>
  StyleSheet.create({
    outerWrapper: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.s200,
      paddingHorizontal: theme.spacing.s400,
    },
    checkboxContainer: {
      marginRight: theme.spacing.s200,
      justifyContent: 'center',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.neutral.border.dark,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: theme.colors.brand.surface.lighter,
      borderColor: theme.colors.brand.surface.medium,
    },
    bubbleWrapper: {
      flex: 1,
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'flex-end',
      alignSelf: isSent ? 'flex-end' : 'flex-start',
    },
    avatar: {
      marginRight: theme.spacing.s200,
      marginBottom: theme.spacing.s100,
    },
    bubbleContainer: {
      alignItems: isSent ? 'flex-end' : 'flex-start',
    },
    senderName: {
      color: theme.colors.brand.onSurface.light,
      marginBottom: theme.spacing.s100,
      marginLeft: theme.spacing.s100,
    },
    replyPreview: {
      flexDirection: 'row',
      backgroundColor: isSent
        ? theme.colors.brand.surface.dark
        : theme.colors.neutral.surface.medium,
      borderRadius: theme.borderRadius.b200,
      marginBottom: 2,
      overflow: 'hidden',
      width: '100%',
    },
    replyBar: {
      width: 3,
      backgroundColor: isSent
        ? theme.colors.neutral.surface.lighter
        : theme.colors.brand.surface.medium,
    },
    replyContent: {
      flex: 1,
      paddingHorizontal: theme.spacing.s200,
      paddingVertical: theme.spacing.s100,
    },
    replyName: {
      color: isSent
        ? theme.colors.neutral.surface.lighter
        : theme.colors.brand.onSurface.light,
      marginBottom: 1,
    },
    replyMessage: {
      color: isSent
        ? 'rgba(255,255,255,0.75)'
        : theme.colors.neutral.onSurface.dark,
    },
    bubble: {
      backgroundColor: isSent
        ? theme.colors.brand.surface.medium
        : theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius.b300,
      borderTopRightRadius: isSent ? theme.borderRadius.b50 : theme.borderRadius.b300,
      borderTopLeftRadius: isSent ? theme.borderRadius.b300 : theme.borderRadius.b50,
      paddingHorizontal: theme.spacing.s300,
      paddingVertical: theme.spacing.s200,
    },
    messageText: {
      color: isSent
        ? theme.colors.neutral.surface.lighter
        : theme.colors.neutral.onSurface.light,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.s100,
      paddingHorizontal: theme.spacing.s100,
    },
    timestamp: {
      color: theme.colors.neutral.onSurface.dark,
    },
    readReceipt: {
      color: theme.colors.brand.surface.medium,
      marginLeft: theme.spacing.s100,
    },
    actionsRight: {
      position: 'absolute',
      left: '100%',
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s100,
      paddingLeft: theme.spacing.s200,
      width: ACTIONS_WIDTH,
      height: '100%',
    },
    actionsLeft: {
      position: 'absolute',
      right: '100%',
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: theme.spacing.s200,
      width: SINGLE_REPLY_WIDTH,
      height: '100%',
    },
    actionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.neutral.surface.light,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default ChatBubble;
