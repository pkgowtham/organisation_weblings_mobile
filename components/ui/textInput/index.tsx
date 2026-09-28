// Input.tsx
import React, { forwardRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";

// ──────────────────────────────────────────────────────────────
//  Input
//
//  5 states (hover dropped — mobile only):
//    default · active (focused) · error · disabled · read-only
//
//  2 variants:
//    default    — full border box, borderRadius 8, bg surface.lighter
//    underlined — bottom border only, no radius, transparent bg
//
//  All colour tokens come from the app theme.
//  All existing props are preserved — no breaking changes.
// ──────────────────────────────────────────────────────────────

export type InputVariant = "default" | "underlined";

export interface InputProps extends TextInputProps {
  /** Visual variant — 'default' (bordered box) or 'underlined' (bottom line) */
  variant?: InputVariant;
  helperText?: string;
  error?: boolean | string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  leftText?: string;
  rightText?: string;
  label?: string;
  readOnly?: boolean;
  rightTextColor?: string;
  onRemove?: () => void;
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
  leftTextClick?: () => void;
  rightClick?: () => void;
  optional?: boolean;
  containerStyle?: any;
  /** Forcing active/focused border color externally */
  isActive?: boolean;
  /** Style override for the inner inputWrapper View */
  wrapperStyle?: any;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      variant = "default",
      helperText,
      error = false,
      leftIcon,
      rightIcon,
      disabled,
      placeholder,
      label,
      readOnly,
      rightTextColor,
      leftText,
      rightText,
      containerStyle,
      leftTextClick,
      rightClick,
      onLeftIconClick,
      onRightIconClick,
      optional = false,
      style,
      isActive = false,
      wrapperStyle,
      ...props
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [focused, setFocused] = useState(false);

    // ── Border / accent colour ───────────────────────────────
    // Priority: disabled > error > focused/active > readOnly > default
    const accentColor = (() => {
      if (disabled) return theme.colors.neutral.border.disabled; // #e0e0e0
      if (error) return theme.colors.negative.border.medium; // #fe4856
      if (focused || isActive) return theme.colors.brand.border.medium; // #008FF5
      if (readOnly) return theme.colors.neutral.border.light; // #e0e0e0
      return theme.colors.neutral.border.light; // #e0e0e0
    })();

    const bgColor = disabled
      ? theme.colors.neutral.surface.disabled // #f5f5f5
      : readOnly
        ? theme.colors.neutral.surface.light // #f5f5f5
        : theme.colors.neutral.surface.lighter; // #ffffff

    const borderColor = accentColor;

    // ── Variant-specific overrides ────────────────────────────
    const variantStyle =
      variant === "underlined"
        ? {
          // Override the base borderWidth/borderRadius from StyleSheet
          borderWidth: 0,
          borderBottomWidth: 1,
          borderRadius: 0,
          borderBottomColor: accentColor,
          backgroundColor: "transparent",
          paddingHorizontal: theme.spacing.s100, // 4 px — keeps icons aligned
        }
        : ({
          borderColor,
          backgroundColor: bgColor,
        } as { borderColor?: string; backgroundColor: string });

    // Named alias used in the default branch above

    return (
      <View style={[styles.container, containerStyle]}>
        {/* ── Label ────────────────────────────────────────── */}
        {label && (
          <Typography
            fontVariant="LS"
            variant="medium"
            color="colors.neutral.onSurface.light"
            style={styles.label}
          >
            {label}
            {optional && (
              <Typography
                fontVariant="BXS"
                color="#8D8D8D"
                style={styles.optional}
              >
                {" "}
                (Optional)
              </Typography>
            )}
          </Typography>
        )}

        {/* ── Input row ─────────────────────────────────────── */}
        <View style={[styles.inputWrapper, variantStyle, wrapperStyle]}>
          {/* Left Icon */}
          {leftIcon && (
            <TouchableOpacity
              onPress={onLeftIconClick}
              style={styles.iconLeft}
              disabled={disabled}
            >
              {leftIcon}
            </TouchableOpacity>
          )}

          {/* Left Text */}
          {leftText && (
            <TouchableOpacity
              onPress={leftTextClick}
              style={styles.leftTextContainer}
              disabled={disabled}
            >
              <Typography
                fontVariant="BS"
                color="colors.neutral.onSurface.medium"
              >
                {leftText}
              </Typography>
            </TouchableOpacity>
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: disabled
                  ? theme.colors.neutral.onSurface.disabled // #8d8d8d
                  : theme.colors.neutral.onSurface.light, // #262626
              },
              leftIcon ? { paddingLeft: 40 } : {},
              leftText ? { paddingLeft: 50 } : {},
              rightIcon || rightText ? { paddingRight: 40 } : {},
              style,
            ]}
            pointerEvents={readOnly ? "none" : "auto"}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.neutral.onSurface.dark} // #6f6f6f
            editable={!disabled && !readOnly}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />

          {/* Right Text */}
          {rightText && (
            <TouchableOpacity
              onPress={rightClick}
              style={styles.rightTextContainer}
              disabled={disabled}
            >
              <Typography
                fontVariant="BS"
                color={rightTextColor || "colors.neutral.onSurface.medium"}
              >
                {rightText}
              </Typography>
            </TouchableOpacity>
          )}

          {/* Right Icon */}
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconClick}
              style={styles.iconRight}
              disabled={disabled}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>

        {/* ── Helper text ───────────────────────────────────── */}
        {!!(helperText || (typeof error === "string" && error)) && (
          <Typography
            fontVariant="BXS"
            color={
              error
                ? "colors.negative.onSurface.light" // #e00028
                : "colors.neutral.onSurface.medium" // #3a3a3a
            }
            style={styles.helperText}
          >
            {typeof error === "string" && error ? error : helperText}
          </Typography>
        )}
      </View>
    );
  },
);

// ──────────────────────────────────────────────────────────────
//  Styles  (theme-aware factory so tokens stay reactive)
// ──────────────────────────────────────────────────────────────
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: "100%",
      flexDirection: "column",
      marginBottom: theme.spacing.s600, // 24 px
    },
    label: {
      fontSize: theme.fontSize.LS.size, // 14
      fontWeight: "500",
      marginBottom: theme.spacing.s200 - 2, // 6 px
    },
    optional: {
      fontSize: theme.fontSize.BXS.size, // 12
      color: "#8D8D8D",
    },
    // Base wrapper — variant overrides applied inline
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: theme.borderRadius.b200, // 8
      height: 44,
      paddingHorizontal: theme.spacing.s300 - 2, // 10
    },
    input: {
      flex: 1,
      fontSize: theme.fontSize.BS.size, // 14
      lineHeight: theme.fontSize.BS.size * 1.4,
      height: "100%",
      fontFamily: "OpenSansMedium",
      paddingVertical: 0,
      paddingHorizontal: theme.spacing.s300, // 12
    },
    iconLeft: {
      position: "absolute",
      left: 10,
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    },
    iconRight: {
      position: "absolute",
      right: 10,
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    },
    leftTextContainer: {
      position: "absolute",
      left: 10,
      justifyContent: "center",
      height: "100%",
    },
    rightTextContainer: {
      position: "absolute",
      right: 10,
      justifyContent: "center",
      height: "100%",
    },
    helperText: {
      marginTop: theme.spacing.s100, // 4 px
      fontSize: theme.fontSize.BXS.size, // 12
    },
  });

export default Input;
