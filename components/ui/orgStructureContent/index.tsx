import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import CustomButton from "../button";
import ScrollTabs from "../scrollTabs";
import Input from "../textInput";
import { Search, Add, Document } from "@/svg_icons";

const TABS = ["Entity", "Business unit", "Locations", "Department"];

export default function OrgStructureContent({ data }: { data?: any[] }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Entity");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateEntity = () => {
    router.push("/(protected)/(eOffice)/createEntity");
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Document width={80} height={80} color={theme.colors.brand.surface.medium} />
      </View>
      <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.emptyText}>
        No Entities record has been here, Add new?
      </Typography>
      <CustomButton
        variant="primary"
        title="Create Entity"
        iconLeft={<Add width={16} height={16} color={theme.colors.neutral.surface.lighter} />}
        onPress={handleCreateEntity}
        size="small"
      />
    </View>
  );

  const renderList = () => {
    if (!data || data.length === 0) return renderEmptyState();
    
    return (
      <View style={{ padding: 16 }}>
        {Array.isArray(data) && data.map((item, idx) => (
          <View key={idx} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.neutral.border.light }}>
            <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light">
              {item.name || item.departmentName || `Department ${idx + 1}`}
            </Typography>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sub Tabs */}
      <View style={styles.tabWrapper}>
        <ScrollTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          containerStyle={styles.scrollTabsContainer}
        />
      </View>

      {/* Main Content Area */}
      <View style={styles.contentArea}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Typography fontVariant="TM" variant="semibold" color="colors.neutral.onSurface.light">
              Entities
            </Typography>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.dark">
              Easily create and manage your legal entities
            </Typography>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.searchWrapper}>
              <Input
                placeholder="Search for Entities"
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon={<Search width={16} height={16} color={theme.colors.neutral.onSurface.dark} />}
                containerStyle={styles.searchContainer}
                style={{ paddingVertical: theme.spacing.s100 }}
              />
            </View>
            <CustomButton
              variant="outlineActive"
              title="Create Entity"
              iconLeft={<Add width={16} height={16} color={theme.colors.brand.surface.medium} />}
              size="post"
              onPress={handleCreateEntity}
              buttonStyle={styles.addBtn}
            />
          </View>
        </View>

        {renderList()}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    tabWrapper: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      marginBottom: theme.spacing.s400,
    },
    scrollTabsContainer: {
      paddingHorizontal: 0,
    },
    contentArea: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b200,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      overflow: "hidden",
    },
    headerRow: {
      padding: theme.spacing.s400,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      gap: theme.spacing.s300,
    },
    headerLeft: {
      gap: theme.spacing.s100,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.s300,
      marginTop: theme.spacing.s300,
    },
    searchWrapper: {
      flex: 1,
    },
    searchContainer: {
      marginBottom: 0,
    },
    addBtn: {
      flexShrink: 0,
    },
    // ── Empty State ─────────────────────────────────────────
    emptyContainer: {
      paddingVertical: theme.spacing.s1200,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyIconWrapper: {
      marginBottom: theme.spacing.s400,
    },
    emptyText: {
      marginBottom: theme.spacing.s400,
    },
  });
