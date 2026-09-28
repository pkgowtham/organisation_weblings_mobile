import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Typography } from "../typography";
import { DragHandleIcon } from "./icons";
import { BaseTask } from "./types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_WIDTH = SCREEN_WIDTH * 0.86;

export default function DragOverlayCard({
  tasks,
  themeColors,
}: {
  tasks: BaseTask[];
  themeColors: any;
}) {
  const mainTask = tasks[0];
  if (!mainTask) return null;

  const typeConfig = {
    story: { bg: "#2e7d32", char: "S" },
    task: { bg: "#1565c0", char: "T" },
    bug: { bg: "#c62828", char: "B" },
  }[mainTask.type];

  return (
    <View style={overlayStyles.card}>
      <View style={overlayStyles.handleArea}>
        <DragHandleIcon size={14} color="#bbb" />
      </View>
      <View style={overlayStyles.content}>
        <View style={overlayStyles.topLine}>
          <View
            style={[overlayStyles.typeIcon, { backgroundColor: typeConfig?.bg || "#1565c0" }]}
          >
            <Typography
              fontVariant="LXS"
              variant="bold"
              color="#ffffff"
              style={{ fontSize: 9, lineHeight: 10 }}
            >
              {typeConfig?.char || "T"}
            </Typography>
          </View>
          <Typography
            fontVariant="BXS"
            variant="semibold"
            color="colors.neutral.onSurface.dark"
          >
            {mainTask.key}
          </Typography>
        </View>
        <Typography
          fontVariant="BS"
          variant="semibold"
          color="colors.neutral.onSurface.light"
          numberOfLines={1}
        >
          {mainTask.title}
        </Typography>
      </View>
      {tasks.length > 1 && (
        <View
          style={[
            overlayStyles.countBadge,
            { backgroundColor: themeColors.brand.surface.medium },
          ]}
        >
          <Typography fontVariant="LXS" variant="bold" color="#ffffff">
            +{tasks.length - 1}
          </Typography>
        </View>
      )}
    </View>
  );
}

const overlayStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    overflow: "hidden",
    width: COLUMN_WIDTH - 20,
  },
  handleArea: {
    width: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  content: { flex: 1, padding: 10, gap: 4 },
  topLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  typeIcon: {
    width: 16,
    height: 16,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  countBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
});
