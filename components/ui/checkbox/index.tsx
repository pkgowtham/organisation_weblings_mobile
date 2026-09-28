import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import Svg, { Path } from 'react-native-svg';

type CheckboxProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  disabled?: boolean;
};

export default function Checkbox({
  value,
  onValueChange,
  size = 'md',
  color,
  disabled = false,
}: CheckboxProps) {
  const { theme } = useTheme();
  
  const getSize = () => {
    switch (size) {
      case 'sm': return 20;
      case 'lg': return 28;
      default: return 24;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 20;
      default: return 16;
    }
  };

  const checkboxColor = color || theme.colors.brand.surface.light;
  const checkboxSize = getSize();
  const iconSize = getIconSize();

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={({ pressed }) => [
        styles.checkbox,
        {
          width: checkboxSize,
          height: checkboxSize,
          borderRadius: checkboxSize * 0.2,
          borderColor: value ? checkboxColor : theme.colors.neutral.border.light,
          backgroundColor: value ? checkboxColor : 'transparent',
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
      disabled={disabled}
    >
      {value && (
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
            fill="white"
          />
        </Svg>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});