import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { ArrowForwardIos } from '@/svg_icons';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '../typography';

export interface BreadcrumbItem {
  label: string;
  /** Called when this crumb is tapped. Current item is not tappable. */
  onPress?: () => void;
}

export type BreadcrumbVariant = 'linear' | 'block';

export interface BreadcrumbsProps {
  /** Ordered array of crumbs — last item is treated as the current page */
  items: BreadcrumbItem[];
  /** Visual style — defaults to 'linear' */
  variant?: BreadcrumbVariant;
  /** Extra styles on the outer row container */
  style?: ViewStyle;
}

// ── Layout constants ───────────────────────────────────────────
const ITEM_GAP   = 8;   // theme spacing s200
const BLOCK_H    = 36;  // block-variant item height
const CHEVRON_SZ = 20;

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  variant = 'linear',
  style,
}) => {
  const { theme } = useTheme();

  // ── Per-variant colour tokens ────────────────────────────────
  const pastColor = variant === 'block'
    ? theme.colors.neutral.onSurface.light   // block → slightly more contrast
    : theme.colors.neutral.onSurface.medium; // linear → softer grey

  const currentColor   = theme.colors.brand.onSurface.light;
  const separatorColor = pastColor;

  return (
    // 8 px gap between complete [label + chevron] units only
    <View style={[styles.row, { gap: ITEM_GAP }, style]}>
      {items.map((item, idx) => {
        const isLast    = idx === items.length - 1;
        const textColor = isLast ? currentColor : pastColor;

        return (
          // Each crumb is a tightly grouped [label][chevron] unit — no internal gap
          <View key={`bc-${idx}`} style={styles.crumb}>
            <TouchableOpacity
              onPress={item.onPress}
              disabled={!item.onPress || isLast}
              activeOpacity={item.onPress && !isLast ? 0.6 : 1}
              style={variant === 'block' ? styles.blockItem : undefined}
            >
              <Typography fontVariant="BS" style={{ color: textColor }}>
                {item.label}
              </Typography>
            </TouchableOpacity>

            {/* Chevron sits flush against the label — no extra spacing */}
            {!isLast && (
              <ArrowForwardIos
                color={separatorColor}
                width={CHEVRON_SZ}
                height={CHEVRON_SZ}
                viewBox="0 0 24 24"
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

export default Breadcrumbs;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  // ── Each [label + chevron] unit — no internal gap ─────────
  crumb: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  // ── Block-variant item ─────────────────────────────────────
  blockItem: {
    height:            BLOCK_H,
    justifyContent:    'center',
    paddingHorizontal: ITEM_GAP,
  },
});