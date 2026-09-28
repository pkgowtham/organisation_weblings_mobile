import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Typography } from "@/components/ui/typography";
import Tag from "@/components/ui/tag";
import { useTheme } from "@/context/CustomThemeContext";
import CustomButton from "../button";

interface AttachmentInputProps {
  attachments: any[];
  setAttachments: React.Dispatch<React.SetStateAction<any[]>>;
}

const truncateFilename = (name: string, maxLen: number = 25) => {
  if (!name || name.length <= maxLen) return name;
  const half = Math.floor((maxLen - 3) / 2);
  return name.slice(0, half) + "..." + name.slice(-half);
};

const AttachmentInput: React.FC<AttachmentInputProps> = ({ attachments, setAttachments }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newAttachments = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || asset.uri.split('/').pop() || 'image.jpg',
        type: asset.mimeType || 'image/jpeg',
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <View style={styles.attachmentSection}>
      <Typography fontVariant="LS" color="colors.neutral.onSurface.light" variant="medium" style={styles.attachmentLabel}>
        Attachments
      </Typography>
      <TouchableOpacity style={styles.browseButton} onPress={pickImage}>
        <CustomButton
          variant="dull"
          title="Browse"
          size="xs"
          onPress={() => pickImage()}
        />
      </TouchableOpacity>

      {attachments.length > 0 && (
        <View style={styles.attachmentsList}>
          {attachments.map((file, idx) => (
            <Tag
              key={idx}
              label={truncateFilename(file.name || file.filename)}
              color="brand"
              variant="bordered"
              iconRight="close"
              onPressRight={() => handleRemoveAttachment(idx)}
              tagStyle={styles.attachmentTag}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default AttachmentInput;

const createStyles = (theme: any) => StyleSheet.create({
  attachmentSection: {
    marginBottom: 24,
  },
  attachmentLabel: {
    marginBottom: 8,
  },
  browseButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral.border.medium,
    borderStyle: "dashed",
  },
  attachmentsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  attachmentTag: {
    marginBottom: 0,
  },
});
