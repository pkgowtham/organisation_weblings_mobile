// TextField.tsx — multiline text area with expandable / fixed mode
import React, { forwardRef, useState } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";

// ──────────────────────────────────────────────────────────────
//  TextField
//
//  Multiline counterpart of the Input (single-line) component.
//  Shares the same 5 states and 2 variants:
//    States  : default · active (focused) · error · disabled · readOnly
//    Variants: 'default' (bordered box) · 'underlined' (bottom line)
//
//  Height behaviour
//    expandable={true}   — grows with content between minHeight and maxHeight
//    expandable={false}  — locked to fixedHeight (or the default 120 px)
//
//  All colour tokens come from the app theme.
// ──────────────────────────────────────────────────────────────

export type TextFieldVariant = 'default' | 'underlined';

export interface TextFieldProps extends TextInputProps {
    /** Visual variant — 'default' (bordered) or 'underlined' (bottom line only) */
    variant?: TextFieldVariant;
    /** When true the field grows with content; false = fixed height. Default true. */
    expandable?: boolean;
    /** Height used when expandable=false. Default 120 px. */
    fixedHeight?: number;
    /** Minimum height for expandable mode. Default 88 px. */
    minHeight?: number;
    /** Maximum height the field can grow to in expandable mode. Default 240 px. */
    maxHeight?: number;
    helperText?: string;
    error?: boolean | string;
    disabled?: boolean;
    label?: string;
    readOnly?: boolean;
    optional?: boolean;
    containerStyle?: ViewStyle;
    /** Show remaining character count (requires maxLength prop). */
    showCount?: boolean;
}

// ── Layout defaults ────────────────────────────────────────────
const DEFAULT_MIN_H = 88;
const DEFAULT_MAX_H = 240;
const DEFAULT_FIXED_H = 120;

const TextField = forwardRef<TextInput, TextFieldProps>(
    (
        {
            variant = 'default',
            expandable = true,
            fixedHeight = DEFAULT_FIXED_H,
            minHeight = DEFAULT_MIN_H,
            maxHeight = DEFAULT_MAX_H,
            helperText,
            error = false,
            disabled,
            placeholder,
            label,
            readOnly,
            optional = false,
            containerStyle,
            showCount = false,
            maxLength,
            value,
            onChangeText,
            style,
            ...props
        },
        ref
    ) => {
        const { theme } = useTheme();
        const styles = createStyles(theme);

        const [focused, setFocused] = useState(false);
        const [text, setText] = useState<string>(
            typeof value === 'string' ? value : ''
        );

        // Sync controlled value
        const displayText = value !== undefined ? String(value) : text;

        const handleChange = (t: string) => {
            if (value === undefined) setText(t);
            onChangeText?.(t);
        };

        // ── Border / accent colour ───────────────────────────────
        const accentColor = (() => {
            if (disabled) return theme.colors.neutral.border.disabled;  // #e0e0e0
            if (error) return theme.colors.negative.border.medium;   // #fe4856
            if (focused) return theme.colors.brand.border.medium;      // #008FF5
            if (readOnly) return theme.colors.neutral.border.light;     // #e0e0e0
            return theme.colors.neutral.border.light;     // #e0e0e0
        })();

        const bgColor = disabled
            ? theme.colors.neutral.surface.disabled   // #f5f5f5
            : readOnly
                ? theme.colors.neutral.surface.light  // #f5f5f5
                : theme.colors.neutral.surface.lighter; // #ffffff

        // ── Resolved height styles ───────────────────────────────
        const wrapperHeightStyle: ViewStyle = expandable
            ? { minHeight: minHeight, maxHeight: maxHeight }
            : { height: fixedHeight };

        // ── Variant-specific wrapper overrides ───────────────────
        const wrapperOverride: ViewStyle = variant === 'underlined'
            ? {
                borderWidth: 0,
                borderBottomWidth: 1,
                borderRadius: 0,
                borderBottomColor: accentColor,
                backgroundColor: 'transparent',
                paddingHorizontal: theme.spacing.s100, // 4 px
            }
            : {
                borderColor: accentColor,
                backgroundColor: bgColor,
            };

        return (
            <View style={[styles.container, containerStyle]}>

                {/* ── Label ──────────────────────────────────────── */}
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
                                {" "}(Optional)
                            </Typography>
                        )}
                    </Typography>
                )}

                {/* ── Text area wrapper ──────────────────────────── */}
                <View
                    style={[
                        styles.wrapper,
                        wrapperHeightStyle,
                        wrapperOverride,
                    ]}
                >
                    <TextInput
                        ref={ref}
                        multiline
                        textAlignVertical="top"
                        style={[
                            styles.input,
                            {
                                color: disabled
                                    ? theme.colors.neutral.onSurface.disabled  // #8d8d8d
                                    : theme.colors.neutral.onSurface.light,    // #262626
                            },
                            expandable ? { flex: undefined } : {},
                            style,
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor={theme.colors.neutral.onSurface.dark} // #6f6f6f
                        editable={!disabled && !readOnly}
                        value={displayText}
                        maxLength={maxLength}
                        onChangeText={handleChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        scrollEnabled={true}
                        {...props}
                    />
                </View>

                {/* ── Footer row: helper text + optional char count ─ */}
                {(helperText || (showCount && maxLength !== undefined)) && (
                    <View style={styles.footer}>
                        {helperText ? (
                            <Typography
                                fontVariant="BXS"
                                color={error
                                    ? "colors.negative.onSurface.light"   // #e00028
                                    : "colors.neutral.onSurface.medium"   // #3a3a3a
                                }
                                style={styles.helperText}
                            >
                                {helperText}
                            </Typography>
                        ) : (
                            <View /> // spacer to push count right
                        )}
                        {showCount && maxLength !== undefined && (
                            <Typography
                                fontVariant="BXS"
                                color="colors.neutral.onSurface.dark"
                                style={styles.charCount}
                            >
                                {displayText.length}/{maxLength}
                            </Typography>
                        )}
                    </View>
                )}
            </View>
        );
    }
);

// ──────────────────────────────────────────────────────────────
//  Styles
// ──────────────────────────────────────────────────────────────
const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            width: "100%",
            flexDirection: "column",
            marginBottom: theme.spacing.s600, // 24
        },
        label: {
            fontSize: theme.fontSize.LS.size,    // 14
            fontWeight: "500",
            marginBottom: theme.spacing.s200 - 2,    // 6
        },
        optional: {
            fontSize: theme.fontSize.BXS.size,       // 12
            color: "#8D8D8D",
        },
        // Base wrapper — variant & height overrides applied inline
        wrapper: {
            borderWidth: 1,
            borderRadius: theme.borderRadius.b200, // 8
            overflow: "hidden",
            paddingHorizontal: theme.spacing.s300 - 2, // 10
            paddingVertical: theme.spacing.s300,      // 12
        },
        input: {
            flex: 1,
            fontSize: theme.fontSize.BS.size,     // 14
            fontFamily: "OpenSansMedium",
            paddingVertical: 0,
            paddingHorizontal: theme.spacing.s300,     // 12
        },
        footer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginTop: theme.spacing.s100,        // 4
        },
        helperText: {
            flex: 1,
            fontSize: theme.fontSize.BXS.size,         // 12
        },
        charCount: {
            fontSize: theme.fontSize.BXS.size,       // 12
            marginLeft: theme.spacing.s200,            // 8
        },
    });

export default TextField;