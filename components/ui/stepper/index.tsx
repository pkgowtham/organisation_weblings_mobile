import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";

// ──────────────────────────────────────────────────────────────
//  Stepper — horizontal multi-step indicator
//
//  Displays numbered step circles with labels.
//  Active/completed steps use brand.surface.medium fill.
//  Upcoming steps have a neutral border outline.
//  A connecting line runs between each step.
// ──────────────────────────────────────────────────────────────

export interface StepperStep {
  label: string;
}

export interface StepperProps {
  steps: StepperStep[];
  /** 0-indexed current step */
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {steps.map((step, index) => {
        const isActiveOrDone = index <= currentStep;
        return (
          <React.Fragment key={index}>
            <View style={styles.stepItem}>
              {/* Circle */}
              <View
                style={[
                  styles.circle,
                  isActiveOrDone
                    ? { backgroundColor: theme.colors.brand.surface.dark }
                    : {
                      backgroundColor: theme.colors.neutral.surface.lighter,
                      borderWidth: 1.5,
                      borderColor: theme.colors.brand.border.medium,
                    },
                ]}
              >
                <Typography
                  fontVariant="BXS"
                  variant="semibold"
                  color={
                    isActiveOrDone
                      ? theme.colors.neutral.surface.lighter
                      : theme.colors.brand.border.medium
                  }
                >
                  {index + 1}
                </Typography>
              </View>
              {/* Label */}
              <Typography
                fontVariant="BS"
                variant={isActiveOrDone ? "semibold" : "regular"}
                color={
                  isActiveOrDone
                    ? theme.colors.neutral.onSurface.light
                    : theme.colors.neutral.onSurface.dark
                }
                style={styles.label}
              >
                {step.label}
              </Typography>
            </View>

            {/* Connector line between steps */}
            {/* {index < steps.length - 1 && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor:
                      index < currentStep
                        ? theme.colors.brand.surface.medium
                        : theme.colors.neutral.border.light,
                  },
                ]}
              />
            )} */}
          </React.Fragment>
        );
      })}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.s400,
      paddingHorizontal: theme.spacing.s600,
    },
    stepItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.s200,
    },
    circle: {
      width: 28,
      height: 28,
      borderRadius: theme.borderRadius.b2500,
      justifyContent: "center",
      alignItems: "center",
    },
    label: {
      marginRight: theme.spacing.s200,
    },
    connector: {
      height: 1.5,
      width: 32,
      marginHorizontal: theme.spacing.s100,
    },
  });

export default Stepper;
