import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Typography } from "@/components/ui/typography";
import CustomButton from "@/components/ui/button";
import { Add } from "@/svg_icons";
import { useTheme } from "@/context/CustomThemeContext";
import { DomainIcon, GlobeIcon, ArrowLeftIcon, ArrowRightIcon } from "./OrgSetupIcons";

interface BusinessUnitListViewProps {
  businessUnitList: any[];
  isLoadingBUs: boolean;
  buPage: number;
  buTotalPages: number;
  onPageChange: (page: number) => void;
  onSelectUnit: (unit: any) => void;
  onCreateUnitPress: () => void;
  onCreateLocationForUnit: (unit: any) => void;
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

export const BusinessUnitListView: React.FC<BusinessUnitListViewProps> = ({
  businessUnitList,
  isLoadingBUs,
  buPage,
  buTotalPages,
  onPageChange,
  onSelectUnit,
  onCreateUnitPress,
  onCreateLocationForUnit,
  paddingBottom,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const hasBUs = Array.isArray(businessUnitList) && businessUnitList.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light">
          Setup Business units
        </Typography>
        {hasBUs && (
          <CustomButton
            title="Create Unit"
            variant="primary"
            size="xs"
            iconLeft={<Add width={16} height={16} viewBox="0 0 24 24" color={theme.colors.brand.onSurface.medium} />}
            onPress={onCreateUnitPress}
          />
        )}
      </View>

      {/* Loading State */}
      {isLoadingBUs && !hasBUs && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={{ marginTop: 12 }}>
            Loading...
          </Typography>
        </View>
      )}

      {/* Empty State */}
      {!isLoadingBUs && !hasBUs && (
        <View style={styles.emptyCard}>
          <DomainIcon width={48} height={48} color={theme.colors.brand.surface.medium} />
          <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={{ marginTop: 12, marginBottom: 4 }}>
            No Business Units yet
          </Typography>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={{ textAlign: "center", marginBottom: 16 }}>
            Create your first Business Unit to get started
          </Typography>
          <CustomButton
            title="Create Business Unit"
            variant="primary"
            size="small"
            onPress={onCreateUnitPress}
          />
        </View>
      )}

      {/* BU Card List */}
      {hasBUs &&
        businessUnitList.map((bu: any) => (
          <TouchableOpacity
            key={bu.id}
            activeOpacity={0.8}
            onPress={() => onSelectUnit(bu)}
            style={styles.unitCard}
          >
            <View style={styles.unitCardHeader}>
              <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.light" style={styles.unitName}>
                {bu.name}
              </Typography>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onCreateLocationForUnit(bu);
                }}
              >
                <CustomButton
                  title="Create location"
                  variant="primary"
                  size="xs"
                  onPress={() => onCreateLocationForUnit(bu)}
                />
              </TouchableOpacity>
            </View>

            <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.unitDesc}>
              {bu.description || "No description provided."}
            </Typography>

            <View style={styles.unitCardFooter}>
              <View style={styles.subdomainRow}>
                <GlobeIcon width={16} height={16} color={theme.colors.brand.onSurface.light} />
                <Typography fontVariant="BXS" color="colors.brand.onSurface.light" style={{ marginLeft: 6 }}>
                  {bu.subDomain || bu.subdomain || "-"}
                </Typography>
              </View>
              <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                {formatDate(bu.createdAt || bu.dateCreated)}
              </Typography>
            </View>
          </TouchableOpacity>
        ))}

      {/* Pagination Bar */}
      {hasBUs && buTotalPages > 1 && (
        <View style={styles.paginationCon}>
          <TouchableOpacity
            disabled={buPage === 0}
            onPress={() => buPage > 0 && onPageChange(buPage - 1)}
            style={[styles.pageBtn, buPage === 0 && styles.pageBtnDisabled]}
          >
            <ArrowLeftIcon width={16} height={16} color={theme.colors.neutral.onSurface.dark} />
          </TouchableOpacity>
          {Array.from({ length: buTotalPages }, (_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onPageChange(i)}
              style={[styles.pageBtn, i === buPage && styles.pageBtnActive]}
            >
              <Typography
                fontVariant="BS"
                variant={i === buPage ? "bold" : "regular"}
                color={i === buPage ? "colors.neutral.onSurface.light" : "colors.neutral.onSurface.dark"}
              >
                {i + 1}
              </Typography>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            disabled={buPage >= buTotalPages - 1}
            onPress={() => buPage < buTotalPages - 1 && onPageChange(buPage + 1)}
            style={[styles.pageBtn, buPage >= buTotalPages - 1 && styles.pageBtnDisabled]}
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
    centerContainer: {
      paddingVertical: 40,
      alignItems: "center",
    },
    unitCard: {
      backgroundColor: "#EFF4FF",
      borderColor: theme.colors.brand.border.light,
      borderWidth: 1,
      borderRadius: theme.borderRadius?.b300 || 12,
      padding: theme.spacing.s400,
      marginBottom: theme.spacing.s400,
    },
    unitCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.s200,
      gap: theme.spacing.s200,
    },
    unitName: {
      flex: 1,
    },
    unitDesc: {
      marginBottom: theme.spacing.s300,
      lineHeight: 20,
    },
    unitCardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    subdomainRow: {
      flexDirection: "row",
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
