import React, { useRef, useEffect } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';

// ──────────────────────────────────────────────────────────────
//  CustomSwitch  (named to avoid collision with RN's own Switch)
//
//  4 states (theme-sourced colours):
//    • Off  + enabled   → neutral.surface.medium     (grey)
//    • On   + enabled   → brand.surface.medium        (blue)
//    • Off  + disabled  → neutral.surface.disabled    (light grey)
//    • On   + disabled  → brand.surface.light         (light blue)
//
//  Thumb always uses neutral.surface.lighter (white) with a
//  subtle drop-shadow for the classic elevated pill look.
//  Thumb slide is animated at 200 ms with useNativeDriver:false.
// ──────────────────────────────────────────────────────────────

export interface SwitchProps {
  /** Current on/off value */
  value?: boolean;
  /** Disables interaction and applies muted colours */
  disabled?: boolean;
  /** Called when the user toggles; receives the new value */
  onValueChange?: (value: boolean) => void;
  /** Extra styles on the track container */
  style?: ViewStyle;
}

// ── Layout constants (px) ──────────────────────────────────────
const TRACK_W  = 52;
const TRACK_H  = 30;
const THUMB_SZ = 24;
const EDGE_GAP = (TRACK_H - THUMB_SZ) / 2; // 3 — gap between thumb & track edge

const THUMB_OFF = EDGE_GAP;                         // left edge when off
const THUMB_ON  = TRACK_W - THUMB_SZ - EDGE_GAP;   // left edge when on

const CustomSwitch: React.FC<SwitchProps> = ({
  value         = false,
  disabled      = false,
  onValueChange,
  style,
}) => {
  const { theme } = useTheme();

  // ── Animation ────────────────────────────────────────────────
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue:         value ? 1 : 0,
      duration:        200,
      useNativeDriver: false, // needed to animate layout props
    }).start();
  }, [value]);

  const thumbLeft = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [THUMB_OFF, THUMB_ON],
  });

  // ── Colour logic ─────────────────────────────────────────────
  const getTrackColor = (): string => {
    if (disabled && value) return theme.colors.brand.surface.light;    // disabled on
    if (disabled)          return theme.colors.neutral.surface.disabled; // disabled off
    if (value)             return theme.colors.brand.surface.medium;   // enabled on
    return                        theme.colors.neutral.surface.medium;  // enabled off
  };

  const handlePress = () => {
    if (!disabled && onValueChange) onValueChange(!value);
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress} disabled={disabled}>
      <View
        style={[
          styles.track,
          { backgroundColor: getTrackColor() },
          style,
        ]}
      >
        {/* ── Thumb ─────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.thumb,
            {
              left:            thumbLeft,
              backgroundColor: theme.colors.neutral.surface.lighter,
            },
          ]}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CustomSwitch;

const styles = StyleSheet.create({
  track: {
    width:        TRACK_W,
    height:       TRACK_H,
    borderRadius: TRACK_H / 2,
  },
  thumb: {
    position:     'absolute',
    top:          EDGE_GAP,  // vertical centre within the track
    width:        THUMB_SZ,
    height:       THUMB_SZ,
    borderRadius: THUMB_SZ / 2,
    // Subtle elevation so the thumb appears to float above the track
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius:  2,
    elevation:     2,
  },
});