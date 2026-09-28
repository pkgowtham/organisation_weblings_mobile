import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { SemiBoldText } from "../typography";

interface ShiftDetailsProps {
  shiftStart?: string;
  shiftEnd?: string;
  lunchTime?: string;
  effectiveHours?: string;
  workingDays?: string[];
  todayHours?: string;
  breakHours?: string;
  containerStyle?: ViewStyle;
}

const ShiftDetailsCard: React.FC<ShiftDetailsProps> = ({
  shiftStart = "9:30 AM",
  shiftEnd = "5:30 PM",
  lunchTime = "1 Hour",
  effectiveHours = "8 hours",
  workingDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  todayHours = "9:30 AM - 5:30 PM (8 HRS)",
  breakHours = "HH:MM",
  containerStyle
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, containerStyle]}>
      <SemiBoldText fontVariant="LS" style={styles.title}>
        Shift Details
      </SemiBoldText>

      {/* Row */}
      <View style={styles.row}>
        <ShiftDetail label="Shift Start" value={shiftStart} />
        <ShiftDetail label="Shift End" value={shiftEnd} />
        <ShiftDetail label="Lunch Time" value={lunchTime} />
        <ShiftDetail label="Eff. hours" value={effectiveHours} />
      </View>

      {/* Shift Name */}
      <View style={styles.section}>
        <SemiBoldText fontVariant="LS" style={styles.subTitle}>
          Shift Name
        </SemiBoldText>

        <View style={styles.dayContainer}>
          {["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].map((fullDay, index) => {
            const dayLabel = ["S", "M", "T", "W", "T", "F", "S"][index];
            const isWorking = workingDays.includes(fullDay);
            return (
              <View
                key={index}
                style={[
                  styles.dayCircle,
                  isWorking
                    ? {
                        backgroundColor: theme.colors.brand.surface.lighter,
                        borderColor: theme.colors.brand.border.medium,
                      }
                    : {
                        backgroundColor: theme.colors.neutral.surface.light,
                        borderColor: theme.colors.neutral.border.light,
                      },
                ]}
              >
                <SemiBoldText
                  fontVariant="BS"
                  color={
                    isWorking
                      ? "colors.brand.border.medium"
                      : "colors.neutral.onSurface.disabled"
                  }
                >
                  {dayLabel}
                </SemiBoldText>
              </View>
            );
          })}
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: theme.colors.brand.surface.medium }]}
            />
            <SemiBoldText fontVariant="LXS" color="colors.neutral.onSurface.dark">Working days</SemiBoldText>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: theme.colors.neutral.border.medium }]}
            />
            <SemiBoldText fontVariant="LXS" color="colors.neutral.onSurface.dark">Week Offs</SemiBoldText>
          </View>
        </View>
      </View>

      {/* Today */}
      <View style={styles.section}>
        <SemiBoldText fontVariant="LXS" color="colors.neutral.onSurface.light">
          Today{" "}
          <SemiBoldText color="colors.neutral.onSurface.light">
            {todayHours}
          </SemiBoldText>
        </SemiBoldText>
        <SemiBoldText fontVariant="LXS" style={{ marginTop: 4 }} color="colors.neutral.onSurface.dark">
          Break/Lunch Hours{" "}
          <SemiBoldText color="colors.neutral.onSurface.light">{breakHours}</SemiBoldText>
        </SemiBoldText>
      </View>
    </View>
  );
};

const ShiftDetail = ({ label, value }: { label: string; value: string }) => {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <SemiBoldText
        fontVariant="LS"
        color="colors.neutral.onSurface.disabled"
        style={{ marginBottom: 4 }}
      >
        {label}
      </SemiBoldText>
      <SemiBoldText fontVariant="LXS" color="colors.neutral.onSurface.light">
        {value}
      </SemiBoldText>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      borderRadius: theme.borderRadius.b400,
      padding: theme.spacing.s400,
    },
    title: {
      marginBottom: theme.spacing.s400,
      color: theme.colors.neutral.onSurface.light,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.s300,
    },
    section: {
      marginTop: theme.spacing.s400,
    },
    subTitle: {
      marginBottom: theme.spacing.s300,
      color: theme.colors.neutral.onSurface.light,
    },
    dayContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.s300,
    },
    dayCircle: {
      height: 36,
      width: 36,
      borderRadius: 18,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    legendContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.s600,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendDot: {
      height: 10,
      width: 10,
      borderRadius: 5,
    },
  });

export default ShiftDetailsCard;
