import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { RegularText, SemiBoldText } from '../typography';
import SvgCircleCheck from '@/svg_icons/CircleCheck';
import SvgImportant from '@/svg_icons/Important';
import SvgGoal from '@/svg_icons/Goal';
import SvgClose from '@/svg_icons/Close';

type ToastVariant = 'neutral' | 'success' | 'info' | 'warning' | 'error' | 'report';
type IconType = 'checkmark' | 'success' | 'info' | 'warning' | 'error' | 'none';

interface ToastProps {
  variant?: ToastVariant;
  iconType?: IconType;
  title: string;
  message?: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  variant = 'neutral',
  iconType = 'none',
  title,
  message,
  onClose
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const backgroundColors: Record<ToastVariant, string> = {
    neutral: theme.colors.neutral.surface.inverse,  // #151515
    success: theme.colors.positive.surface.medium,  // #008117
    info: theme.colors.brand.surface.medium,        // #0072C4
    warning: theme.colors.warning.surface.medium,   // #b15600
    error: theme.colors.negative.surface.medium,    // #e00028
    report: theme.colors.negative.surface.medium,   // #e00028
  };

  const iconColors: Record<ToastVariant, string> = {
    neutral: theme.colors.neutral.surface.inverse,  // dark icon on white circle
    success: theme.colors.positive.surface.medium,
    info: theme.colors.brand.surface.medium,
    warning: theme.colors.warning.surface.medium,
    error: theme.colors.negative.surface.medium,
    report: theme.colors.negative.surface.medium,
  };

  const iconNames: any = {
    checkmark: <SvgCircleCheck color={iconColors[variant]} width={18} height={18} viewBox='0 0 56 57' />,
    success: <SvgCircleCheck color={iconColors[variant]} width={18} height={18} viewBox='0 0 56 57' />,
    info: <SvgImportant color={iconColors[variant]} width={18} height={18} viewBox='0 0 24 24' />,
    warning: <SvgGoal color={iconColors[variant]} width={18} height={18} viewBox='0 0 24 24' />,
    error: <SvgClose color={iconColors[variant]} width={18} height={18} viewBox='0 0 24 24' />,
    none: '',
  };

  // Resolve static white from the active theme
  const staticWhite = theme.colors.neutral.surface.lighter === '#ffffff'
    ? theme.colors.neutral.surface.lighter
    : theme.colors.neutral.surface.inverse;

  const isNeutral = variant === 'neutral';
  const textColor = isNeutral ? theme.colors.neutral.onSurface.inverse : staticWhite;
  const iconWrapperBg = isNeutral ? theme.colors.neutral.onSurface.inverse : staticWhite;
  const closeIconColor = isNeutral ? theme.colors.neutral.onSurface.inverse : staticWhite;

  return (
    <View style={[
      styles.toastContainer,
      { backgroundColor: backgroundColors[variant] }
    ]}>
      {iconType !== 'none' && (
        <View style={[styles.iconWrapper, { backgroundColor: iconWrapperBg }]}>
          {iconNames[iconType]}
        </View>
      )}

      <View style={styles.textContainer}>
        <SemiBoldText numberOfLines={3} size={16} style={{ color: textColor, marginVertical: 4 }}>
          {title}
        </SemiBoldText>
        {message &&
          <RegularText numberOfLines={3} size={14} style={{ color: textColor, marginVertical: 4 }}>
            {message}
          </RegularText>
        }
      </View>

      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <SvgClose width={18} height={18} color={closeIconColor} />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    toastContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      padding: 12,
      width: '95%',
      marginBottom: 20,
      shadowColor: theme.colors.neutral.surface.inverse,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    iconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    closeBtn: {
      padding: 4,
      marginLeft: 8,
    },
  });

export default Toast;