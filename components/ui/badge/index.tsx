import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Typography } from '../typography';
import { useTheme } from '@/context/CustomThemeContext';

// ──────────────────────────────────────────────────────────────
//  Badge
//
//  Two modes, driven by whether `count` is provided:
//    • Dot   — small filled circle (notification indicator)
//    • Count — rounded pill/circle with a number inside
//
//  Three colours from the app theme:
//    brand · negative · positive
// ──────────────────────────────────────────────────────────────

export type BadgeColor = 'brand' | 'negative' | 'positive';

export interface BadgeProps {
  /** Colour theme — defaults to 'negative' (most common for notification dots) */
  color?: BadgeColor;
  /**
   * When provided, renders a count badge.
   * When omitted, renders a small dot indicator.
   */
  count?: number;
  /**
   * Numbers above this cap are shown as `{max}+`.
   * Defaults to 99.
   */
  max?: number;
  /** Override styles on the outer container */
  badgeStyle?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  color    = 'negative',
  count,
  max      = 99,
  badgeStyle,
}) => {
  const { theme } = useTheme();

  // ── Per-colour design tokens ────────────────────────────────
  const paletteMap: Record<BadgeColor, { bg: string; text: string }> = {
    brand: {
      bg:   theme.colors.brand.surface.medium,
      text: theme.colors.brand.onSurface.medium,
    },
    negative: {
      bg:   theme.colors.negative.surface.medium,
      text: theme.colors.negative.onSurface.medium,
    },
    positive: {
      bg:   theme.colors.positive.surface.medium,
      text: theme.colors.positive.onSurface.medium,
    },
  };

  const palette = paletteMap[color];
  const isDot   = count === undefined || count === null;

  // ── Dot mode ────────────────────────────────────────────────
  if (isDot) {
    return (
      <View
        style={[
          styles.dot,
          { backgroundColor: palette.bg },
          badgeStyle,
        ]}
      />
    );
  }

  // ── Count mode ──────────────────────────────────────────────
  const label = count > max ? `${max}+` : String(count);

  return (
    <View
      style={[
        styles.count,
        { backgroundColor: palette.bg },
        badgeStyle,
      ]}
    >
      <Typography
        variant="bold"
        style={[styles.countText, { color: palette.text }]}
      >
        {label}
      </Typography>
    </View>
  );
};

export default Badge;

const styles = StyleSheet.create({
  // ── Dot ─────────────────────────────────────────────────────
  dot: {
    width:        10,
    height:       10,
    borderRadius: 5,
  },

  // ── Count ───────────────────────────────────────────────────
  count: {
    minWidth:         22,
    height:           22,
    borderRadius:     11,
    paddingHorizontal: 5,
    justifyContent:   'center',
    alignItems:       'center',
  },
  countText: {
    fontSize:   11,
    lineHeight: 14,
    textAlign:  'center',
  },
});