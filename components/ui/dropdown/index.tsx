import React, { useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import { ChevronDown, Close } from "@/svg_icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface DropdownOption {
  value: string;
  label: string;
  badgeText?: string;       // "E", "S", "T", "B", "P", etc.
  badgeColor?: string;      // Hex color or theme color name
  avatarIcon?: React.ReactNode; // Custom SVG icon/avatar
  isAvatarCircle?: boolean; // Whether the badge/avatar should be fully circular
}

export interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  multiple?: boolean;
  selectedValues?: string[];
  onValuesChange?: (values: string[]) => void;
  error?: boolean | string;
  helperText?: string;
  disabled?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  onEndReached?: () => void;
  onPress?: () => void;
  selectedOptionTextStyle?: any;
  arrowColor?: string;
  hideTriggerBadge?: boolean;
  hideClearIcon?: boolean;
  customTrigger?: React.ReactNode;
  minDropdownWidth?: number;
  defaultOpen?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = "Select an option",
  options,
  selectedValue,
  onValueChange,
  multiple = false,
  selectedValues = [],
  onValuesChange,
  error = false,
  helperText,
  disabled = false,
  containerStyle,
  inputStyle,
  onEndReached,
  onPress,
  selectedOptionTextStyle,
  arrowColor,
  hideTriggerBadge = false,
  hideClearIcon = false,
  customTrigger,
  minDropdownWidth = 240,
  defaultOpen = false,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<View>(null);

  // Layout positioning state for floating dropdown
  const [layout, setLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const selectedOption = multiple ? undefined : options.find((opt) => opt.value === selectedValue);
  const selectedOptions = multiple ? options.filter((opt) => selectedValues.includes(opt.value)) : [];

  React.useEffect(() => {
    if (defaultOpen && triggerRef.current) {
      // Small timeout to ensure layout is measured
      setTimeout(() => {
        handlePressTrigger();
      }, 50);
    }
  }, [defaultOpen]);

  const handlePressTrigger = () => {
    if (disabled) return;
    if (onPress) {
      onPress();
    }

    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setLayout({
        x: pageX,
        y: pageY,
        width,
        height,
      });
      setIsOpen(true);
    });
  };

  const handleSelectOption = (value: string) => {
    if (multiple) {
      if (selectedValues.includes(value)) {
        onValuesChange?.(selectedValues.filter(v => v !== value));
      } else {
        onValuesChange?.([...selectedValues, value]);
      }
    } else {
      onValueChange?.(value);
      setIsOpen(false);
    }
  };

  const isCloseToBottom = (nativeEvent: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 40; // generous threshold
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const handleScrollCheck = (event: any) => {
    if (isCloseToBottom(event.nativeEvent) && onEndReached) {
      onEndReached();
    }
  };

  // Determine active border / accent color
  const accentColor = (() => {
    if (disabled) return theme.colors.neutral.border.disabled;
    if (error) return theme.colors.negative.border.medium;
    if (isOpen) return theme.colors.brand.border.medium;
    return theme.colors.neutral.border.light;
  })();

  const bgColor = disabled
    ? theme.colors.neutral.surface.disabled
    : theme.colors.neutral.surface.lighter;

  // Render the badge/avatar of an option
  const renderBadge = (option: DropdownOption) => {
    if (option.avatarIcon) {
      return (
        <View style={[styles.badgeBase, styles.avatarContainer]}>
          {option.avatarIcon}
        </View>
      );
    }

    if (option.badgeText) {
      const isCircle = option.isAvatarCircle;
      return (
        <View
          style={[
            styles.badgeBase,
            isCircle ? styles.avatarCircle : styles.badgeSquare,
            { backgroundColor: option.badgeColor || theme.colors.brand.surface.medium },
          ]}
        >
          <Typography
            fontVariant="LXS"
            variant="bold"
            color="#ffffff"
            style={styles.badgeText}
          >
            {option.badgeText}
          </Typography>
        </View>
      );
    }

    return null;
  };

  // Position logic for dropdown card
  const isDropdownBelow = layout.y + layout.height + 220 < SCREEN_HEIGHT;
  const dropdownTop = isDropdownBelow
    ? layout.y + layout.height + 2
    : layout.y - Math.min(options.length * 48 + 12, 220) - 2;

  const dropdownWidth = Math.max(layout.width, minDropdownWidth);
  const dropdownLeft = Math.min(layout.x, SCREEN_WIDTH - dropdownWidth - 16);

  return (
    <View style={[styles.container, containerStyle]}>
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

      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={disabled}
          onPress={handlePressTrigger}
          style={[
            !customTrigger && styles.inputWrapper,
            !customTrigger && {
              borderColor: accentColor,
              backgroundColor: bgColor,
            },
            inputStyle,
          ]}
        >
          {customTrigger ? customTrigger : (
            <>
              {multiple ? (
                selectedOptions.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginRight: 8 }}>
                    {selectedOptions.map(opt => (
                      <View key={opt.value} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.neutral.surface.medium, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6 }}>
                        {renderBadge(opt)}
                        <Typography fontVariant="BS" color="colors.neutral.onSurface.light">{opt.label}</Typography>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Typography
                    fontVariant="BS"
                    color="colors.neutral.onSurface.dark"
                    style={styles.placeholder}
                    numberOfLines={1}
                  >
                    {placeholder}
                  </Typography>
                )
              ) : (
                selectedOption ? (
                  <View style={styles.selectedRowContainer}>
                    {!hideTriggerBadge && renderBadge(selectedOption)}
                    <Typography
                      fontVariant="BS"
                      color={
                        disabled
                          ? "colors.neutral.onSurface.disabled"
                          : "colors.neutral.onSurface.light"
                      }
                      style={[styles.selectedText, selectedOptionTextStyle]}
                      numberOfLines={1}
                    >
                      {selectedOption.label}
                    </Typography>
                  </View>
                ) : (
                  <Typography
                    fontVariant="BS"
                    color="colors.neutral.onSurface.dark"
                    style={styles.placeholder}
                    numberOfLines={1}
                  >
                    {placeholder}
                  </Typography>
                )
              )}

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {!hideClearIcon && ((multiple && selectedOptions.length > 0) || (!multiple && selectedOption)) && (
                  <TouchableOpacity
                    onPress={(e) => {
                      if (multiple) {
                        onValuesChange?.([]);
                      } else {
                        onValueChange?.("");
                      }
                    }}
                    style={{ padding: 4 }}
                  >
                    <Close width={16} height={16} color={theme.colors.neutral.onSurface.dark} viewBox="0 0 24 24" />
                  </TouchableOpacity>
                )}
                <View style={[styles.arrowContainer, isOpen && styles.arrowRotated]}>
                  <ChevronDown
                    width={20}
                    height={20}
                    color={
                      disabled
                        ? theme.colors.neutral.onSurface.disabled
                        : arrowColor || theme.colors.neutral.onSurface.dark
                    }
                    viewBox="0 0 24 24"
                  />
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>

      {(helperText || (typeof error === "string" && error)) ? (
        <Typography
          fontVariant="BXS"
          color={error ? "colors.negative.onSurface.light" : "colors.neutral.onSurface.medium"}
          style={{ marginTop: 4 }}
        >
          {typeof error === "string" ? error : helperText}
        </Typography>
      ) : null}

      {/* Floating Dropdown Modal Overlay */}
      {isOpen && (
        <Modal
          transparent
          visible={isOpen}
          animationType="none"
          onRequestClose={() => setIsOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            {/* Backdrop dismiss area — behind the dropdown card */}
            <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>

            {/* Dropdown card is OUTSIDE TouchableWithoutFeedback so scroll gestures are not swallowed */}
            <View
              style={[
                styles.dropdownCard,
                {
                  top: dropdownTop,
                  left: dropdownLeft,
                  width: dropdownWidth,
                  borderColor: theme.colors.neutral.border.light,
                  backgroundColor: theme.colors.neutral.surface.lighter,
                  maxHeight: 220,
                },
              ]}
            >
              <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScrollCheck}
                onMomentumScrollEnd={handleScrollCheck}
                onScrollEndDrag={handleScrollCheck}
                scrollEventThrottle={16}
              >
                {options.map((option) => {
                  const isSelected = multiple ? selectedValues.includes(option.value) : option.value === selectedValue;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.7}
                      onPress={() => handleSelectOption(option.value)}
                      style={[
                        styles.optionRow,
                        {
                          borderBottomColor: theme.colors.neutral.border.lighter,
                        },
                        isSelected && {
                          backgroundColor: theme.colors.brand.surface.lighter,
                        },
                      ]}
                    >
                      {/* Blue selection stripe on the left edge */}
                      {isSelected && (
                        <View
                          style={[
                            styles.selectedStripe,
                            { backgroundColor: theme.colors.brand.surface.medium },
                          ]}
                        />
                      )}

                      <View style={styles.optionContent}>
                        {renderBadge(option)}
                        <Typography
                          fontVariant="BS"
                          color="colors.neutral.onSurface.light"
                          variant={isSelected ? "semibold" : "regular"}
                          style={styles.optionLabel}
                          numberOfLines={1}
                        >
                          {option.label}
                        </Typography>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: "100%",
      flexDirection: "column",
      marginBottom: theme.spacing.s400,
    },
    label: {
      fontSize: theme.fontSize.LS.size,
      fontWeight: "500",
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
    selectedRowContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    selectedText: {
      flex: 1,
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
      backgroundColor: "transparent",
    },
    dropdownCard: {
      position: "absolute",
      borderRadius: 8,
      borderWidth: 1,
      overflow: "hidden",
      // shadows
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 6,
    },
    scrollContent: {
      paddingVertical: 4,
    },
    optionRow: {
      height: 44,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.s300,
      position: "relative",
    },
    selectedStripe: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
    },
    optionContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    optionLabel: {
      flex: 1,
    },
    badgeBase: {
      width: 20,
      height: 20,
      marginRight: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarContainer: {
      borderRadius: 10,
      backgroundColor: "#e0e0e0",
      overflow: "hidden",
    },
    avatarCircle: {
      borderRadius: 10,
    },
    badgeSquare: {
      borderRadius: 4,
    },
    badgeText: {
      fontSize: 10,
      lineHeight: 11,
    },
  });

export default Dropdown;
