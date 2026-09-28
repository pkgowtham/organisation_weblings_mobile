import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Typography } from "../typography";
import { CloseIcon } from "./icons";

export default function SelectionActionBar({
  selectedCount,
  onClearSelection,
  themeColors,
  subtitle = "Use drag handle to move",
}: {
  selectedCount: number;
  onClearSelection: () => void;
  themeColors: any;
  subtitle?: string;
}) {
  return (
    <View
      style={[
        styles.selectionBar,
        { backgroundColor: themeColors.brand.surface.medium },
      ]}
    >
      <View style={styles.selectionBarLeft}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClearSelection}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <CloseIcon size={18} color="#ffffff" />
        </TouchableOpacity>
        <Typography
          fontVariant="BS"
          variant="semibold"
          color="#ffffff"
          style={styles.selectionCount}
        >
          {selectedCount} selected
        </Typography>
      </View>
      <Typography fontVariant="BXS" color="colors.neutral.onSurface.medium">
        {subtitle}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  selectionBar: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 900,
  },
  selectionBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectionCount: {
    letterSpacing: 0.3,
  },
});
