import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import { AttachFile, Send, Close } from '@/svg_icons';
import ChatAttachmentPicker, { PickedAsset } from '@/components/ui/chatAttachmentPicker';

export interface ReplyInfo {
  messageId: string;
  senderName: string;
  message: string;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  onAttachmentPick?: (assets: PickedAsset[]) => void;
  placeholder?: string;
  replyTo?: ReplyInfo | null;
  onCancelReply?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onAttachmentPick,
  placeholder = 'Type a message...',
  replyTo,
  onCancelReply,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [message, setMessage] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleAttachmentPick = (assets: PickedAsset[]) => {
    onAttachmentPick?.(assets);
  };

  return (
    <View style={styles.container}>
      {/* Reply preview bar */}
      {replyTo && (
        <View style={styles.replyBar}>
          <View style={styles.replyAccent} />
          <View style={styles.replyTextSection}>
            <Typography fontVariant="BXS" variant="semibold" color="colors.brand.onSurface.light" numberOfLines={1}>
              {replyTo.senderName}
            </Typography>
            <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" numberOfLines={1}>
              {replyTo.message}
            </Typography>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.replyCancelBtn}>
            <Close width={18} height={18} viewBox="0 0 24 24" color={theme.colors.neutral.onSurface.dark} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={() => setPickerVisible(true)} style={styles.iconButton}>
          <AttachFile
            width={22}
            height={22}
            viewBox="0 0 24 24"
            color={theme.colors.neutral.onSurface.dark}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.neutral.onSurface.disabled}
          multiline
          maxLength={2000}
        />

        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendButton,
            message.trim()
              ? { backgroundColor: theme.colors.brand.surface.medium }
              : { backgroundColor: theme.colors.neutral.surface.medium },
          ]}
        >
          <Send
            width={18}
            height={18}
            viewBox="0 0 24 24"
            color={theme.colors.neutral.surface.lighter}
          />
        </TouchableOpacity>
      </View>

      <ChatAttachmentPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onPick={handleAttachmentPick}
      />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral.border.light,
      paddingHorizontal: theme.spacing.s300,
      paddingVertical: theme.spacing.s200,
    },
    replyBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius.b200,
      marginBottom: theme.spacing.s200,
      overflow: 'hidden',
    },
    replyAccent: {
      width: 3,
      alignSelf: 'stretch',
      backgroundColor: theme.colors.brand.surface.medium,
    },
    replyTextSection: {
      flex: 1,
      paddingHorizontal: theme.spacing.s200,
      paddingVertical: theme.spacing.s200,
    },
    replyCancelBtn: {
      padding: theme.spacing.s200,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius.b500,
      paddingHorizontal: theme.spacing.s200,
      paddingVertical: theme.spacing.s100,
    },
    iconButton: {
      padding: theme.spacing.s200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textInput: {
      flex: 1,
      fontSize: theme.fontSize.BS.size,
      lineHeight: theme.fontSize.BS.lineHeight,
      fontFamily: 'OpenSansRegular',
      color: theme.colors.neutral.onSurface.light,
      maxHeight: 100,
      paddingVertical: theme.spacing.s200,
      paddingHorizontal: theme.spacing.s200,
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: theme.spacing.s100,
    },
  });

export default ChatInput;
