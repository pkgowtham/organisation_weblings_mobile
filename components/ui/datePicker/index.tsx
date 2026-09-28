import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  Modal,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  startOfDay,
  isWithinInterval,
} from "date-fns";
import { ArrowBackIos, ArrowForwardIos, CalendarToday } from "@/svg_icons";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import CustomButton from "../button";
import Input from "../textInput";

// ──────────────────────────────────────────────────────────────
//  DatePicker
//
//  Modes:
//    • single   — one Input trigger, one value
//    • range    — two Inputs (Start / End), date-range selection
//
//  Day cell states (per variant):
//    1. default      — normal day, no background
//    2. selected     — filled background (accent), white text
//    3. current date — accent border ring, accent text, no fill
//    4. disabled     — dimmed text (past dates / out-of-range)
//    5. in-range     — brand.surface.light track between start & end
//
//  Calendar layout (matches image):
//    • Two input fields inside modal for range mode
//    • Separate month nav (< January >) and year nav (< 2023 >)
//    • Week starts Monday: M T W T F S S
//    • "Done" button at bottom right
//
//  5 Colour Variants : brand · neutral · negative · warning · positive
//  2 Identifier Variants : circle · roundedSquare (4px)
//  Typography for day numbers : fontVariant="BS"
// ──────────────────────────────────────────────────────────────

export type DatePickerVariant =
  | "brand"
  | "neutral"
  | "negative"
  | "warning"
  | "positive";
export type IdentifierVariant = "circle" | "roundedSquare";
export type DatePickerMode = "single" | "range";

// ── Single-mode props ─────────────────────────────────────────
export interface DatePickerSingleProps {
  mode?: "single";
  /** Currently selected date.  Managed by parent. */
  value?: Date;
  /** Called when a date is selected. */
  onChange?: (date: Date) => void;
  // Range-only props must be absent
  startDate?: never;
  endDate?: never;
  onRangeChange?: never;
  startLabel?: never;
  endLabel?: never;
  startPlaceholder?: never;
  endPlaceholder?: never;
}

// ── Range-mode props ──────────────────────────────────────────
export interface DatePickerRangeProps {
  mode: "range";
  /** Start date of the range. */
  startDate?: Date;
  /** End date of the range. */
  endDate?: Date;
  /** Called when the range changes. */
  onRangeChange?: (start: Date | undefined, end: Date | undefined) => void;
  /** Label for the start input.  Default 'Start date'. */
  startLabel?: string;
  /** Label for the end input.  Default 'End date'. */
  endLabel?: string;
  /** Placeholder for start input. */
  startPlaceholder?: string;
  /** Placeholder for end input. */
  endPlaceholder?: string;
  // Single-only props must be absent
  value?: never;
  onChange?: never;
}

// ── Common props ──────────────────────────────────────────────
export interface DatePickerCommonProps {
  /** Colour variant.  Default 'brand'. */
  variant?: DatePickerVariant;
  /** Shape of the selected-day indicator.  Default 'circle'. */
  identifierVariant?: IdentifierVariant;
  /** Label above the input (single mode only). */
  label?: string;
  /** Placeholder text (single mode).  Default 'Select date'. */
  placeholder?: string;
  /** Input variant — 'default' or 'underlined'. */
  inputVariant?: "default" | "underlined";
  /** Helper text below the input. */
  helperText?: string;
  /** Error state. */
  error?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Minimum selectable date. */
  minDate?: Date;
  /** Maximum selectable date. */
  maxDate?: Date;
  /** Date display format (date-fns).  Default 'dd MMM yyyy'. */
  displayFormat?: string;
  /** Extra style for the container. */
  containerStyle?: any;
  /** Disable past dates automatically. Default false. */
  disablePast?: boolean;
  /** Custom right icon (overrides default calendar icon) */
  rightIcon?: React.ReactNode;
}

export type DatePickerProps = DatePickerCommonProps &
  (DatePickerSingleProps | DatePickerRangeProps);

// ── Per-variant accent colour ─────────────────────────────────
type VariantConfig = {
  accent: (theme: any) => string;
  lighter: (theme: any) => string;
  light: (theme: any) => string;
};

const VARIANT_CONFIG: Record<DatePickerVariant, VariantConfig> = {
  brand: {
    accent: (t) => t.colors.brand.surface.medium, // #0072C4
    lighter: (t) => t.colors.brand.surface.lighter, // #eff4ff
    light: (t) => t.colors.brand.surface.light, // #A8C8FE
  },
  neutral: {
    accent: (t) => t.colors.neutral.surface.inverse, // #151515
    lighter: (t) => t.colors.neutral.surface.light, // #f5f5f5
    light: (t) => t.colors.neutral.surface.medium, // #e0e0e0
  },
  negative: {
    accent: (t) => t.colors.negative.surface.medium, // #e00028
    lighter: (t) => t.colors.negative.surface.lighter, // #fef2f2
    light: (t) => t.colors.negative.surface.light, // #feb2b5
  },
  warning: {
    accent: (t) => t.colors.warning.surface.medium, // #b15600
    lighter: (t) => t.colors.warning.surface.lighter, // #fef2ef
    light: (t) => t.colors.warning.surface.light, // #feb69a
  },
  positive: {
    accent: (t) => t.colors.positive.surface.medium, // #008117
    lighter: (t) => t.colors.positive.surface.lighter, // #eef7ee
    light: (t) => t.colors.positive.surface.light, // #9ed49e
  },
};

// Week starts Monday
const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// ─────────────────────────────────────────────────────────────
const DatePicker: React.FC<DatePickerProps> = (props) => {
  const {
    variant = "brand",
    identifierVariant = "circle",
    label,
    placeholder = "Placeholder",
    inputVariant = "default",
    helperText,
    error = false,
    disabled = false,
    minDate,
    maxDate,
    displayFormat = "dd MMM yyyy",
    containerStyle,
    disablePast = false,
  } = props;

  const isRange = props.mode === "range";

  const { theme } = useTheme();
  const styles = createStyles(theme);
  const cfg = VARIANT_CONFIG[variant];
  const accentClr = cfg.accent(theme);
  const lighterClr = cfg.lighter(theme);
  const lightClr = cfg.light(theme); // for range track

  // ── Modal visibility ─────────────────────────────────────
  const [modalVisible, setModalVisible] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  // ── Range selection state (internal during picking) ───────
  // In range mode, we track which input is being selected
  const [rangeStep, setRangeStep] = useState<"start" | "end">("start");
  const [tempStart, setTempStart] = useState<Date | undefined>(undefined);
  const [tempEnd, setTempEnd] = useState<Date | undefined>(undefined);
  const [tempSingle, setTempSingle] = useState<Date | undefined>(undefined);

  // ── Animation values (matching Dialog pattern) ────────────
  const durationIn = theme.duration.d4 * 1000; // 300 ms
  const durationOut = theme.duration.d3 * 1000; // 150 ms

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;

  const [modalMounted, setModalMounted] = useState(false);

  useEffect(() => {
    if (modalVisible) {
      setModalMounted(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: durationIn,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: durationIn,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: durationOut,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: durationOut,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.88,
          duration: durationOut,
          useNativeDriver: true,
        }),
      ]).start(() => setModalMounted(false));
    }
  }, [modalVisible]);

  // ── Calendar grid generation (week starts Monday) ─────────
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Sunday

    const days: Date[] = [];
    let day = gridStart;
    while (day <= gridEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [viewDate]);

  // ── Month navigation ──────────────────────────────────────
  const goToPrevMonth = useCallback(() => {
    setViewDate((prev) => subMonths(prev, 1));
  }, []);
  const goToNextMonth = useCallback(() => {
    setViewDate((prev) => addMonths(prev, 1));
  }, []);

  // ── Year navigation ───────────────────────────────────────
  const goToPrevYear = useCallback(() => {
    setViewDate((prev) => subYears(prev, 1));
  }, []);
  const goToNextYear = useCallback(() => {
    setViewDate((prev) => addYears(prev, 1));
  }, []);

  // ── Day selection ─────────────────────────────────────────
  const handleDayPress = useCallback(
    (day: Date) => {
      if (!isRange) {
        // Single mode — track selection internally, wait for Done
        setTempSingle(day);
      } else {
        // Range mode
        if (rangeStep === "start") {
          setTempStart(day);
          if (tempEnd && isAfter(day, tempEnd)) {
            setTempEnd(undefined);
          }
          setRangeStep("end");
        } else {
          // If tapped date is before start, swap
          if (tempStart && isBefore(day, tempStart)) {
            setTempEnd(tempStart);
            setTempStart(day);
          } else {
            setTempEnd(day);
          }
          // Stay open — user presses Done
        }
      }
    },
    [isRange, rangeStep, tempStart, tempEnd, props],
  );

  // ── Open / close ──────────────────────────────────────────
  const openCalendar = () => {
    if (disabled) return;

    if (isRange) {
      const rp = props as DatePickerRangeProps;
      setTempStart(rp.startDate);
      setTempEnd(rp.endDate);
      setRangeStep(rp.startDate ? "end" : "start");
      setViewDate(rp.startDate ?? rp.endDate ?? new Date());
    } else {
      const sp = props as DatePickerSingleProps;
      setTempSingle(sp.value);
      setViewDate(sp.value ?? new Date());
    }
    setModalVisible(true);
  };

  const closeCalendar = () => {
    setModalVisible(false);
  };

  // ── Done handler ──────────────────────────────────────────
  const handleDone = () => {
    if (isRange) {
      (props as DatePickerRangeProps).onRangeChange?.(tempStart, tempEnd);
    } else {
      if (tempSingle) {
        (props as DatePickerSingleProps).onChange?.(tempSingle);
      }
    }
    setModalVisible(false);
  };

  // ── Get current selected values for display ───────────────
  const singleValue = !isRange
    ? (modalVisible ? tempSingle : (props as DatePickerSingleProps).value)
    : undefined;
  const rangeStart = isRange ? tempStart : undefined;
  const rangeEnd = isRange ? tempEnd : undefined;

  // External range values for the trigger inputs
  const extRangeStart = isRange
    ? (props as DatePickerRangeProps).startDate
    : undefined;
  const extRangeEnd = isRange
    ? (props as DatePickerRangeProps).endDate
    : undefined;

  // ── Formatted display values ──────────────────────────────
  const displayValue = singleValue ? format(singleValue, displayFormat) : "";

  const defaultPlaceholder = isRange ? "Select date range" : "Select date";
  const finalPlaceholder =
    placeholder === "Placeholder" ? defaultPlaceholder : placeholder;

  const getRangeDisplayValue = () => {
    if (!extRangeStart && !extRangeEnd) return "";
    const startStr = extRangeStart ? format(extRangeStart, displayFormat) : "";
    const endStr = extRangeEnd ? format(extRangeEnd, displayFormat) : "";
    return `${startStr} - ${endStr}`;
  };

  // ── Identifier shape ──────────────────────────────────────
  const DAY_CELL_SIZE = 36;
  const identifierRadius =
    identifierVariant === "circle"
      ? DAY_CELL_SIZE / 2
      : theme.borderRadius.b100; // 4

  const today = startOfDay(new Date());

  // ── Check if day is disabled ──────────────────────────────
  const isDayDisabled = (day: Date) => {
    const dayStart = startOfDay(day);
    if (disablePast && isBefore(dayStart, today)) return true;
    if (minDate && isBefore(dayStart, startOfDay(minDate))) return true;
    if (maxDate && isAfter(dayStart, startOfDay(maxDate))) return true;
    return false;
  };

  // ── Check if day is in range (between start & end) ────────
  const isDayInRange = (day: Date) => {
    const s = isRange ? rangeStart : undefined;
    const e = isRange ? rangeEnd : undefined;
    if (!s || !e) return false;
    return (
      isWithinInterval(startOfDay(day), {
        start: startOfDay(s),
        end: startOfDay(e),
      }) &&
      !isSameDay(day, s) &&
      !isSameDay(day, e)
    );
  };

  // ── Is start or end of range ──────────────────────────────
  const isRangeStart = (day: Date) =>
    rangeStart ? isSameDay(day, rangeStart) : false;
  const isRangeEnd = (day: Date) =>
    rangeEnd ? isSameDay(day, rangeEnd) : false;

  // ── Icon colour helper ────────────────────────────────────
  const iconColor = disabled
    ? theme.colors.neutral.onSurface.disabled
    : error
      ? theme.colors.negative.onSurface.light
      : theme.colors.neutral.onSurface.dark;

  return (
    <>
      {/* ── Input trigger(s) ─────────────────────────── */}
      {!isRange ? (
        // Single mode — one input
        <Pressable onPress={openCalendar} style={containerStyle}>
          <Input
            label={label}
            variant={inputVariant}
            placeholder={placeholder}
            value={displayValue}
            error={error}
            disabled={disabled}
            readOnly
            helperText={helperText}
            rightIcon={
              props.rightIcon !== undefined ? props.rightIcon : (
                <CalendarToday
                  width={20}
                  height={20}
                  color={iconColor}
                  viewBox="0 0 24 24"
                />
              )
            }
            onRightIconClick={openCalendar}
            editable={false}
            containerStyle={{ marginBottom: 0 }}
          />
        </Pressable>
      ) : (
        // Range mode — one input displaying "Start Date - End Date"
        <Pressable onPress={openCalendar} style={containerStyle}>
          <Input
            label={label}
            variant={inputVariant}
            placeholder={finalPlaceholder}
            value={getRangeDisplayValue()}
            error={error}
            disabled={disabled}
            readOnly
            helperText={helperText}
            rightIcon={
              props.rightIcon !== undefined ? props.rightIcon : (
                <CalendarToday
                  width={20}
                  height={20}
                  color={iconColor}
                  viewBox="0 0 24 24"
                />
              )
            }
            onRightIconClick={openCalendar}
            editable={false}
            containerStyle={{ marginBottom: 0 }}
          />
        </Pressable>
      )}

      {/* ── Calendar Modal ───────────────────────────── */}
      {modalMounted && (
        <Modal
          transparent
          visible={modalMounted}
          statusBarTranslucent
          animationType="none"
          onRequestClose={closeCalendar}
        >
          {/* ── Backdrop ──────────────────────────── */}
          <TouchableWithoutFeedback onPress={closeCalendar}>
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: theme.colors.neutral.overlay.dark,
                  opacity: backdropOpacity,
                },
              ]}
            />
          </TouchableWithoutFeedback>

          {/* ── Card container ────────────────────── */}
          <View style={styles.centreContainer} pointerEvents="box-none">
            <Animated.View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.neutral.surface.lighter,
                  borderRadius: theme.borderRadius.b400, // 16
                  opacity: cardOpacity,
                  transform: [{ scale: cardScale }],
                },
              ]}
            >
              {/* ── Range inputs inside modal ──── */}
              {isRange && (
                <View style={styles.modalInputRow}>
                  <Pressable
                    onPress={() => setRangeStep("start")}
                    style={styles.modalInputHalf}
                  >
                    <View pointerEvents="none">
                      <Input
                        label={
                          (props as DatePickerRangeProps).startLabel ??
                          "Start date"
                        }
                        variant="default"
                        placeholder={
                          (props as DatePickerRangeProps).startPlaceholder ??
                          "Placeholder"
                        }
                        value={
                          rangeStart ? format(rangeStart, displayFormat) : ""
                        }
                        readOnly
                        editable={false}
                        containerStyle={{ marginBottom: 0 }}
                        isActive={rangeStep === "start"}
                        wrapperStyle={
                          rangeStep === "start"
                            ? { borderColor: accentClr }
                            : undefined
                        }
                        style={{
                          color:
                            rangeStep === "start"
                              ? accentClr
                              : theme.colors.neutral.onSurface.light,
                        }}
                      />
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => setRangeStep("end")}
                    style={styles.modalInputHalf}
                  >
                    <View pointerEvents="none">
                      <Input
                        label={
                          (props as DatePickerRangeProps).endLabel ?? "End date"
                        }
                        variant="default"
                        placeholder={
                          (props as DatePickerRangeProps).endPlaceholder ??
                          "Placeholder"
                        }
                        value={rangeEnd ? format(rangeEnd, displayFormat) : ""}
                        readOnly
                        editable={false}
                        containerStyle={{ marginBottom: 0 }}
                        isActive={rangeStep === "end"}
                        wrapperStyle={
                          rangeStep === "end"
                            ? { borderColor: accentClr }
                            : undefined
                        }
                        style={{
                          color:
                            rangeStep === "end"
                              ? accentClr
                              : theme.colors.neutral.onSurface.light,
                        }}
                      />
                    </View>
                  </Pressable>
                </View>
              )}

              {/* ── Navigation: month + year ───── */}
              <View style={styles.navRow}>
                {/* Month nav */}
                <View style={styles.navGroup}>
                  <TouchableOpacity
                    onPress={goToPrevMonth}
                    style={styles.navBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <ArrowBackIos
                      width={14}
                      height={14}
                      color={theme.colors.neutral.onSurface.dark}
                      viewBox="0 0 24 24"
                    />
                  </TouchableOpacity>
                  <Typography
                    fontVariant="BS"
                    variant="semibold"
                    color="colors.neutral.onSurface.light"
                    style={styles.navLabel}
                  >
                    {format(viewDate, "MMMM")}
                  </Typography>
                  <TouchableOpacity
                    onPress={goToNextMonth}
                    style={styles.navBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <ArrowForwardIos
                      width={14}
                      height={14}
                      color={theme.colors.neutral.onSurface.dark}
                      viewBox="0 0 24 24"
                    />
                  </TouchableOpacity>
                </View>

                {/* Year nav */}
                <View style={styles.navGroup}>
                  <TouchableOpacity
                    onPress={goToPrevYear}
                    style={styles.navBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <ArrowBackIos
                      width={14}
                      height={14}
                      color={theme.colors.neutral.onSurface.dark}
                      viewBox="0 0 24 24"
                    />
                  </TouchableOpacity>
                  <Typography
                    fontVariant="BS"
                    variant="semibold"
                    color="colors.neutral.onSurface.light"
                    style={styles.navLabel}
                  >
                    {format(viewDate, "yyyy")}
                  </Typography>
                  <TouchableOpacity
                    onPress={goToNextYear}
                    style={styles.navBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <ArrowForwardIos
                      width={14}
                      height={14}
                      color={theme.colors.neutral.onSurface.dark}
                      viewBox="0 0 24 24"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Weekday labels ───────────────── */}
              <View style={styles.weekRow}>
                {WEEKDAY_LABELS.map((d, i) => (
                  <View key={`${d}-${i}`} style={styles.weekdayCellOuter}>
                    <Typography
                      fontVariant="BXS"
                      variant="semibold"
                      color="colors.neutral.onSurface.dark"
                    >
                      {d}
                    </Typography>
                  </View>
                ))}
              </View>

              {/* ── Day grid ─────────────────────── */}
              <View style={styles.dayGrid}>
                {calendarDays.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, viewDate);
                  const isToday = isSameDay(day, today);
                  const dayDisabled = isDayDisabled(day) || !isCurrentMonth;

                  // Selected state
                  const isSelected = isRange
                    ? isRangeStart(day) || isRangeEnd(day)
                    : singleValue
                      ? isSameDay(day, singleValue)
                      : false;

                  // In-range track
                  const inRange =
                    isRange && isDayInRange(day) && isCurrentMonth;

                  // Range edge flags for track shape
                  const isStart = isRange && isRangeStart(day);
                  const isEnd = isRange && isRangeEnd(day);

                  return (
                    <View key={idx} style={styles.dayCellOuter}>
                      {isRange &&
                        isCurrentMonth &&
                        (inRange || isStart || isEnd) && (
                          <View
                            style={[
                              styles.trackBackground,
                              {
                                backgroundColor: lighterClr,
                              },
                              inRange && {
                                left: 0,
                                right: 0,
                              },
                              isStart &&
                              rangeEnd && {
                                left: "50%",
                                right: 0,
                              },
                              isEnd &&
                              rangeStart && {
                                left: 0,
                                right: "50%",
                              },
                            ]}
                          />
                        )}
                      <TouchableOpacity
                        onPress={() => handleDayPress(day)}
                        disabled={dayDisabled}
                        activeOpacity={0.6}
                        style={[
                          styles.dayCell,
                          // Selected — filled accent
                          isSelected &&
                          isCurrentMonth && {
                            backgroundColor: accentClr,
                            borderRadius: identifierRadius,
                          },
                          // Current date — border only (when not selected)
                          !isSelected &&
                          isToday &&
                          isCurrentMonth && {
                            borderWidth: 1.5,
                            borderColor: accentClr,
                            borderRadius: identifierRadius,
                          },
                        ]}
                      >
                        <Typography
                          fontVariant="BS"
                          variant={
                            isSelected && isCurrentMonth
                              ? "semibold"
                              : isToday && isCurrentMonth
                                ? "semibold"
                                : "regular"
                          }
                          style={{
                            color:
                              isSelected && isCurrentMonth
                                ? theme.colors.neutral.onSurface.inverse // white on accent
                                : isToday && isCurrentMonth
                                  ? accentClr // accent text
                                  : dayDisabled
                                    ? theme.colors.neutral.onSurface.disabled // dimmed
                                    : theme.colors.neutral.onSurface.light, // normal
                          }}
                        >
                          {format(day, "d")}
                        </Typography>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* ── Done button ──────────────────── */}
              <View style={styles.doneRow}>
                <CustomButton
                  variant="primary"
                  title="Done"
                  size="xs"
                  onPress={handleDone}
                />
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </>
  );
};

// ──────────────────────────────────────────────────────────────
const createStyles = (theme: any) =>
  StyleSheet.create({
    centreContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24
    },
    card: {
      width: "100%",
      overflow: "hidden",
      padding: 16,
      // shadow
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },

    // ── Range trigger (outside modal) ───────────────────────
    rangeTriggerRow: {
      flexDirection: "row",
      gap: 12,
    },
    rangeTriggerInput: {
      flex: 1,
    },

    // ── Range inputs inside modal ───────────────────────────
    modalInputRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    modalInputHalf: {
      flex: 1,
    },

    // ── Navigation row ──────────────────────────────────────
    navRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    navGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    navBtn: {
      padding: 4,
    },
    navLabel: {
      minWidth: 50,
      textAlign: "center",
    },

    // ── Weekday row ─────────────────────────────────────────
    weekRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    weekdayCellOuter: {
      width: "14.28%",
      justifyContent: "center",
      alignItems: "center",
      height: 36,
    },

    // ── Day grid ────────────────────────────────────────────
    dayGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },

    // ── Outer cell — holds the range track background ───────
    dayCellOuter: {
      width: "14.28%",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    trackBackground: {
      position: "absolute",
      height: 36,
    },

    // ── Inner day cell — holds selected / today styling ─────
    dayCell: {
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    },

    // ── Done button row ─────────────────────────────────────
    doneRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
    },
  });

export default DatePicker;
