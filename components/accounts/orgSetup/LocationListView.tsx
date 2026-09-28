import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Typography } from "@/components/ui/typography";
import CustomButton from "@/components/ui/button";
import { Add, ArrowBackIos, Close } from "@/svg_icons";
import { useTheme } from "@/context/CustomThemeContext";
import { ArrowLeftIcon, ArrowRightIcon } from "./OrgSetupIcons";

interface LocationListViewProps {
  businessUnitName: string;
  locationList: any[];
  isLoadingLocs: boolean;
  locPage: number;
  locTotalPages: number;
  onPageChange: (page: number) => void;
  onCreateLocationPress: () => void;
  onResetPasswordPress: (loc: any) => void;
  onBack: () => void;
  paddingBottom: number;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const LocationListView: React.FC<LocationListViewProps> = ({
  businessUnitName,
  locationList,
  isLoadingLocs,
  locPage,
  locTotalPages,
  onPageChange,
  onCreateLocationPress,
  onResetPasswordPress,
  onBack,
  paddingBottom,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const hasLocations = Array.isArray(locationList) && locationList.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowBackIos width={18} height={18} viewBox="0 0 24 24" color={theme.colors.neutral.onSurface.light} />
        </TouchableOpacity>
        <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light" style={{ flex: 1 }}>
          {businessUnitName}
        </Typography>
        <CustomButton
          title="Create Location"
          variant="primary"
          size="xs"
          iconLeft={<Add width={16} height={16} viewBox="0 0 24 24" color={theme.colors.brand.onSurface.medium} />}
          onPress={onCreateLocationPress}
        />
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Close width={20} height={20} color={theme.colors.neutral.onSurface.light} />
        </TouchableOpacity>
      </View>

      <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.light" style={{ marginBottom: 12 }}>
        Locations
      </Typography>

      {/* Loading State */}
      {isLoadingLocs && !hasLocations && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={{ marginTop: 12 }}>
            Loading...
          </Typography>
        </View>
      )}

      {/* Empty State */}
      {!isLoadingLocs && !hasLocations && (
        <View style={styles.emptyCard}>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark">
            No locations yet. Click "Create Location" to add one.
          </Typography>
        </View>
      )}

      {/* Location Cards */}
      {hasLocations &&
        locationList.map((loc: any) => (
          <View key={loc.id} style={styles.locationCard}>
            <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.light" style={styles.unitName}>
              {loc.name}
            </Typography>

            <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.unitDesc}>
              {loc.description || "No description provided."}
            </Typography>

            <View style={styles.locationCardFooter}>
              <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                {formatDate(loc.createdAt || loc.dateCreated)}
              </Typography>
              <TouchableOpacity onPress={() => onResetPasswordPress(loc)}>
                <Typography fontVariant="BXS" variant="medium" color="colors.brand.onSurface.light">
                  Reset Password
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      {/* Pagination Bar */}
      {hasLocations && locTotalPages > 1 && (
        <View style={styles.paginationCon}>
          <TouchableOpacity
            disabled={locPage === 0}
            onPress={() => locPage > 0 && onPageChange(locPage - 1)}
            style={[styles.pageBtn, locPage === 0 && styles.pageBtnDisabled]}
          >
            <ArrowLeftIcon width={16} height={16} color={theme.colors.neutral.onSurface.dark} />
          </TouchableOpacity>
          {Array.from({ length: locTotalPages }, (_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onPageChange(i)}
              style={[styles.pageBtn, i === locPage && styles.pageBtnActive]}
            >
              <Typography
                fontVariant="BS"
                variant={i === locPage ? "bold" : "regular"}
                color={i === locPage ? "colors.neutral.onSurface.light" : "colors.neutral.onSurface.dark"}
              >
                {i + 1}
              </Typography>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            disabled={locPage >= locTotalPages - 1}
            onPress={() => locPage < locTotalPages - 1 && onPageChange(locPage + 1)}
            style={[styles.pageBtn, locPage >= locTotalPages - 1 && styles.pageBtnDisabled]}
          >
            <ArrowRightIcon width={16} height={16} color={theme.colors.neutral.onSurface.dark} />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.light,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.s400,
      paddingTop: theme.spacing.s300,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.s400,
      gap: theme.spacing.s200,
    },
    backBtn: {
      padding: theme.spacing.s100,
    },
    centerContainer: {
      paddingVertical: 40,
      alignItems: "center",
    },
    locationCard: {
      backgroundColor: "#F7F3FF",
      borderColor: theme.colors.info.border.light,
      borderWidth: 1,
      borderRadius: theme.borderRadius?.b300 || 12,
      padding: theme.spacing.s400,
      marginBottom: theme.spacing.s400,
    },
    unitName: {
      flex: 1,
    },
    unitDesc: {
      marginBottom: theme.spacing.s300,
      lineHeight: 20,
    },
    locationCardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    emptyCard: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderColor: theme.colors.neutral.border.light,
      borderWidth: 1,
      borderRadius: theme.borderRadius?.b300 || 12,
      padding: theme.spacing.s600,
      alignItems: "center",
      marginVertical: theme.spacing.s300,
    },
    paginationCon: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.s200,
      marginVertical: theme.spacing.s400,
    },
    pageBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.borderRadius?.b100 || 4,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    pageBtnActive: {
      backgroundColor: theme.colors.brand.surface.lighter,
      borderColor: theme.colors.brand.border.medium,
    },
    pageBtnDisabled: {
      opacity: 0.4,
    },
  });
