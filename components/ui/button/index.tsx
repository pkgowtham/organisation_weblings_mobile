import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import * as SvgIcons from '@/svg_icons';
import Svg, { Path } from 'react-native-svg';
import { Typography } from '../typography';
import { useTheme } from '@/context/CustomThemeContext';

const ICON_MAP: Record<string, keyof typeof SvgIcons> = {
  'add-circle-outline': 'AddCircleOutline',
  'chevron-right': 'ArrowForwardIos',
  'search': 'Search',
  'label': 'Label',
  'label-outline': 'Label',
  'close': 'Close',
  'mail-outline': 'EmailOutline',
};

const CUSTOM_SVGS: Record<string, (props: any) => React.JSX.Element> = {
  person: (props) => (
    <Svg width={props.width} height={props.height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z"
        fill={props.color}
      />
    </Svg>
  ),
  'person-outline': (props) => (
    <Svg width={props.width} height={props.height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5-4-8-4z"
        fill={props.color}
      />
    </Svg>
  ),
  notifications: (props) => (
    <Svg width={props.width} height={props.height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
        fill={props.color}
      />
    </Svg>
  ),
  settings: (props) => (
    <Svg width={props.width} height={props.height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"
        fill={props.color}
      />
    </Svg>
  ),
};

interface CustomButtonProps {
  title?: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?:
  // ── Brand ──────────────────────────────────────────
  | "primary"          // brand filled
  | "secondary"        // brand tonal
  | "outlineActive"    // brand outlined
  | "text"             // brand ghost / text-only
  // ── Neutral / Greyscale ────────────────────────────
  | "white"            // neutral filled
  | "dull"             // neutral tonal
  | "outline"          // neutral outlined
  | "neutralText"      // neutral ghost / text-only
  // ── Negative ───────────────────────────────────────
  | "negative"         // negative filled
  | "negativeTonal"    // negative tonal
  | "negativeOutline"  // negative outlined
  | "negativeText"     // negative ghost / text-only
  // ── Warning ────────────────────────────────────────
  | "warning"          // warning filled
  | "warningTonal"     // warning tonal
  | "warningOutline"   // warning outlined
  | "warningText"      // warning ghost / text-only
  // ── Positive ───────────────────────────────────────
  | "positive"         // positive filled
  | "disabledGreen"    // positive tonal  (legacy alias kept)
  | "positiveTonal"    // positive tonal
  | "positiveOutline"  // positive outlined
  | "positiveText"     // positive ghost / text-only
  // ── Utility ────────────────────────────────────────
  | "icon"             // icon-only circular button
  | "glassy"           // dark overlay button
  | "disabled";        // disabled state
  size?: "xs" | "small" | "post" | "medium" | "large";
  weightVariant?: 'light' | 'regular' | 'medium' | 'bold' | 'semibold' | 'extrabold';
  loading?: boolean;
  disabled?: boolean;
  pressDisabled?: boolean;
  iconLeft?: React.ReactNode | string;
  iconRight?: React.ReactNode | string;
  icon?: React.ReactNode | string;
  iconColor?: string;
  buttonStyle?: ViewStyle | any;
  textStyle?: TextStyle;
  loaderColor?: string;   // if omitted, inherits the variant's icon/text colour
  iconSize?: number;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  pressDisabled = false,
  iconLeft,
  iconRight,
  icon,
  iconColor,
  buttonStyle,
  textStyle,
  loaderColor,             // intentionally no default — falls back to getIconColor()
  iconSize = 24,
  weightVariant
}) => {
  const { theme } = useTheme();

  // Determine the effective variant based on disabled state
  const effectiveVariant = disabled ? "disabled" : variant;


  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: effectiveVariant === "icon" ? 40 : 8,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      height: 52,
      paddingVertical: 16,
      paddingHorizontal: 32,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      xs: { paddingVertical: 0, paddingHorizontal: 16, height: 32 },
      small: { paddingVertical: 0, paddingHorizontal: 12, height: 36, borderRadius: 4 },
      post: { paddingVertical: 0, paddingHorizontal: 12, height: 40, borderRadius: 8 },
      medium: { paddingVertical: 0, paddingHorizontal: 12, height: 52 },
      large: { paddingVertical: 20, paddingHorizontal: 40, height: 60 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      // ── Brand ──────────────────────────────────────────
      primary: { backgroundColor: theme.colors.brand.surface.medium },
      secondary: { backgroundColor: theme.colors.brand.surface.lighter },
      outlineActive: { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.colors.brand.border.medium },
      text: { backgroundColor: "transparent" },

      // ── Neutral / Greyscale ────────────────────────────
      white: { backgroundColor: theme.colors.neutral.surface.lighter },
      dull: { backgroundColor: theme.colors.neutral.surface.light },
      outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.colors.neutral.border.light },
      neutralText: { backgroundColor: "transparent" },

      // ── Negative ───────────────────────────────────────
      negative: { backgroundColor: theme.colors.negative.surface.medium },
      negativeTonal: { backgroundColor: theme.colors.negative.surface.lighter },
      negativeOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.colors.negative.border.medium },
      negativeText: { backgroundColor: "transparent" },

      // ── Warning ────────────────────────────────────────
      warning: { backgroundColor: theme.colors.warning.surface.medium },
      warningTonal: { backgroundColor: theme.colors.warning.surface.lighter },
      warningOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.colors.warning.border.medium },
      warningText: { backgroundColor: "transparent" },

      // ── Positive ───────────────────────────────────────
      positive: { backgroundColor: theme.colors.positive.surface.medium },
      disabledGreen: { backgroundColor: theme.colors.positive.surface.lighter },  // legacy alias
      positiveTonal: { backgroundColor: theme.colors.positive.surface.lighter },
      positiveOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.colors.positive.border.medium },
      positiveText: { backgroundColor: "transparent" },

      // ── Utility ────────────────────────────────────────
      glassy: { backgroundColor: theme.colors.neutral.overlay.dark },
      icon: { width: 52, paddingHorizontal: 0, justifyContent: "center", alignItems: "center" },
      disabled: { backgroundColor: theme.colors.neutral.surface.disabled },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[effectiveVariant],
    };
  };

  const getTextStyles = (): TextStyle => {
    const sizeFonts: Record<string, number> = {
      xs: 14,
      small: 14,
      post: 16,
      medium: 16,
      large: 16,
    };

    const lineHeight: Record<string, number> = {
      xs: 22,
      small: 22,
      post: 24,
      medium: 24,
      large: 24,
    };

    const variantTextColors: Record<string, string> = {
      // ── Brand ──────────────────────────────────────────
      primary: theme.colors.brand.onSurface.medium,
      secondary: theme.colors.brand.onSurface.light,
      outlineActive: theme.colors.brand.surface.medium,
      text: theme.colors.brand.onSurface.light,

      // ── Neutral / Greyscale ────────────────────────────
      white: theme.colors.neutral.onSurface.light,
      dull: theme.colors.neutral.onSurface.light,
      outline: theme.colors.neutral.onSurface.light,
      neutralText: theme.colors.neutral.onSurface.light,

      // ── Negative ───────────────────────────────────────
      negative: theme.colors.negative.onSurface.medium,
      negativeTonal: theme.colors.negative.onSurface.light,
      negativeOutline: theme.colors.negative.onSurface.light,
      negativeText: theme.colors.negative.onSurface.light,

      // ── Warning ────────────────────────────────────────
      warning: theme.colors.warning.onSurface.medium,
      warningTonal: theme.colors.warning.onSurface.light,
      warningOutline: theme.colors.warning.onSurface.light,
      warningText: theme.colors.warning.onSurface.light,

      // ── Positive ───────────────────────────────────────
      positive: theme.colors.positive.onSurface.medium,
      disabledGreen: theme.colors.positive.onSurface.light,   // legacy alias
      positiveTonal: theme.colors.positive.onSurface.light,
      positiveOutline: theme.colors.positive.onSurface.light,
      positiveText: theme.colors.positive.onSurface.light,

      // ── Utility ────────────────────────────────────────
      glassy: theme.colors.neutral.onSurface.inverse,
      icon: theme.colors.brand.surface.medium,
      disabled: theme.colors.neutral.onSurface.disabled,
    };

    return {
      fontSize: sizeFonts[size],
      lineHeight: lineHeight[size],
      color: variantTextColors[effectiveVariant],
      marginLeft: iconLeft ? 8 : 0,
      marginRight: iconRight ? 8 : 0,
    };
  };
  const getIconColor = (): string => {
    if (iconColor) return iconColor;

    const iconColorMap: Record<string, string> = {
      // ── Brand ──────────────────────────────────────────
      primary: theme.colors.brand.onSurface.medium,
      secondary: theme.colors.brand.onSurface.light,
      outlineActive: theme.colors.brand.surface.medium,
      text: theme.colors.brand.onSurface.light,

      // ── Neutral / Greyscale ────────────────────────────
      white: theme.colors.neutral.onSurface.light,
      dull: theme.colors.neutral.onSurface.inverse,
      outline: theme.colors.neutral.onSurface.light,
      neutralText: theme.colors.neutral.onSurface.light,

      // ── Negative ───────────────────────────────────────
      negative: theme.colors.negative.onSurface.medium,
      negativeTonal: theme.colors.negative.onSurface.light,
      negativeOutline: theme.colors.negative.onSurface.light,
      negativeText: theme.colors.negative.onSurface.light,

      // ── Warning ────────────────────────────────────────
      warning: theme.colors.warning.onSurface.medium,
      warningTonal: theme.colors.warning.onSurface.light,
      warningOutline: theme.colors.warning.onSurface.light,
      warningText: theme.colors.warning.onSurface.light,

      // ── Positive ───────────────────────────────────────
      positive: theme.colors.positive.onSurface.medium,
      disabledGreen: theme.colors.positive.onSurface.light,
      positiveTonal: theme.colors.positive.onSurface.light,
      positiveOutline: theme.colors.positive.onSurface.light,
      positiveText: theme.colors.positive.onSurface.light,

      // ── Utility ────────────────────────────────────────
      glassy: theme.colors.neutral.onSurface.inverse,
      icon: theme.colors.brand.surface.medium,
      disabled: theme.colors.neutral.onSurface.disabled,
    };

    return iconColorMap[effectiveVariant] ?? theme.colors.neutral.onSurface.inverse;
  };

  const renderIcon = (iconProp: React.ReactNode | string) => {
    if (React.isValidElement(iconProp)) {
      return iconProp;
    } else if (typeof iconProp === "string") {
      const mappedName = ICON_MAP[iconProp] || iconProp;
      const SvgIconComponent = SvgIcons[mappedName as keyof typeof SvgIcons];
      if (SvgIconComponent) {
        const viewBox = mappedName === 'CircleCheck' ? '0 0 56 57' : '0 0 24 24';
        return <SvgIconComponent color={getIconColor()} width={iconSize} height={iconSize} viewBox={viewBox} />;
      }
      const CustomSvg = CUSTOM_SVGS[iconProp];
      if (CustomSvg) {
        return <CustomSvg color={getIconColor()} width={iconSize} height={iconSize} />;
      }
    }
    return null;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={pressDisabled || loading || disabled}
      style={[getButtonStyles(), buttonStyle]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={loaderColor ?? getIconColor()} />
      ) : (
        <>
          {icon && effectiveVariant === "icon" ? (
            renderIcon(icon)
          ) : (
            <>
              {iconLeft && (
                renderIcon(iconLeft)
              )}
              {title && <Typography variant={weightVariant} style={[getTextStyles(), textStyle]}>{title}</Typography>}
              {iconRight && (
                renderIcon(iconRight)
              )}
            </>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;