// Divider.tsx
import React from 'react';
import {
    View,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '../typography';

// ──────────────────────────────────────────────────────────────
//  Divider
//
//  Horizontal (default) or vertical separator line.
//
//  Colour
//    Default: neutral > border > light  (#e0e0e0)
//    Can be changed via colorVariant + colorWeight OR a raw color string.
//
//  Props:
//    orientation         — 'horizontal' | 'vertical'            default 'horizontal'
//    colorVariant        — 'neutral' | 'brand' | 'negative'
//                          'warning' | 'positive'               default 'neutral'
//    colorWeight         — 'light' | 'medium' | 'dark'          default 'light'
//    color               — raw hex/rgb string (overrides variant)
//    weight              — line thickness in px                  default 1
//    paddingHorizontal   — left & right inset (horizontal divider)
//    paddingVertical     — top & bottom inset (both orientations)
//    subheader           — text label placed on the line
//    subheaderPosition   — 'left' | 'center' | 'right'          default 'left'
//    style               — extra ViewStyle on the root container
// ──────────────────────────────────────────────────────────────

export type DividerColorVariant  = 'neutral' | 'brand' | 'negative' | 'warning' | 'positive';
export type DividerColorWeight   = 'light' | 'medium' | 'dark';
export type DividerOrientation   = 'horizontal' | 'vertical';
export type SubheaderPosition    = 'left' | 'center' | 'right';

export interface DividerProps {
    /** 'horizontal' (default) or 'vertical' */
    orientation?:       DividerOrientation;
    /** Theme colour family.  Default 'neutral'. */
    colorVariant?:      DividerColorVariant;
    /** Shade within the colour family.  Default 'light'. */
    colorWeight?:       DividerColorWeight;
    /** Raw colour string — overrides colorVariant/colorWeight. */
    color?:             string;
    /** Line thickness in px.  Default 1. */
    weight?:            number;
    /** Left & right inset for horizontal dividers.  Default 0. */
    paddingHorizontal?: number;
    /** Top & bottom inset / spacing.  Default 0. */
    paddingVertical?:   number;
    /** Optional text label shown on (or beside) the divider line. */
    subheader?:         string;
    /** Where the subheader sits.  Default 'left'. */
    subheaderPosition?: SubheaderPosition;
    style?:             ViewStyle;
}

// Gap between the subheader text and the adjoining line(s)
const SUBHEADER_GAP = 8;

const Divider: React.FC<DividerProps> = ({
    orientation        = 'horizontal',
    colorVariant       = 'neutral',
    colorWeight        = 'light',
    color,
    weight             = 1,
    paddingHorizontal  = 0,
    paddingVertical    = 0,
    subheader,
    subheaderPosition  = 'left',
    style,
}) => {
    const { theme } = useTheme();

    // ── Resolve line colour ──────────────────────────────────
    const resolvedColor = color ?? (() => {
        const borders: Record<DividerColorVariant, Record<DividerColorWeight, string>> = {
            neutral:  {
                light:  theme.colors.neutral.border.light,   // #e0e0e0
                medium: theme.colors.neutral.border.medium,  // #a9a9a9
                dark:   theme.colors.neutral.border.dark,    // #8d8d8d
            },
            brand: {
                light:  theme.colors.brand.border.light,     // #d2e1fe
                medium: theme.colors.brand.border.medium,    // #008FF5
                dark:   theme.colors.brand.border.dark,      // #00274a
            },
            negative: {
                light:  theme.colors.negative.border.light,  // #fed8d9
                medium: theme.colors.negative.border.medium, // #fe4856
                dark:   theme.colors.negative.border.dark,   // #550009
            },
            warning: {
                light:  theme.colors.warning.border.light,   // #fef2ef
                medium: theme.colors.warning.border.medium,  // #dd6d00
                dark:   theme.colors.warning.border.dark,    // #421b00
            },
            positive: {
                light:  theme.colors.positive.border.light,  // #cbe8ca
                medium: theme.colors.positive.border.medium, // #36a040
                dark:   theme.colors.positive.border.dark,   // #002e00
            },
        };
        return borders[colorVariant][colorWeight];
    })();

    // ── Vertical divider ─────────────────────────────────────
    if (orientation === 'vertical') {
        return (
            <View
                style={[
                    {
                        width:          weight,
                        alignSelf:      'stretch',
                        marginVertical: paddingVertical,
                        marginHorizontal: paddingHorizontal,
                        backgroundColor: resolvedColor,
                    },
                    style,
                ]}
            />
        );
    }

    // ── Horizontal — no subheader ─────────────────────────────
    if (!subheader) {
        return (
            <View
                style={[
                    {
                        height:          weight,
                        marginHorizontal: paddingHorizontal,
                        marginVertical:  paddingVertical,
                        backgroundColor: resolvedColor,
                    },
                    style,
                ]}
            />
        );
    }

    // ── Horizontal — with subheader ───────────────────────────
    // Renders: [line?] [gap] [text] [gap] [line?]
    // left   → text first, line fills right
    // center → lines on both sides
    // right  → line fills left, text last

    const line = (flex: number) => (
        <View
            style={{
                flex,
                height:          weight,
                backgroundColor: resolvedColor,
                alignSelf:       'center',
            }}
        />
    );

    return (
        <View
            style={[
                styles.subheaderRow,
                {
                    marginHorizontal: paddingHorizontal,
                    marginVertical:   paddingVertical,
                },
                style,
            ]}
        >
            {/* Left line — hidden for 'left' position */}
            {subheaderPosition !== 'left' && (
                <>
                    {line(1)}
                    <View style={{ width: SUBHEADER_GAP }} />
                </>
            )}

            {/* Subheader text */}
            <Typography
                fontVariant="BXS"
                color="colors.neutral.onSurface.medium"
                style={styles.subheaderText}
            >
                {subheader}
            </Typography>

            {/* Right line — hidden for 'right' position */}
            {subheaderPosition !== 'right' && (
                <>
                    <View style={{ width: SUBHEADER_GAP }} />
                    {line(1)}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    subheaderRow: {
        flexDirection: 'row',
        alignItems:    'center',
    },
    subheaderText: {
        // BXS = 12px — tight and unobtrusive
    },
});

export default Divider;