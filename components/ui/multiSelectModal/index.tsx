import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import { ArrowDropDown } from "@/svg_icons";
import Avatar from "../avatar";

export interface MultiSelectOption {
  id: string;
  name: string;
  image?: string;
  subtitle?: string;
  color?: string;
  originalObject?: any;
}

export interface MultiSelectModalProps {
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  selectedItems: any[];
  onSelectionChange: (items: any[]) => void;
  disabled?: boolean;
}

const MultiSelectModal: React.FC<MultiSelectModalProps> = ({
  label,
  placeholder = "Select options...",
  options,
  selectedItems,
  onSelectionChange,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleToggleOption = (option: MultiSelectOption) => {
    const isSelected = selectedItems.some((item: any) => item.id === option.id);
    if (isSelected) {
      onSelectionChange(selectedItems.filter((item: any) => item.id !== option.id));
    } else {
      onSelectionChange([...selectedItems, option.originalObject || option]);
    }
  };

  const selectedCount = selectedItems.length;

  return (
    <View style={styles.container}>
      {label && (
        <Typography
          fontVariant="LS"
          variant="medium"
          color="colors.neutral.onSurface.light"
          style={styles.label}
        >
          {label}
        </Typography>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        onPress={toggleOpen}
        style={[
          styles.inputWrapper,
          {
            borderColor: isOpen ? theme.colors.brand.border.medium : theme.colors.neutral.border.light,
            backgroundColor: disabled ? theme.colors.neutral.surface.disabled : theme.colors.neutral.surface.lighter,
          },
        ]}
      >
        <Typography
          fontVariant="BS"
          color={selectedCount > 0 ? "colors.neutral.onSurface.light" : "colors.neutral.onSurface.dark"}
          style={styles.placeholder}
          numberOfLines={1}
        >
          {selectedCount > 0 ? `${selectedCount} item(s) selected` : placeholder}
        </Typography>

        <View style={[styles.arrowContainer, isOpen && styles.arrowRotated]}>
          <ArrowDropDown
            width={20}
            height={20}
            color={
              disabled
                ? theme.colors.neutral.onSurface.disabled
                : theme.colors.neutral.onSurface.dark
            }
          />
        </View>
      </TouchableOpacity>

      <Modal
        transparent
        visible={isOpen}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={[styles.modalContent, { backgroundColor: theme.colors.neutral.surface.lighter }]}>
            <View style={styles.modalHeader}>
              <Typography fontVariant="LS" variant="semibold" color="colors.neutral.onSurface.light">
                {label || "Select Options"}
              </Typography>
            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {options.map((option) => {
                const isSelected = selectedItems.some((item: any) => item.id === option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.7}
                    onPress={() => handleToggleOption(option)}
                    style={[
                      styles.optionRow,
                      { borderBottomColor: theme.colors.neutral.border.lighter },
                      isSelected && { backgroundColor: theme.colors.brand.surface.lighter },
                    ]}
                  >
                    <View style={styles.optionContent}>
                      {option.image ? (
                        <Avatar source={{ uri: option.image }} name={option.name} size="sm" style={styles.avatar} />
                      ) : option.color ? (
                        <View style={[styles.colorBadge, { backgroundColor: option.color }]} />
                      ) : null}
                      <View style={styles.textContainer}>
                        <Typography
                          fontVariant="BS"
                          color="colors.neutral.onSurface.light"
                          variant={isSelected ? "semibold" : "regular"}
                        >
                          {option.name}
                        </Typography>
                        {option.subtitle && (
                          <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                            {option.subtitle}
                          </Typography>
                        )}
                      </View>
                    </View>
                    <View style={styles.checkboxContainer}>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: isSelected ? theme.colors.brand.surface.medium : theme.colors.neutral.border.medium,
                            backgroundColor: isSelected ? theme.colors.brand.surface.medium : "transparent",
                          },
                        ]}
                      >
                        {isSelected && <Text style={{ color: "white", fontSize: 10, textAlign: "center" }}>✓</Text>}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: "100%",
      marginBottom: theme.spacing.s400,
    },
    label: {
      marginBottom: theme.spacing.s200 - 2,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderRadius: theme.borderRadius.b200,
      height: 44,
      paddingLeft: theme.spacing.s300,
      paddingRight: theme.spacing.s200,
    },
    placeholder: {
      flex: 1,
    },
    arrowContainer: {
      justifyContent: "center",
      alignItems: "center",
      width: 24,
      height: 24,
    },
    arrowRotated: {
      transform: [{ rotate: "180deg" }],
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "85%",
      maxHeight: "70%",
      borderRadius: 12,
      overflow: "hidden",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#E0E0E0",
    },
    scrollView: {
      width: "100%",
    },
    scrollContent: {
      paddingBottom: 16,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
    },
    optionContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatar: {
      marginRight: 12,
    },
    colorBadge: {
      width: 20,
      height: 20,
      borderRadius: 4,
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    checkboxContainer: {
      marginLeft: 12,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default MultiSelectModal;
