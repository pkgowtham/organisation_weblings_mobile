import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import Avatar from "../avatar";
import Tag from "../tag";
import { Close } from "@/svg_icons";

export interface MemberCardProps {
  name: string;
  email: string;
  addedDate: string;
  avatarSource?: ImageSourcePropType;
  onRemove?: () => void;
  containerStyle?: any;
  projects?: { id: string; projectName: string }[];
}

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  email,
  addedDate,
  avatarSource,
  onRemove,
  containerStyle,
  projects,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Avatar */}
      <Avatar
        source={avatarSource}
        name={name}
        size="md"
        variant="circular"
      />

      {/* Info */}
      <View style={styles.infoContainer}>
        <Typography
          fontVariant="BS"
          variant="semibold"
          color="colors.neutral.onSurface.light"
          numberOfLines={1}
        >
          {name}
        </Typography>
        <Typography
          fontVariant="BXS"
          color="colors.neutral.onSurface.dark"
          numberOfLines={1}
        >
          {email}
        </Typography>
        <Typography
          fontVariant="BXS"
          color="colors.neutral.onSurface.disabled"
          numberOfLines={1}
          style={styles.dateText}
        >
          ADDED {addedDate}
        </Typography>
        {projects && projects.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {projects.map((proj: any) => (
              <Tag
                key={proj.id}
                label={proj.projectName}
                color="brand"
                variant="bordered"
              />
            ))}
          </View>
        )}
      </View>

      {/* Remove button */}
      {onRemove && (
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.removeBtn}
        >
          <Close
            width={18}
            height={18}
            color={theme.colors.neutral.onSurface.disabled}
            viewBox="0 0 24 24"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      borderRadius: theme.borderRadius.b300,
      padding: theme.spacing.s300,
      marginBottom: theme.spacing.s300,
    },
    infoContainer: {
      flex: 1,
      marginLeft: theme.spacing.s300,
    },
    dateText: {
      marginTop: theme.spacing.s100,
      textTransform: "uppercase",
    },
    removeBtn: {
      padding: theme.spacing.s100,
      marginLeft: theme.spacing.s200,
    },
  });

export default MemberCard;
