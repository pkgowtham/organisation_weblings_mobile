import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import { MoreVert, Star, StarOutlined } from "@/svg_icons";
import Avatar from "../avatar";

export interface ProjectCardProps {
  /** The title of the project (e.g. "eCommers") */
  title: string;
  /** The subtitle or key of the project (e.g. "Project Key: Ecom") */
  subtitle: string;
  /** Callback when the card is pressed */
  onPress?: () => void;
  /** Callback when the favorite star is pressed */
  onMorePress?: (event?: any) => void;
  /** Extra container style overrides */
  containerStyle?: any;
  /** Image URL for the project */
  imageUrl: string;
}

export default function ProjectCard({
  title,
  subtitle,
  onPress,
  onMorePress,
  containerStyle,
  imageUrl,
}: ProjectCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        {
          borderColor: theme.colors.neutral.border.light,
          backgroundColor: theme.colors.neutral.surface.lighter,
          borderRadius: theme.borderRadius.b300, // 12px
        },
        containerStyle,
      ]}
    >
      <Avatar 
        source={{ uri: imageUrl }}
        name={title}
        size="md"
        variant="rounded"
        style={{ marginRight: 16 }}
      />

      {/* Text Info Stack */}
      <View style={styles.textContainer}>
        <Typography
          fontVariant="BM"
          variant="bold"
          color="colors.neutral.onSurface.light"
          style={styles.title}
        >
          {title}
        </Typography>
        <Typography
          fontVariant="BXS"
          color="colors.neutral.onSurface.dark"
          style={styles.subtitle}
        >
          {subtitle}
        </Typography>
      </View>

      {/* Favorite Star Button */}
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={onMorePress}
        style={styles.starButton}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MoreVert
          width={22}
          height={22}
          color={theme.colors.brand.surface.medium}
          viewBox="0 0 24 24"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: "100%",
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    lineHeight: 22,
    marginBottom: 2,
  },
  subtitle: {
    lineHeight: 16,
  },
  starButton: {
    justifyContent: "center",
    alignItems: "center",
  },
});
