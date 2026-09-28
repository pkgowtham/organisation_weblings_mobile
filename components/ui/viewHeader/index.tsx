import React from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import { ArrowBackIos, MoreVert } from "@/svg_icons";
import Divider from "../divider";
import CustomButton from "../button";

export type TimelineMode = "weeks" | "months" | "quarter";

export interface ViewHeaderProps {
  /** Title of the project (e.g. "eCommers") */
  title: string;
  /** Active tab name */
  activeTab: string;
  /** Callback when tab is changed */
  onTabChange: (tab: string) => void;
  /** Show mode selector */
  modeSelector?: boolean;
  /** Currently active timeline mode */
  activeMode: TimelineMode;
  /** Callback when mode is changed */
  onModeChange: (mode: TimelineMode) => void;
  /** Callback when back button is pressed */
  onBackPress?: () => void;
  /** Callback when more button is pressed */
  onCreateClick?: () => void;
  /** Optional custom tabs to render */
  tabs?: string[];
}

const DEFAULT_TABS = ["Timeline", "Backlog", "Sprint", "Board", "Members", "Settings"];
const MODES: { label: string; value: TimelineMode }[] = [
  { label: "Weeks", value: "weeks" },
  { label: "Months", value: "months" },
  { label: "Quarter", value: "quarter" },
];

export default function ViewHeader({
  title,
  activeTab,
  onTabChange,
  tabs = DEFAULT_TABS,
  modeSelector = true,
  activeMode,
  onModeChange,
  onBackPress,
  onCreateClick,
}: ViewHeaderProps) {
  const { theme } = useTheme();

  // Custom funnel filter icon matching screenshot
  const renderFilterIcon = (color: string) => (
    <View style={styles.filterIcon}>
      <View
        style={[styles.filterLine, { width: 16, backgroundColor: color }]}
      />
      <View
        style={[styles.filterLine, { width: 11, backgroundColor: color }]}
      />
      <View style={[styles.filterLine, { width: 6, backgroundColor: color }]} />
    </View>
  );

  return (
    <View style={[styles.container]}>
      {/* ── Title Bar ────────────────────────────────── */}
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={onBackPress}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowBackIos
              width={18}
              height={18}
              color={theme.colors.neutral.onSurface.light}
              viewBox="0 0 24 24"
            />
          </TouchableOpacity>
          <Typography
            fontVariant="TM"
            variant="semibold"
            color="colors.neutral.onSurface.light"
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </Typography>
        </View>

        <View style={styles.rightGroup}>
          {activeTab === "Timeline" ? (
            <CustomButton
              title="Create"
              variant="primary"
              onPress={onCreateClick}
              size="xs"
            />
          ) : (
            <View style={{ height: 32 }} />
          )}
        </View>
      </View>

      {/* ── Horizontal Navigation Tabs ────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              onPress={() => onTabChange(tab)}
              style={[
                styles.tabItem,
                isActive && {
                  borderBottomColor: theme.colors.brand.surface.medium,
                },
              ]}
            >
              <Typography
                fontVariant="LS"
                variant={"semibold"}
                style={{
                  color: isActive
                    ? theme.colors.brand.surface.medium
                    : theme.colors.neutral.onSurface.disabled,
                }}
              >
                {tab}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Divider style={{}} />

      {/* ── Segmented Mode Selector ───────────────────── */}
      {modeSelector && (
        <View
          style={[
            styles.modeRow,
            { backgroundColor: theme.colors.neutral.surface.light },
          ]}
        >
          {MODES.map((m) => {
            const isActive = m.value === activeMode;
            return (
              <TouchableOpacity
                key={m.value}
                activeOpacity={0.8}
                onPress={() => onModeChange(m.value)}
                style={[
                  styles.modeBtn,
                  isActive && {
                    backgroundColor: theme.colors.neutral.surface.lighter,
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 1.5 },
                    shadowOpacity: 0.08,
                    shadowRadius: 3,
                    elevation: 2,
                  },
                ]}
              >
                <Typography
                  fontVariant="LS"
                  variant={"semibold"}
                  style={{
                    color: isActive
                      ? theme.colors.brand.surface.medium
                      : theme.colors.neutral.onSurface.dark,
                  }}
                >
                  {m.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 8,
  },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 16,
  },
  backBtn: {
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    flex: 1,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  filterLine: {
    height: 2,
    marginBottom: 3,
    borderRadius: 1,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  tabItem: {
    paddingVertical: 6,
    marginBottom: 2,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  modeRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 8,
    padding: 2,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
});
