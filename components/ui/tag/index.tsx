import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";
import * as SvgIcons from "@/svg_icons";
import Svg, { Path } from "react-native-svg";
import { Typography } from "../typography";
import { useTheme } from "@/context/CustomThemeContext";

// ──────────────────────────────────────────────────────────────
//  Tag · 5 colours × 2 variants
//  Each icon (left / right) has its own onPress; the whole tag
//  has its own onPress. When an icon's handler is provided the
//  touch is consumed by the icon and does NOT bubble to the tag.
// ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, keyof typeof SvgIcons> = {
  "add-circle-outline": "AddCircleOutline",
  "chevron-right": "ArrowForwardIos",
  search: "Search",
  label: "Label",
  "label-outline": "Label",
  close: "Close",
  "mail-outline": "EmailOutline",
};

const CUSTOM_SVGS: Record<string, (props: any) => React.JSX.Element> = {
  person: (props) => (
    <Svg
      width={props.width}
      height={props.height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z"
        fill={props.color}
      />
    </Svg>
  ),
  "person-outline": (props) => (
    <Svg
      width={props.width}
      height={props.height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5-4-8-4z"
        fill={props.color}
      />
    </Svg>
  ),
  notifications: (props) => (
    <Svg
      width={props.width}
      height={props.height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
        fill={props.color}
      />
    </Svg>
  ),
  settings: (props) => (
    <Svg
      width={props.width}
      height={props.height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"
        fill={props.color}
      />
    </Svg>
  ),
};

export type TagColor =
  | "brand"
  | "neutral"
  | "negative"
  | "warning"
  | "positive"
  | "info";
export type TagVariant = "filled" | "bordered";

export interface TagProps {
  /** Display text */
  label: string;
  /** Colour theme — defaults to 'brand' */
  color?: TagColor;
  /** Visual style — defaults to 'bordered' */
  variant?: TagVariant;
  /** Icon or MaterialIcons name rendered on the left */
  iconLeft?: React.ReactNode | string;
  /** Icon or MaterialIcons name rendered on the right (e.g. 'close') */
  iconRight?: React.ReactNode | string;
  /** Fires when the whole tag is tapped (not consumed by icon presses) */
  onPress?: (event: GestureResponderEvent) => void;
  /** Fires when the left icon is tapped */
  onPressLeft?: (event: GestureResponderEvent) => void;
  /** Fires when the right icon is tapped */
  onPressRight?: (event: GestureResponderEvent) => void;
  /** Icon size — defaults to 14 */
  iconSize?: number;
  /** Extra styles applied to the outer container */
  tagStyle?: any;
  /** Extra styles applied to the label text */
  labelStyle?: any;
  /** Typography variant weight - e.g. 'medium', 'semibold' */
  labelVariant?: any;
  /** Typography font variant size - e.g. 'BXS', 'LM' */
  labelFontVariant?: any;
}

const Tag: React.FC<TagProps> = ({
  label,
  color = "brand",
  variant = "bordered",
  iconLeft,
  iconRight,
  onPress,
  onPressLeft,
  onPressRight,
  iconSize = 14,
  tagStyle,
  labelStyle,
  labelVariant,
  labelFontVariant,
}) => {
  const { theme } = useTheme();

  // ── Per-colour, per-variant design tokens ──────────────────
  const paletteMap: Record<
    TagColor,
    Record<
      TagVariant,
      {
        bg: string;
        border: string;
        text: string;
        icon: string;
      }
    >
  > = {
    brand: {
      filled: {
        bg: theme.colors.brand.surface.medium,
        border: "transparent",
        text: theme.colors.brand.onSurface.medium,
        icon: theme.colors.brand.onSurface.medium,
      },
      bordered: {
        bg: theme.colors.brand.surface.lighter,
        border: theme.colors.brand.border.medium,
        text: theme.colors.brand.onSurface.light,
        icon: theme.colors.brand.onSurface.light,
      },
    },
    info: {
      filled: {
        bg: theme.colors.info.surface.medium,
        border: "transparent",
        text: theme.colors.info.onSurface.medium,
        icon: theme.colors.info.onSurface.medium,
      },
      bordered: {
        bg: theme.colors.info.surface.lighter,
        border: theme.colors.info.border.medium,
        text: theme.colors.info.onSurface.light,
        icon: theme.colors.info.onSurface.light,
      },
    },
    neutral: {
      filled: {
        bg: theme.colors.neutral.surface.medium,
        border: "transparent",
        text: theme.colors.neutral.onSurface.light,
        icon: theme.colors.neutral.onSurface.light,
      },
      bordered: {
        bg: theme.colors.neutral.surface.lighter,
        border: theme.colors.neutral.border.light,
        text: theme.colors.neutral.onSurface.light,
        icon: theme.colors.neutral.onSurface.dark,
      },
    },
    negative: {
      filled: {
        bg: theme.colors.negative.surface.medium,
        border: "transparent",
        text: theme.colors.negative.onSurface.medium,
        icon: theme.colors.negative.onSurface.medium,
      },
      bordered: {
        bg: theme.colors.negative.surface.lighter,
        border: theme.colors.negative.border.medium,
        text: theme.colors.negative.onSurface.light,
        icon: theme.colors.negative.onSurface.light,
      },
    },
    warning: {
      filled: {
        bg: theme.colors.warning.surface.medium,
        border: "transparent",
        text: theme.colors.warning.onSurface.medium,
        icon: theme.colors.warning.onSurface.medium,
      },
      bordered: {
        bg: theme.colors.warning.surface.lighter,
        border: theme.colors.warning.border.medium,
        text: theme.colors.warning.onSurface.light,
        icon: theme.colors.warning.onSurface.light,
      },
    },
    positive: {
      filled: {
        bg: theme.colors.positive.surface.medium,
        border: "transparent",
        text: theme.colors.positive.onSurface.medium,
        icon: theme.colors.positive.onSurface.medium,
      },
      bordered: {
        bg: theme.colors.positive.surface.lighter,
        border: theme.colors.positive.border.medium,
        text: theme.colors.positive.onSurface.light,
        icon: theme.colors.positive.onSurface.light,
      },
    },
  };

  const palette = paletteMap[color][variant];

  // ── Icon renderer ───────────────────────────────────────────
  const renderIcon = (iconProp: React.ReactNode | string) => {
    if (React.isValidElement(iconProp)) return iconProp;
    if (typeof iconProp === "string") {
      const mappedName = ICON_MAP[iconProp] || iconProp;
      const SvgIconComponent = SvgIcons[mappedName as keyof typeof SvgIcons];
      if (SvgIconComponent) {
        const viewBox =
          mappedName === "CircleCheck" ? "0 0 56 57" : "0 0 24 24";
        return (
          <SvgIconComponent
            color={palette.icon}
            width={iconSize}
            height={iconSize}
            viewBox={viewBox}
          />
        );
      }
      const CustomSvg = CUSTOM_SVGS[iconProp];
      if (CustomSvg) {
        return (
          <CustomSvg color={palette.icon} width={iconSize} height={iconSize} />
        );
      }
    }
    return null;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      style={[
        styles.container,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === "bordered" ? 1 : 0,
        },
        tagStyle,
      ]}
    >
      {/* ── Left icon ────────────────────────────────────── */}
      {iconLeft && (
        <TouchableOpacity
          onPress={onPressLeft}
          disabled={!onPressLeft}
          activeOpacity={onPressLeft ? 0.6 : 1}
          hitSlop={{ top: 6, bottom: 6, left: 8, right: 4 }}
        >
          {renderIcon(iconLeft)}
        </TouchableOpacity>
      )}

      {/* ── Label ────────────────────────────────────────── */}
      <Typography
        variant={labelVariant || "medium"}
        fontVariant={labelFontVariant}
        style={[styles.label, { color: palette.text }, labelStyle]}
      >
        {label}
      </Typography>

      {/* ── Right icon ───────────────────────────────────── */}
      {iconRight && (
        <TouchableOpacity
          onPress={onPressRight}
          disabled={!onPressRight}
          activeOpacity={onPressRight ? 0.6 : 1}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 8 }}
        >
          {renderIcon(iconRight)}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default Tag;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  label: {
    fontSize: 12,
    lineHeight: 18,
  },
});
