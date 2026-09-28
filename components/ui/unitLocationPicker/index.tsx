import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Dimensions,
} from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import { ChevronDown, ArrowBackIos } from "@/svg_icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface PickerOption {
  value: string;
  label: string;
}

export interface UnitLocationPickerProps {
  units: PickerOption[];
  locations: PickerOption[];
  selectedUnit?: string;
  selectedLocation?: string;
  onUnitChange?: (unit: string) => void;
  onLocationChange?: (location: string) => void;
  placeholderUnit?: string;
  placeholderLocation?: string;
  containerStyle?: any;
  disabled?: boolean;
}

export const UnitLocationPicker: React.FC<UnitLocationPickerProps> = ({
  units,
  locations,
  selectedUnit,
  selectedLocation,
  onUnitChange,
  onLocationChange,
  placeholderUnit = "Select unit",
  placeholderLocation = "Select location",
  containerStyle,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'unit' | 'location'>('unit');
  const triggerRef = useRef<View>(null);

  const [layout, setLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Whenever opened, decide which view to show
  const handlePressTrigger = () => {
    if (disabled) return;
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setLayout({
        x: pageX,
        y: pageY,
        width,
        height,
      });
      // If we have a unit but no location, show locations.
      // If we have both, show locations (or units, user can switch).
      if (selectedUnit && !selectedLocation) {
        setView('location');
      } else if (!selectedUnit) {
        setView('unit');
      } else {
        setView('location');
      }
      setIsOpen(true);
    });
  };

  const handleSelectOption = (value: string) => {
    if (view === 'unit') {
      onUnitChange?.(value);
      // Stay open and switch to location view
      setView('location');
    } else {
      onLocationChange?.(value);
      setIsOpen(false);
    }
  };

  const selectedUnitLabel = units.find((u) => u.value === selectedUnit)?.label;
  const selectedLocationLabel = locations.find((l) => l.value === selectedLocation)?.label;

  const currentOptions = view === 'unit' ? units : locations;
  const currentValue = view === 'unit' ? selectedUnit : selectedLocation;

  // Position logic
  const isDropdownBelow = layout.y + layout.height + 220 < SCREEN_HEIGHT;
  const dropdownTop = isDropdownBelow
    ? layout.y + layout.height + 8
    : layout.y - Math.min((currentOptions.length + 1) * 44 + 12, 220) - 8;

  const minDropdownWidth = 240;
  const dropdownWidth = Math.max(layout.width, minDropdownWidth);
  const dropdownLeft = Math.min(layout.x, SCREEN_WIDTH - dropdownWidth - 16);

  return (
    <View style={[styles.container, containerStyle]}>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={disabled}
          onPress={handlePressTrigger}
          style={styles.triggerContainer}
        >
          <View style={styles.triggerContent}>
            <View style={styles.textBlock}>
              <Typography
                fontVariant="BM"
                variant="medium"
                color="colors.neutral.onSurface.dark"
                numberOfLines={1}
                style={styles.unitText}
              >
                {selectedUnitLabel || placeholderUnit}
              </Typography>
              <Typography
                fontVariant="BXS"
                color={selectedLocationLabel ? "colors.neutral.onSurface.medium" : "colors.neutral.onSurface.light"}
                numberOfLines={1}
                style={styles.locationText}
              >
                {selectedLocationLabel || placeholderLocation}
              </Typography>
            </View>
            <View style={[styles.arrowContainer, isOpen && styles.arrowRotated]}>
              <ChevronDown
                width={20}
                height={20}
                color={theme.colors.neutral.onSurface.dark}
                viewBox="0 0 24 24"
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {isOpen && (
        <Modal
          transparent
          visible={isOpen}
          animationType="none"
          onRequestClose={() => setIsOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>

            <View
              style={[
                styles.dropdownCard,
                {
                  top: dropdownTop,
                  left: dropdownLeft,
                  width: dropdownWidth,
                  borderColor: theme.colors.neutral.border.light,
                  backgroundColor: theme.colors.neutral.surface.lighter,
                  maxHeight: 250,
                },
              ]}
            >
              {view === 'location' && selectedUnit && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setView('unit')}
                  style={styles.backHeader}
                >
                  <ArrowBackIos width={14} height={14} color={theme.colors.neutral.onSurface.medium} viewBox="0 0 24 24" />
                  <Typography
                    fontVariant="BS"
                    color="colors.neutral.onSurface.medium"
                    style={styles.backHeaderText}
                  >
                    Change Unit
                  </Typography>
                </TouchableOpacity>
              )}
              <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
              >
                {currentOptions.map((option) => {
                  const isSelected = option.value === currentValue;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.7}
                      onPress={() => handleSelectOption(option.value)}
                      style={[
                        styles.optionRow,
                        { borderBottomColor: theme.colors.neutral.border.lighter },
                        isSelected && { backgroundColor: theme.colors.brand.surface.lighter },
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.selectedStripe,
                            { backgroundColor: theme.colors.brand.surface.medium },
                          ]}
                        />
                      )}
                      <Typography
                        fontVariant="BS"
                        color="colors.neutral.onSurface.light"
                        variant={isSelected ? "semibold" : "regular"}
                        style={styles.optionLabel}
                        numberOfLines={2}
                      >
                        {option.label}
                      </Typography>
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
    },
    triggerContainer: {
      paddingVertical: theme.spacing.s100,
      paddingHorizontal: theme.spacing.s100,
    },
    triggerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    textBlock: {
      flex: 1,
      marginRight: 12,
    },
    unitText: {
      // no specific flex needed here anymore, textBlock handles it
    },
    locationText: {
      marginTop: 2,
    },
    arrowContainer: {
      marginLeft: 4,
      justifyContent: "center",
      alignItems: "center",
      width: 20,
      height: 20,
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
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 6,
    },
    backHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.s300,
      paddingVertical: theme.spacing.s200,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      backgroundColor: theme.colors.neutral.surface.light,
    },
    backHeaderText: {
      marginLeft: 6,
    },
    scrollContent: {
      paddingVertical: 4,
    },
    optionRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.s300,
      paddingVertical: 8,
      position: "relative",
    },
    selectedStripe: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
    },
    optionLabel: {
      flex: 1,
    },
  });

export default UnitLocationPicker;
