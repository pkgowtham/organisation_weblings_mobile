import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Typography } from "@/components/ui/typography";
import Avatar from "@/components/ui/avatar";
import { useTheme } from "@/context/CustomThemeContext";
import AdjustImageModal from "./AdjustImageModal";

interface ProfileImagePickerProps {
  currentImageUri?: string | null;
  onImageUpdate: (uri: string) => void;
  name?: string; // used for fallback avatar
}

const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  currentImageUri,
  onImageUpdate,
  name = "User Name",
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTempUri, setSelectedTempUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // We still use native cropping just in case
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedTempUri(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  const handleSave = () => {
    if (selectedTempUri) {
      onImageUpdate(selectedTempUri);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Avatar
        size="xl"
        name={name}
        source={currentImageUri ? { uri: currentImageUri } : undefined}
      />
      <TouchableOpacity onPress={pickImage} style={styles.changeProfileBtn}>
        <Typography fontVariant="BM" variant="bold" color="colors.brand.onSurface.light">
          Change Profile
        </Typography>
      </TouchableOpacity>

      <AdjustImageModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        imageUri={selectedTempUri}
        onSave={handleSave}
      />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      gap: theme.spacing.s300,
      alignSelf: "flex-start", // To prevent it from stretching in flex containers
    },
    changeProfileBtn: {
      paddingVertical: theme.spacing.s100,
    },
  });

export default ProfileImagePicker;
