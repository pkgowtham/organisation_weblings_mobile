import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Edit, Delete } from "@/svg_icons";
import Svg, { Circle } from "react-native-svg";

// 6-dot drag handle icon
const DragHandleIcon = ({
  color = "#8D8D8D",
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="6" r="1.5" fill={color} />
    <Circle cx="15" cy="6" r="1.5" fill={color} />
    <Circle cx="9" cy="12" r="1.5" fill={color} />
    <Circle cx="15" cy="12" r="1.5" fill={color} />
    <Circle cx="9" cy="18" r="1.5" fill={color} />
    <Circle cx="15" cy="18" r="1.5" fill={color} />
  </Svg>
);

export interface SettingsItemCardProps {
  /** The main content to render (e.g. Tag, flag+text, etc.) */
  children: React.ReactNode;
  /** Show the drag handle dots on the left */
  showDragHandle?: boolean;
  /** Called when edit icon is tapped */
  onEdit?: () => void;
  /** Called when delete icon is tapped */
  onDelete?: () => void;
  /** Extra styles for the outer card */
  containerStyle?: any;
  /** Gesture handler props for drag & drop */
  dragHandlers?: any;
}

const SettingsItemCard: React.FC<SettingsItemCardProps> = ({
  children,
  showDragHandle = false,
  onEdit,
  onDelete,
  dragHandlers,
  containerStyle,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Drag handle */}
      {showDragHandle && (
        <View style={styles.dragHandle} {...dragHandlers}>
          <DragHandleIcon
            color={theme.colors.neutral.onSurface.disabled}
            size={20}
          />
        </View>
      )}

      {/* Main content area */}
      <View style={styles.content}>{children}</View>

      {/* Action icons */}
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={onEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionBtn}
          >
            <Edit
              width={20}
              height={20}
              color={theme.colors.brand.surface.medium}
              viewBox="0 0 24 24"
            />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionBtn}
          >
            <Delete
              width={20}
              height={20}
              color={theme.colors.negative.onSurface.light}
              viewBox="0 0 24 24"
            />
          </TouchableOpacity>
        )}
      </View>
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
      paddingVertical: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s400,
      marginBottom: theme.spacing.s300,
    },
    dragHandle: {
      marginRight: theme.spacing.s300,
    },
    content: {
      flex: 1,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.s400,
      marginLeft: theme.spacing.s300,
    },
    actionBtn: {
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default SettingsItemCard;
