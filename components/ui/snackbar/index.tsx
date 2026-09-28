// Snackbar.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Info2, CircleCheck, Goal, Important, Close } from '@/svg_icons';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '../typography';

// ──────────────────────────────────────────────────────────────
//  Snackbar
//
//  A brief bottom notification bar with:
//    [icon]  [message  flex:1]  [Action]  [×]
//
//  5 Variants  : neutral · brand · positive · warning · negative
//  Background  : solid dark / coloured fill (same tokens as Toast)
//  Icon        : white MaterialIcons icon — variant-specific
//  Action text : optional tappable label (rgba white)
//  Close       : optional × icon
//
//  All colours from the app theme.
// ──────────────────────────────────────────────────────────────

export type SnackbarVariant = 'neutral' | 'brand' | 'positive' | 'warning' | 'negative';

export interface SnackbarProps {
    /** Visual / colour variant.  Default 'neutral'. */
    variant?: SnackbarVariant;
    /** Main message text. */
    message: string;
    /** Optional action button label (e.g. "Undo", "Retry"). */
    action?: string;
    /** Called when the action button is pressed. */
    onAction?: () => void;
    /** Called when the × button is pressed. */
    onClose?: () => void;
    /** Show the close × button.  Default true. */
    showClose?: boolean;
    /** Show the left icon.  Default true. */
    showIcon?: boolean;
}

// ── Per-variant config ────────────────────────────────────────
type Config = {
    bg:   (theme: any) => string;
    icon: React.ComponentType<any>;
    viewBox: string;
};

const VARIANT_CONFIG: Record<SnackbarVariant, Config> = {
    neutral:  { bg: (t) => t.colors.neutral.surface.inverse,  icon: Info2,       viewBox: '0 0 24 24' }, // #151515
    brand:    { bg: (t) => t.colors.brand.surface.medium,     icon: Info2,       viewBox: '0 0 24 24' }, // #0072C4
    positive: { bg: (t) => t.colors.positive.surface.medium,  icon: CircleCheck, viewBox: '0 0 56 57' }, // #008117
    warning:  { bg: (t) => t.colors.warning.surface.medium,   icon: Goal,        viewBox: '0 0 24 24' }, // #b15600
    negative: { bg: (t) => t.colors.negative.surface.medium,  icon: Important,   viewBox: '0 0 24 24' }, // #e00028
};

// ─────────────────────────────────────────────────────────────
const Snackbar: React.FC<SnackbarProps> = ({
    variant   = 'neutral',
    message,
    action,
    onAction,
    onClose,
    showClose = true,
    showIcon  = true,
}) => {
    const { theme } = useTheme();
    const cfg       = VARIANT_CONFIG[variant];
    const bgColor   = cfg.bg(theme);

    // Resolve static white from the active theme
    const staticWhite = theme.colors.neutral.surface.lighter === '#ffffff' 
      ? theme.colors.neutral.surface.lighter 
      : theme.colors.neutral.surface.inverse;

    const isNeutral = variant === 'neutral';
    const textColor = isNeutral ? theme.colors.neutral.onSurface.inverse : staticWhite;
    const actionTextColor = isNeutral ? theme.colors.neutral.onSurface.inverse : staticWhite;
    const closeIconColor = isNeutral ? theme.colors.neutral.onSurface.inverse : staticWhite;

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: bgColor,
                  borderRadius: theme.borderRadius.b300, // 12
                },
            ]}
        >
            {/* ── Left icon ───────────────────────────── */}
            {showIcon && (
                <cfg.icon
                    color={textColor}
                    width={20}
                    height={20}
                    viewBox={cfg.viewBox}
                    style={styles.icon}
                />
            )}

            {/* ── Message ─────────────────────────────── */}
            <Typography
                fontVariant="BS"
                variant="semibold"
                style={[styles.message, { color: textColor }]}
            >
                {message}
            </Typography>

            {/* ── Action button ───────────────────────── */}
            {action && (
                <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
                    <Typography
                        fontVariant="BS"
                        variant="semibold"
                        style={[styles.actionText, { color: actionTextColor, opacity: 0.8 }]}
                    >
                        {action}
                    </Typography>
                </TouchableOpacity>
            )}

            {/* ── Close × ─────────────────────────────── */}
            {showClose && (
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Close width={18} height={18} color={closeIconColor} viewBox="0 0 24 24" />
                </TouchableOpacity>
            )}
        </View>
    );
};

// ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flexDirection:  'row',
        alignItems:     'center',
        paddingVertical:   12,
        paddingHorizontal: 16,
        width:          '100%',
        marginBottom:   8,
        // shadow
        shadowColor:   '#000000',
        shadowOffset:  { width: 0, height: 2 },
        shadowOpacity: 0.20,
        shadowRadius:  6,
        elevation:     4,
    },
    icon: {
        marginRight: 10,
    },
    message: {
        flex:   1,
        fontSize: 14,
    },
    actionBtn: {
        marginLeft:      12,
        paddingVertical:  2,
        paddingHorizontal: 4,
    },
    actionText: {
        fontSize: 14,
    },
    closeBtn: {
        marginLeft: 8,
        padding:    2,
    },
});

export default Snackbar;
