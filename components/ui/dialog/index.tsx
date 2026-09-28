// Dialog.tsx — Modal dialog with fade + scale animation
import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    Animated,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import * as SvgIcons from '@/svg_icons';
import { useTheme } from '@/context/CustomThemeContext';
import CustomButton from '../button';
import Divider from '../divider';
import { Typography } from '../typography';

// ──────────────────────────────────────────────────────────────
//  Dialog  — Modal popup with fade/scale animation
//
//  The dialog is parent-controlled via the `visible` prop.
//  Show it by setting visible={true}, hide it via onCancel /
//  onConfirm / onDismiss callbacks or by toggling visible from
//  the parent.
//
//  Animation
//    Backdrop : opacity  0 → 1  (d4 = 300 ms, d3 = 150 ms out)
//    Card     : opacity  0 → 1  (same timing)
//              scale    0.88 → 1.0  (spring, friction 8)
//    Values come from theme.duration tokens (×1000 → ms).
//
//  Backdrop colour : theme.colors.neutral.overlay.dark  (rgba(0,0,0,0.50))
//
//  Card spec
//    borderRadius : 16  (theme.borderRadius.b400)
//    padding      : 16  (theme.spacing.s400) — applied per-section
//                        so dividers span edge-to-edge
//
//  5 Variants: brand · neutral · negative · warning · positive
// ──────────────────────────────────────────────────────────────

export type DialogVariant = 'brand' | 'neutral' | 'negative' | 'warning' | 'positive';

export interface DialogProps {
    /** Show / hide the dialog.  Managed by the parent. */
    visible: boolean;
    /** Called when the backdrop is pressed (if dismissOnBackdrop is true). */
    onDismiss?: () => void;
    /** Visual / colour variant.  Default 'brand'. */
    variant?: DialogVariant;
    /** Title shown next to the icon. */
    title: string;
    /** MaterialIcons icon name.  A sensible default is supplied per variant. */
    icon?: string;
    /** Content slot — pass any React node as children. */
    children?: React.ReactNode;
    /** Cancel button label.  Default 'Cancel'. */
    cancelLabel?: string;
    /** Confirm button label.  Default 'Confirm'. */
    confirmLabel?: string;
    /** Called when the cancel button is pressed. */
    onCancel?: () => void;
    /** Called when the confirm button is pressed. */
    onConfirm?: () => void;
    /** Show the cancel button.  Default true. */
    showCancel?: boolean;
    /** Show the confirm button.  Default true. */
    showConfirm?: boolean;
    /** Dismiss the dialog when the backdrop is tapped.  Default true. */
    dismissOnBackdrop?: boolean;
    /** Extra style applied to the card view. */
    style?: ViewStyle;
}

// ── Per-variant config ────────────────────────────────────────
type VariantConfig = {
    defaultIcon:    string;
    color:          (theme: any) => string;
    confirmVariant: string;
};

const VARIANT_CONFIG: Record<DialogVariant, VariantConfig> = {
    brand: {
        defaultIcon:    'info',
        color:          (t) => t.colors.brand.onSurface.light,    // #0072c4
        confirmVariant: 'primary',
    },
    neutral: {
        defaultIcon:    'info-outline',
        color:          (t) => t.colors.neutral.onSurface.light,  // #262626
        confirmVariant: 'white',
    },
    negative: {
        defaultIcon:    'error-outline',
        color:          (t) => t.colors.negative.onSurface.light, // #e00028
        confirmVariant: 'negative',
    },
    warning: {
        defaultIcon:    'warning',
        color:          (t) => t.colors.warning.onSurface.light,  // #b15600
        confirmVariant: 'warning',
    },
    positive: {
        defaultIcon:    'check-circle-outline',
        color:          (t) => t.colors.positive.onSurface.light, // #008117
        confirmVariant: 'positive',
    },
};

const ICON_MAP: Record<string, keyof typeof SvgIcons> = {
    'info': 'Info2',
    'info-outline': 'Info2',
    'error-outline': 'Important',
    'error': 'Important',
    'warning': 'Goal',
    'check-circle-outline': 'CircleCheck',
    'check-circle': 'CircleCheck',
    'close': 'Close',
    'add-circle-outline': 'AddCircleOutline',
};

// ─────────────────────────────────────────────────────────────
const Dialog: React.FC<DialogProps> = ({
    visible,
    onDismiss,
    variant          = 'brand',
    title,
    icon,
    children,
    cancelLabel      = 'Cancel',
    confirmLabel     = 'Confirm',
    onCancel,
    onConfirm,
    showCancel       = true,
    showConfirm      = true,
    dismissOnBackdrop = true,
    style,
}) => {
    const { theme }  = useTheme();
    const cfg        = VARIANT_CONFIG[variant];
    const accentClr  = cfg.color(theme);
    const iconName   = (icon ?? cfg.defaultIcon) as string;

    const SvgIconComponent = (() => {
        const mappedName = ICON_MAP[iconName] || iconName;
        const Component = SvgIcons[mappedName as keyof typeof SvgIcons] || SvgIcons.Info2;
        const viewBox = mappedName === 'CircleCheck' ? '0 0 56 57' : '0 0 24 24';
        return { Component, viewBox };
    })();

    // ── Animation values ────────────────────────────────────
    // Durations from theme.duration (seconds → ms)
    const durationIn  = theme.duration.d4 * 1000;  // 300 ms
    const durationOut = theme.duration.d3 * 1000;  // 150 ms

    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const cardOpacity     = useRef(new Animated.Value(0)).current;
    const cardScale       = useRef(new Animated.Value(0.88)).current;

    // We keep the Modal mounted until the exit animation finishes
    const [modalMounted, setModalMounted] = useState(false);

    useEffect(() => {
        if (visible) {
            // Mount first, then animate in
            setModalMounted(true);
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue:         1,
                    duration:        durationIn,
                    useNativeDriver: true,
                }),
                Animated.timing(cardOpacity, {
                    toValue:         1,
                    duration:        durationIn,
                    useNativeDriver: true,
                }),
                Animated.spring(cardScale, {
                    toValue:         1,
                    friction:        8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Animate out, then unmount
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue:         0,
                    duration:        durationOut,
                    useNativeDriver: true,
                }),
                Animated.timing(cardOpacity, {
                    toValue:         0,
                    duration:        durationOut,
                    useNativeDriver: true,
                }),
                Animated.timing(cardScale, {
                    toValue:         0.88,
                    duration:        durationOut,
                    useNativeDriver: true,
                }),
            ]).start(() => setModalMounted(false));
        }
    }, [visible]);

    if (!modalMounted) return null;

    // ── Backdrop press handler ───────────────────────────────
    const handleBackdropPress = () => {
        if (dismissOnBackdrop) onDismiss?.();
    };

    return (
        <Modal
            transparent
            visible={modalMounted}
            statusBarTranslucent
            animationType="none"       // We handle animation ourselves
            onRequestClose={onDismiss} // Android back button
        >
            {/* ── Animated backdrop ──────────────────────── */}
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFillObject,
                        {
                            backgroundColor: theme.colors.neutral.overlay.dark, // rgba(0,0,0,0.50)
                            opacity:         backdropOpacity,
                        },
                    ]}
                />
            </TouchableWithoutFeedback>

            {/* ── Centred card container ─────────────────── */}
            <View style={styles.centreContainer} pointerEvents="box-none">
                <Animated.View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.colors.neutral.surface.lighter, // #ffffff
                            borderRadius:    theme.borderRadius.b400,               // 16
                            opacity:         cardOpacity,
                            transform:       [{ scale: cardScale }],
                        },
                        style,
                    ]}
                >
                    {/* ── Header: icon + title ────────────── */}
                    <View style={styles.headerSection}>
                    <SvgIconComponent.Component
                        color={accentClr}
                        width={20}
                        height={20}
                        viewBox={SvgIconComponent.viewBox}
                    />
                        <Typography
                            fontVariant="BM"
                            variant="semibold"
                            style={[styles.titleText, { color: accentClr }]}
                        >
                            {title}
                        </Typography>
                    </View>

                    {/* ── Top divider — 16 px margin V ──── */}
                    <Divider style={styles.dividerSpacing} />

                    {/* ── Content slot ────────────────────── */}
                    <View style={styles.contentSection}>
                        {children}
                    </View>

                    {/* ── Bottom divider — 16 px margin V ── */}
                    <Divider style={styles.dividerSpacing} />

                    {/* ── Buttons — right-aligned ──────────── */}
                    <View style={styles.buttonSection}>
                        {showCancel && (
                            <CustomButton
                                variant="neutralText"
                                title={cancelLabel}
                                onPress={onCancel}
                                size='xs'
                            />
                        )}
                        {showConfirm && (
                            <CustomButton
                                variant={cfg.confirmVariant as any}
                                title={confirmLabel}
                                onPress={onConfirm}
                                size='xs'
                            />
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

// ──────────────────────────────────────────────────────────────
//  Styles
//  Card sections have their own paddingHorizontal (16 px) so
//  the Dividers span edge-to-edge within the card.
// ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    centreContainer: {
        flex:            1,
        justifyContent:  'center',
        alignItems:      'center',
        paddingHorizontal: 24,  // safe margin from screen edges
    },
    card: {
        width:    '100%',
        overflow: 'hidden',
        // shadow
        shadowColor:   '#000000',
        shadowOffset:  { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius:  16,
        elevation:     8,
    },
    // ── Header ──────────────────────────────────────────────
    headerSection: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               8,
        paddingHorizontal: 16,
        paddingTop:        16,
    },
    titleText: {
        flex: 1,
    },
    // ── Divider ─────────────────────────────────────────────
    dividerSpacing: {
        marginVertical: 16,
        marginHorizontal: 16
    },
    // ── Children slot ───────────────────────────────────────
    contentSection: {
        paddingHorizontal: 16,
    },
    // ── Button row ──────────────────────────────────────────
    buttonSection: {
        flexDirection:     'row',
        justifyContent:    'flex-end',
        alignItems:        'center',
        gap:               8,
        paddingHorizontal: 16,
        paddingBottom:     16,
    },
});

export default Dialog;