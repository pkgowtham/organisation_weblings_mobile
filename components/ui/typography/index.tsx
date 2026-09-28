import React from 'react';
import {
  Text as DefaultText,
  TextProps as DefaultTextProps,
  StyleProp,
  TextStyle,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/CustomThemeContext';

type FontWeight = 'light' | 'regular' | 'medium' | 'bold' | 'semibold' | 'extrabold';
type TextAlign = 'auto' | 'left' | 'right' | 'center' | 'justify';

type FontVariant =
  | 'DM'
  | 'HM'
  | 'HS'
  | 'TM'
  | 'TS'
  | 'BL'
  | 'BM'
  | 'BS'
  | 'BXS'
  | 'LM'
  | 'LS'
  | 'LXS';

export interface TypographyProps extends DefaultTextProps {
  variant?: FontWeight;          // weight
  fontVariant?: FontVariant;     // size variant from theme.fontSize
  align?: TextAlign;
  color?: string;
  size?: number;                 // manual override
  lineHeight?: number;           // manual override
  gradient?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'regular',
  fontVariant,
  align,
  color,
  size,
  lineHeight,
  style,
  gradient,
  ...props
}) => {
  const { theme } = useTheme();

  const fontFamily = {
    light: 'OpenSansLight',
    regular: 'OpenSansRegular',
    medium: 'OpenSansMedium',
    bold: 'OpenSansBold',
    semibold: 'OpenSansSemi',
    extrabold: 'OpenSansExtra',
  }[variant];

  // pull size + lineHeight from theme if fontVariant is provided
  const variantStyles = fontVariant ? theme.fontSize[fontVariant] : undefined;

  const resolveColor = (colorPath?: string) => {
    if (!colorPath) return undefined;
    if (colorPath.startsWith('#')) return colorPath;
    const pathParts = colorPath.split('.');
    let result: any = theme;
    for (const part of pathParts) {
      if (result[part] === undefined) {
        console.warn(`Color path "${colorPath}" not found in theme`);
        return undefined;
      }
      result = result[part];
    }
    return result;
  };

  const textStyle: StyleProp<TextStyle> = [
    { fontFamily },
    align && { textAlign: align },
    !gradient && color && { color: resolveColor(color) },
    variantStyles && { fontSize: variantStyles.size, lineHeight: variantStyles.lineHeight },
    size && { fontSize: size }, // manual overrides
    lineHeight !== undefined && { lineHeight },
    style,
  ];

  if (gradient) {
    return (
      <MaskedView maskElement={<DefaultText {...props} style={textStyle} />}>
        <LinearGradient
          colors={theme.brandColorGradient.colors}
          start={theme.brandColorGradient.start}
          end={theme.brandColorGradient.end}
        >
          <DefaultText {...props} style={[textStyle, { opacity: 0 }]}>
            {props.children}
          </DefaultText>
        </LinearGradient>
      </MaskedView>
    );
  }

  return <DefaultText {...props} style={textStyle} />;
};

// weight-specific shortcuts
export const LightText = (props: TypographyProps) => <Typography variant="light" {...props} />;
export const RegularText = (props: TypographyProps) => <Typography variant="regular" {...props} />;
export const MediumText = (props: TypographyProps) => <Typography variant="medium" {...props} />;
export const BoldText = (props: TypographyProps) => <Typography variant="bold" {...props} />;
export const SemiBoldText = (props: TypographyProps) => <Typography variant="semibold" {...props} />;
export const ExtraBoldText = (props: TypographyProps) => <Typography variant="extrabold" {...props} />;
