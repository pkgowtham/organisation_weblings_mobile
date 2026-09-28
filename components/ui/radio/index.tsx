import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';

// ──────────────────────────────────────────────────────────────
//  Radio
//
//  States (all driven by theme tokens):
//    • Unselected  — neutral border, no inner fill
//    • Selected    — brand border + brand inner dot
//    • Disabled unselected — neutral.border.disabled, no fill
//    • Disabled selected   — brand.surface.light (washed-out blue)
// ──────────────────────────────────────────────────────────────

export interface RadioProps {
  /** Whether this radio is currently selected */
  selected?: boolean;
  /** Disables interaction and applies muted colours */
  disabled?: boolean;
  /** Called when the user taps the radio */
  onPress?: (event: GestureResponderEvent) => void;
  /** Outer circle diameter in px — defaults to 22 */
  size?: number;
  /** Extra styles on the touchable wrapper */
  style?: ViewStyle;
}

const Radio: React.FC<RadioProps> = ({
  selected = false,
  disabled = false,
  onPress,
  size     = 22,
  style,
}) => {
  const { theme } = useTheme();

  // Inner dot = 50 % of outer → leaves a clear gap inside the ring
  const innerSize = Math.round(size * 0.5);
  const borderW   = 2;

  // ── Colour logic ────────────────────────────────────────────
  let borderColor: string;
  let fillColor:   string;

  if (disabled) {
    borderColor = selected
      ? theme.colors.brand.surface.light         // disabled + selected  → light brand
      : theme.colors.neutral.border.disabled;    // disabled + unselected → disabled border
    fillColor = selected
      ? theme.colors.brand.surface.light
      : 'transparent';
  } else {
    borderColor = selected
      ? theme.colors.brand.surface.medium        // active + selected  → brand blue
      : theme.colors.neutral.border.medium;      // active + unselected → neutral
    fillColor = selected
      ? theme.colors.brand.surface.medium
      : 'transparent';
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[styles.touchArea, style]}
    >
      {/* ── Outer ring ───────────────────────────────────── */}
      <View
        style={[
          styles.outer,
          {
            width:        size,
            height:       size,
            borderRadius: size / 2,
            borderWidth:  borderW,
            borderColor,
          },
        ]}
      >
        {/* ── Inner dot (selected only) ─────────────────── */}
        {selected && (
          <View
            style={{
              width:           innerSize,
              height:          innerSize,
              borderRadius:    innerSize / 2,
              backgroundColor: fillColor,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Radio;

const styles = StyleSheet.create({
  touchArea: {
    alignSelf: 'flex-start',
  },
  outer: {
    justifyContent: 'center',
    alignItems:     'center',
  },
});