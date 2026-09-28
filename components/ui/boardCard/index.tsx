import React, { useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  PanResponder,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import Tag from "../tag";
import { MoreVert } from "@/svg_icons";
import Svg, { Path } from "react-native-svg";
import { CheckIcon } from "../dragDrop/icons";
import { Image } from "expo-image";

export interface BoardTask {
  id: string;
  name: string;
  status: any;
  priority?: any;
  taskType?: any;
  assignees?: any[];
  key?: string;
  epic?: string;
}

export interface BoardCardProps {
  task: BoardTask;
  onPressOptions?: () => void;
  onPressCard?: () => void;
  isGhost?: boolean;
  onDragStart?: (
    task: BoardTask,
    pageX: number,
    pageY: number,
    locationX: number,
    locationY: number,
  ) => void;
  onDragMove?: (dx: number, dy: number, moveX: number, moveY: number) => void;
  onDragEnd?: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (taskId: string) => void;
  dragPosition?: Animated.ValueXY;
}

// Inline Person Outline Icon for Unassigned
const PersonOutline = ({
  color = "#6f6f6f",
  size = 14,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5-4-8-4z"
      fill={color}
    />
  </Svg>
);

function BoardCard({
  task,
  onPressOptions,
  onPressCard,
  isGhost = false,
  onDragStart,
  onDragMove,
  onDragEnd,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  dragPosition,
}: BoardCardProps) {
  const { theme } = useTheme();

  // Gesture references for long-press timer
  const longPressTimer = useRef<any>(null);
  const isDragActiveRef = useRef(false);

  // Visual drag state
  const [isPressing, setIsPressing] = useState(false);

  // PanResponder to intercept gestures
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => {
          // Capture move only if long press activated dragging
          return isDragActiveRef.current;
        },
        // Aggressively capture move events during active drag so parent
        // ScrollViews cannot intercept and terminate the gesture
        onMoveShouldSetPanResponderCapture: () => {
          return isDragActiveRef.current;
        },
        // CRITICAL: Refuse to release the gesture to any other responder
        // while drag is active. This prevents the parent ScrollView from
        // stealing the touch when dragging across column boundaries.
        onPanResponderTerminationRequest: () => {
          return !isDragActiveRef.current;
        },
        onShouldBlockNativeResponder: () => {
          return isDragActiveRef.current;
        },
        onPanResponderGrant: (evt) => {
          setIsPressing(true);
          isDragActiveRef.current = false;

          // Capture coordinates synchronously before setTimeout nullifies the synthetic event
          const startPageX = evt.nativeEvent.pageX;
          const startPageY = evt.nativeEvent.pageY;
          const startLocationX = evt.nativeEvent.locationX;
          const startLocationY = evt.nativeEvent.locationY;

          // Start 220ms timer to activate drag
          longPressTimer.current = setTimeout(() => {
            if (onDragStart) {
              isDragActiveRef.current = true;
              onDragStart(
                task,
                startPageX,
                startPageY,
                startLocationX,
                startLocationY,
              );
            }
          }, 220);
        },
        onPanResponderMove: dragPosition
          ? (Animated.event(
            [null, { dx: dragPosition.x, dy: dragPosition.y }],
            {
              useNativeDriver: false,
              listener: ((evt: any, gestureState: any) => {
                if (isDragActiveRef.current) {
                  if (onDragMove) {
                    onDragMove(
                      gestureState?.dx,
                      gestureState?.dy,
                      gestureState?.moveX,
                      gestureState?.moveY,
                    );
                  }
                } else {
                  // Cancel timer if finger moves significantly before long press activates
                  if (
                    Math.abs(gestureState?.dx) > 8 ||
                    Math.abs(gestureState?.dy) > 8
                  ) {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                    }
                  }
                }
              }) as any,
            }
          ) as any)
          : (evt, gestureState) => {
            if (isDragActiveRef.current) {
              if (onDragMove) {
                onDragMove(
                  gestureState?.dx,
                  gestureState?.dy,
                  gestureState?.moveX,
                  gestureState?.moveY,
                );
              }
            } else {
              // Cancel timer if finger moves significantly before long press activates
              if (
                Math.abs(gestureState?.dx) > 8 ||
                Math.abs(gestureState?.dy) > 8
              ) {
                if (longPressTimer.current) {
                  clearTimeout(longPressTimer.current);
                }
              }
            }
          },
        onPanResponderRelease: () => {
          setIsPressing(false);
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
          }

          if (isDragActiveRef.current) {
            if (onDragEnd) {
              onDragEnd();
            }
          } else {
            // Normal card tap select
            if (isSelectionMode && onToggleSelect) {
              onToggleSelect(task.id);
            } else if (onPressCard) {
              onPressCard();
            }
          }
          isDragActiveRef.current = false;
        },
      }),
    [task, onDragStart, onDragMove, onDragEnd, onPressCard],
  );

  // Color mappings for Issue Type badge
  const taskTypeBg = task.taskType?.colorCode || "#1565c0";
  const taskTypeChar = task.taskType?.name ? task.taskType.name.charAt(0).toUpperCase() : "T";

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.cardContainer,
        {
          borderColor: theme.colors.neutral.border.light,
          backgroundColor: "#ffffff",
        },
        isPressing && {
          backgroundColor: "#f7f7f7",
        },
        isGhost && {
          opacity: 0.35,
          borderStyle: "dashed",
          borderColor: theme.colors.neutral.border.medium,
          backgroundColor: "#fafafa",
        },
        isSelectionMode && isSelected && {
          borderColor: theme.colors.brand.border.medium,
          backgroundColor: theme.colors.brand.surface.lighter,
        }
      ]}
    >
      {/* Checkbox */}
      {isSelectionMode && (
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isSelected
                ? theme.colors.brand.surface.medium
                : "transparent",
              borderColor: isSelected
                ? theme.colors.brand.surface.medium
                : theme.colors.neutral.border.medium,
            },
          ]}
        >
          {isSelected && <CheckIcon size={10} color="#ffffff" />}
        </View>
      )}

      {/* ── Top Section (Title & More Options) ── */}
      <View style={styles.topRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (isSelectionMode && onToggleSelect) {
              onToggleSelect(task.id);
            } else if (onPressCard) {
              onPressCard();
            }
          }}
          style={{ flex: 1 }}
        >
          <Typography
            fontVariant="BM"
            variant="bold"
            color="colors.neutral.onSurface.light"
            numberOfLines={2}
            style={styles.taskTitle}
          >
            {task.name || task.key || 'Untitled Task'}
          </Typography>
        </TouchableOpacity>
        {onPressOptions && (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={onPressOptions}
            style={styles.moreBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVert
              width={16}
              height={16}
              color={theme.colors.neutral.onSurface.dark}
              viewBox="0 0 24 24"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Middle Section (Epic/Label Tag) ── */}
      {task.epic && (
        <View style={styles.epicWrapper}>
          <Tag
            label={task.epic}
            color="info"
            variant="bordered"
            labelVariant="semibold"
            labelFontVariant="BXS"
            tagStyle={styles.epicTag}
            labelStyle={styles.epicTagLabel}
          />
        </View>
      )}

      {/* ── Bottom Section (Type, Key & Assignee) ── */}
      <View style={styles.bottomRow}>
        <View style={styles.leftInfo}>
          {/* Issue Type Indicator */}
          <View style={[styles.typeIcon, { backgroundColor: taskTypeBg }]}>
            <Typography
              fontVariant="LXS"
              variant="bold"
              color="#ffffff"
              style={styles.typeIconText}
            >
              {taskTypeChar}
            </Typography>
          </View>

          {/* Project Type */}
          <Typography
            fontVariant="BXS"
            color="colors.neutral.onSurface.dark"
            style={styles.taskKey}
          >
            {task.taskType?.name || "Task"}
          </Typography>
        </View>

        {/* Assignee Avatar */}
        <View style={styles.avatarWrapper}>
          {task.assignees && task.assignees.length > 0 ? (
            task.assignees[0].dP ? (
              <Image
                source={{ uri: task.assignees[0].dP }}
                style={styles.avatarImage}
              />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  { backgroundColor: theme.colors.brand.surface.lighter },
                ]}
              >
                <Typography
                  fontVariant="LXS"
                  variant="semibold"
                  color="colors.brand.onSurface.light"
                  style={styles.avatarFallbackText}
                >
                  {task.assignees[0].displayName?.charAt(0).toUpperCase() || "A"}
                </Typography>
              </View>
            )
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: theme.colors.neutral.surface.light },
              ]}
            >
              <PersonOutline
                size={12}
                color={theme.colors.neutral.onSurface.dark}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default React.memo(BoardCard, (prevProps, nextProps) => {
  return (
    prevProps.isGhost === nextProps.isGhost &&
    prevProps.isSelectionMode === nextProps.isSelectionMode &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.status?.id === nextProps.task.status?.id
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
  },
  checkbox: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  moreBtn: {
    padding: 2,
    marginTop: -2,
    marginRight: -4,
  },
  epicWrapper: {
    marginTop: 8,
    flexDirection: "row",
  },
  epicTag: {
    backgroundColor: "#f3e5f5",
    borderColor: "transparent",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  epicTagLabel: {
    color: "#9c27b0",
    fontSize: 10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  typeIconText: {
    fontSize: 9,
    lineHeight: 10,
  },
  taskKey: {
    fontWeight: "600",
  },
  avatarWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    fontSize: 9,
    lineHeight: 12,
  },
});
