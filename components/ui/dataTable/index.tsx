import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import { Eye, Edit, Delete, ArrowBackIos, ArrowForwardIos } from "@/svg_icons";
import Dropdown from "../dropdown";

// ──────────────────────────────────────────────────────────────
//  DataTable — displays tabular data with actions and pagination
//
//  Features:
//    • Column definitions with label + flex width
//    • Row data rendered with alternating row highlights
//    • Action icons per row (view, edit, delete) — optional
//    • Pagination controls (Rows per page + page buttons)
//    • All tokens from app theme via useTheme()
// ──────────────────────────────────────────────────────────────

export interface DataTableColumn {
  key: string;
  label: string;
  flex?: number;
  width?: number;
  renderCell?: (row: DataTableRow) => React.ReactNode;
}

export interface DataTableRow {
  id: string;
  [key: string]: any;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: DataTableRow[];
  /** Show view icon per row. Default true. */
  showView?: boolean;
  /** Show edit icon per row. Default true. */
  showEdit?: boolean;
  /** Show delete icon per row. Default true. */
  showDelete?: boolean;
  onView?: (row: DataTableRow) => void;
  onEdit?: (row: DataTableRow) => void;
  onDelete?: (row: DataTableRow) => void;
  /** Total records for pagination display */
  totalRecords?: number;
}

const ROWS_PER_PAGE_OPTIONS = [
  { value: "5", label: "5" },
  { value: "10", label: "10" },
  { value: "20", label: "20" },
];

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  showView = true,
  showEdit = true,
  showDelete = true,
  onView,
  onEdit,
  onDelete,
  totalRecords,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [rowsPerPage, setRowsPerPage] = useState("5");
  const [currentPage, setCurrentPage] = useState(1);

  const perPage = parseInt(rowsPerPage, 10);
  const totalPages = Math.ceil((totalRecords || data.length) / perPage);
  const paginatedData = data.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const hasActions = showView || showEdit || showDelete;

  // Build page number buttons
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 4) pages.push("...");
      const middle = Math.max(4, Math.min(currentPage, totalPages - 3));
      if (middle > 3 && middle < totalPages - 2) pages.push(middle);
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1, totalPages);
    }
    // Deduplicate
    return [...new Set(pages)];
  };

  const getCellWidthStyle = (col: DataTableColumn) => {
    if (col.width) return { width: col.width };
    const flex = col.flex || 1;
    return { width: flex * 120 }; // 120px base width per flex unit
  };

  return (
    <View style={styles.container}>
      {/* Scrollable table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header row */}
          <View style={styles.headerRow}>
            {columns.map((col) => (
              <View key={col.key} style={[styles.cell, getCellWidthStyle(col)]}>
                <Typography
                  fontVariant="BXS"
                  variant="semibold"
                  color="colors.neutral.onSurface.dark"
                >
                  {col.label}
                </Typography>
              </View>
            ))}
            {hasActions && (
              <View style={[styles.cell, styles.actionsHeaderCell]}>
                <Typography
                  fontVariant="BXS"
                  variant="semibold"
                  color="colors.neutral.onSurface.dark"
                >
                  Actions
                </Typography>
              </View>
            )}
          </View>

          {/* Data rows */}
          {paginatedData.map((row, rowIndex) => (
            <View
              key={row.id}
              style={[
                styles.dataRow,
                rowIndex % 2 === 0
                  ? { backgroundColor: theme.colors.neutral.surface.lighter }
                  : { backgroundColor: theme.colors.neutral.surface.light },
              ]}
            >
              {columns.map((col) => (
                <View key={col.key} style={[styles.cell, getCellWidthStyle(col)]}>
                  {col.renderCell ? (
                    col.renderCell(row)
                  ) : (
                    <Typography
                      fontVariant="BS"
                      color="colors.neutral.onSurface.medium"
                      numberOfLines={1}
                    >
                      {typeof row[col.key] === "object" && row[col.key] !== null
                        ? row[col.key]?.name ||
                          row[col.key]?.label ||
                          row[col.key]?.displayName ||
                          row[col.key]?.title ||
                          "—"
                        : (row[col.key] ?? "—")}
                    </Typography>
                  )}
                </View>
              ))}
              {hasActions && (
                <View style={[styles.cell, styles.actionsCell]}>
                  {showView && (
                    <TouchableOpacity
                      onPress={() => onView?.(row)}
                      style={styles.actionBtn}
                      activeOpacity={0.6}
                    >
                      <Eye
                        width={18}
                        height={18}
                        color={theme.colors.neutral.onSurface.dark}
                      />
                    </TouchableOpacity>
                  )}
                  {showEdit && (
                    <TouchableOpacity
                      onPress={() => onEdit?.(row)}
                      style={styles.actionBtn}
                      activeOpacity={0.6}
                    >
                      <Edit
                        width={18}
                        height={18}
                        color={theme.colors.neutral.onSurface.dark}
                      />
                    </TouchableOpacity>
                  )}
                  {showDelete && (
                    <TouchableOpacity
                      onPress={() => onDelete?.(row)}
                      style={styles.actionBtn}
                      activeOpacity={0.6}
                    >
                      <Delete
                        width={18}
                        height={18}
                        color={theme.colors.neutral.onSurface.dark}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Pagination footer */}
      <View style={styles.paginationRow}>
        {/* Rows per page */}
        <View style={styles.rowsPerPageSection}>
          <Typography
            fontVariant="BXS"
            color="colors.neutral.onSurface.dark"
            style={styles.rowsLabel}
          >
            Rows per page
          </Typography>
          <Dropdown
            placeholder="5"
            options={ROWS_PER_PAGE_OPTIONS}
            selectedValue={rowsPerPage}
            onValueChange={(val) => {
              setRowsPerPage(val);
              setCurrentPage(1);
            }}
            containerStyle={{ width: 70, marginBottom: 0 }}
            inputStyle={{
              height: 28,
              paddingHorizontal: theme.spacing.s200,
              backgroundColor: theme.colors.neutral.surface.lighter,
            }}
            hideClearIcon={true}
          />
        </View>

        {/* Page numbers */}
        <View style={styles.pageNumbersRow}>
          {/* First page */}
          <TouchableOpacity
            onPress={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={styles.navBtn}
            activeOpacity={0.6}
          >
            <Typography
              fontVariant="BXS"
              color={
                currentPage === 1
                  ? theme.colors.neutral.onSurface.disabled
                  : theme.colors.neutral.onSurface.dark
              }
            >
              {"⟨⟨"}
            </Typography>
          </TouchableOpacity>

          {/* Previous */}
          <TouchableOpacity
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={styles.navBtn}
            activeOpacity={0.6}
          >
            <ArrowBackIos
              width={12}
              height={12}
              color={
                currentPage === 1
                  ? theme.colors.neutral.onSurface.disabled
                  : theme.colors.neutral.onSurface.dark
              }
            />
          </TouchableOpacity>

          {/* Page buttons */}
          {getPageNumbers().map((page, i) =>
            typeof page === "string" ? (
              <Typography
                key={`ellipsis-${i}`}
                fontVariant="BXS"
                color="colors.neutral.onSurface.dark"
                style={styles.ellipsis}
              >
                {page}
              </Typography>
            ) : (
              <TouchableOpacity
                key={page}
                onPress={() => setCurrentPage(page)}
                style={[
                  styles.pageBtn,
                  currentPage === page && {
                    backgroundColor: theme.colors.brand.surface.medium,
                    borderColor: theme.colors.brand.surface.medium,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Typography
                  fontVariant="BXS"
                  variant="semibold"
                  color={
                    currentPage === page
                      ? theme.colors.neutral.surface.lighter
                      : theme.colors.neutral.onSurface.dark
                  }
                >
                  {page}
                </Typography>
              </TouchableOpacity>
            )
          )}

          {/* Next */}
          <TouchableOpacity
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={styles.navBtn}
            activeOpacity={0.6}
          >
            <ArrowForwardIos
              width={12}
              height={12}
              color={
                currentPage === totalPages
                  ? theme.colors.neutral.onSurface.disabled
                  : theme.colors.neutral.onSurface.dark
              }
            />
          </TouchableOpacity>

          {/* Last page */}
          <TouchableOpacity
            onPress={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={styles.navBtn}
            activeOpacity={0.6}
          >
            <Typography
              fontVariant="BXS"
              color={
                currentPage === totalPages
                  ? theme.colors.neutral.onSurface.disabled
                  : theme.colors.neutral.onSurface.dark
              }
            >
              {"⟩⟩"}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      paddingVertical: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s400,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    dataRow: {
      flexDirection: "row",
      paddingVertical: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s400,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    cell: {
      paddingRight: theme.spacing.s300,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    actionsHeaderCell: {
      width: 110,
      alignItems: "center",
      justifyContent: "center",
      paddingRight: theme.spacing.s300,
    },
    actionsCell: {
      width: 110,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingRight: theme.spacing.s300,
    },
    actionBtn: {
      padding: theme.spacing.s100,
      marginHorizontal: 2,
    },
    // ── Pagination ──────────────────────────────────────────
    paginationRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s400,
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral.border.light,
    },
    rowsPerPageSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.s200,
    },
    rowsLabel: {
      marginRight: theme.spacing.s100,
    },
    pageNumbersRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.s100,
    },
    navBtn: {
      padding: theme.spacing.s100,
      justifyContent: "center",
      alignItems: "center",
    },
    pageBtn: {
      width: 28,
      height: 28,
      borderRadius: theme.borderRadius.b150,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
    },
    ellipsis: {
      paddingHorizontal: theme.spacing.s100,
    },
  });

export default DataTable;
