import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Animated } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Document, Image as ImageIcon, FileMove, Folder } from '@/svg_icons';

export interface PickedAsset {
  uri: string;
  name: string;
  type: string;
}

interface ChatAttachmentPickerProps {
  visible: boolean;
  onClose: () => void;
  onPick: (assets: PickedAsset[]) => void;
}

const ATTACHMENT_OPTIONS = [
  { key: 'document', label: 'Document', icon: Document, color: '#7B61FF' },
  { key: 'images', label: 'Images', icon: ImageIcon, color: '#E91E63' },
  { key: 'videos', label: 'Videos', icon: FileMove, color: '#FF5722' },
  { key: 'music', label: 'Music', icon: Folder, color: '#FF9800' },
] as const;

type OptionKey = typeof ATTACHMENT_OPTIONS[number]['key'];

const ChatAttachmentPicker: React.FC<ChatAttachmentPickerProps> = ({
  visible,
  onClose,
  onPick,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const sheetTranslateY = React.useRef(new Animated.Value(300)).current;
  const [modalVisible, setModalVisible] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(sheetTranslateY, { toValue: 0, friction: 9, tension: 65, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible]);

  const handlePick = (key: OptionKey) => {
    onClose();
    setTimeout(async () => {
      try {
        switch (key) {
          case 'document': {
            const result = await DocumentPicker.getDocumentAsync({
              multiple: true,
              copyToCacheDirectory: true,
            });
            if (!result.canceled) {
              onPick(result.assets.map((a) => ({ uri: a.uri, name: a.name, type: a.mimeType || 'application/octet-stream' })));
            }
            break;
          }
          case 'images': {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return;
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsMultipleSelection: true,
              quality: 1,
            });
            if (!result.canceled) {
              onPick(result.assets.map((a) => ({ uri: a.uri, name: a.fileName || a.uri.split('/').pop() || 'image.jpg', type: a.mimeType || 'image/jpeg' })));
            }
            break;
          }
          case 'videos': {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return;
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['videos'],
              allowsMultipleSelection: true,
              quality: 1,
            });
            if (!result.canceled) {
              onPick(result.assets.map((a) => ({ uri: a.uri, name: a.fileName || a.uri.split('/').pop() || 'video.mp4', type: a.mimeType || 'video/mp4' })));
            }
            break;
          }
          case 'music': {
            const result = await DocumentPicker.getDocumentAsync({
              type: 'audio/*',
              multiple: true,
              copyToCacheDirectory: true,
            });
            if (!result.canceled) {
              onPick(result.assets.map((a) => ({ uri: a.uri, name: a.name, type: a.mimeType || 'audio/mpeg' })));
            }
            break;
          }
        }
      } catch (error) {
        console.warn('Attachment pick error:', error);
      }
    }, 500);
  };

  if (!modalVisible) return null;

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
              <View style={styles.handle} />
              <View style={styles.grid}>
                {ATTACHMENT_OPTIONS.map((opt) => {
                  const IconComponent = opt.icon;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={styles.optionItem}
                      onPress={() => handlePick(opt.key)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: opt.color }]}>
                        <IconComponent width={24} height={24} viewBox="0 0 24 24" color="#FFFFFF" />
                      </View>
                      <Typography fontVariant="BXS" variant="medium" color="colors.neutral.onSurface.light" style={styles.optionLabel}>
                        {opt.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.neutral.overlay.light,
    },
    sheet: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderTopLeftRadius: theme.borderRadius.b400,
      borderTopRightRadius: theme.borderRadius.b400,
      paddingBottom: theme.spacing.s800,
      paddingTop: theme.spacing.s300,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.neutral.border.medium,
      alignSelf: 'center',
      marginBottom: theme.spacing.s400,
    },
    grid: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      paddingHorizontal: theme.spacing.s400,
    },
    optionItem: {
      alignItems: 'center',
      width: 72,
    },
    iconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.s200,
    },
    optionLabel: {
      textAlign: 'center',
    },
  });

export default ChatAttachmentPicker;
