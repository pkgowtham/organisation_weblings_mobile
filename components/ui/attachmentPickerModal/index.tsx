import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Image, Document } from '@/svg_icons';

interface AttachmentPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectImage: (assets: ImagePicker.ImagePickerAsset[]) => void;
  onSelectDocument: (assets: DocumentPicker.DocumentPickerAsset[]) => void;
}

const AttachmentPickerModal: React.FC<AttachmentPickerModalProps> = ({
  visible,
  onClose,
  onSelectImage,
  onSelectDocument,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handlePickImage = () => {
    onClose();
    setTimeout(async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled) {
        onSelectImage(result.assets);
      }
    }, 500);
  };

  const handlePickDocument = () => {
    onClose();
    setTimeout(async () => {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        onSelectDocument(result.assets);
      }
    }, 500);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Typography fontVariant="BS" variant="semibold" style={styles.title}>
                Select Attachment Type
              </Typography>
              
              <TouchableOpacity style={styles.option} onPress={handlePickImage}>
                <Image color={theme.colors.brand.surface.medium} width={24} height={24} viewBox="0 0 24 24" />
                <Typography fontVariant="BM" style={styles.optionText}>Pick from Gallery</Typography>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.option} onPress={handlePickDocument}>
                <Document color={theme.colors.brand.surface.medium} width={24} height={24} viewBox="0 0 24 24" />
                <Typography fontVariant="BM" style={styles.optionText}>Pick Document</Typography>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.neutral.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s400,
  },
  modalContent: {
    backgroundColor: theme.colors.neutral.surface.lighter,
    borderRadius: theme.borderRadius.b400,
    padding: theme.spacing.s400,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    marginBottom: theme.spacing.s400,
    color: theme.colors.neutral.onSurface.dark,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.s300,
  },
  optionText: {
    marginLeft: theme.spacing.s300,
    color: theme.colors.neutral.onSurface.light,
  },
});

export default AttachmentPickerModal;
