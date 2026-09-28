import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";

// Predefined color options matching the design
export const COLOR_OPTIONS = [
  { key: "negative", hex: "#e00028" },
  { key: "warning", hex: "#b15600" },
  { key: "positive", hex: "#008117" },
  { key: "brand", hex: "#0072C4" },
  { key: "info", hex: "#9e29fe" },
  { key: "neutral", hex: "#8d8d8d" },
];

export interface ColorPickerProps {
  /** Currently selected color hex */
  selectedColor: string;
  /** Called when a color is selected */
  onColorChange: (hex: string) => void;
  /** Extra styles for the outer container */
  containerStyle?: any;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
  containerStyle,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, containerStyle]}>
      {COLOR_OPTIONS.map((color) => {
        const isSelected = selectedColor === color.hex;
        return (
          <TouchableOpacity
            key={color.key}
            activeOpacity={0.7}
            onPress={() => onColorChange(color.hex)}
            style={[
              styles.colorCircleOuter,
              isSelected && {
                borderColor: color.hex,
                borderWidth: 2,
              },
            ]}
          >
            <View
              style={[
                styles.colorCircle,
                { backgroundColor: color.hex },
                isSelected && styles.colorCircleSelected,
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.s400,
    },
    colorCircleOuter: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.b200,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
    colorCircle: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.b150,
    },
    colorCircleSelected: {
      width: 28,
      height: 28,
      borderRadius: theme.borderRadius.b150,
    },
  });

export default ColorPicker;
