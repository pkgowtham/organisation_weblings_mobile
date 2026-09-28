import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  PanResponder,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useRouter, useLocalSearchParams } from "expo-router";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import Input from "../textInput";
import Dropdown from "../dropdown";
import DatePicker from "../datePicker";
import CustomButton from "../button";
import Tag from "../tag";
import { Search, CalendarToday, MoreVert, Close } from "@/svg_icons";
import { useStore } from "@/store";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useToast } from "@/context/ToastContext";
import { apiFetch } from "@/store/apiInstance";

import { BaseTask, FloatingPayload } from "../dragDrop/types";
import { CloseIcon, CheckIcon, DragHandleIcon } from "../dragDrop/icons";
import DragOverlayCard from "../dragDrop/DragOverlayCard";
import FloatingDropButton from "../dragDrop/FloatingDropButton";
import SelectionActionBar from "../dragDrop/SelectionActionBar";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");
const COLUMN_WIDTH = SCREEN_WIDTH * 0.86;
const POPUP_WIDTH = SCREEN_WIDTH * 0.55;
const FLOATING_REST_X = SCREEN_WIDTH - 76;
const FLOATING_REST_Y = SCREEN_HEIGHT - 220;

// ═══════════════════════════════════════
// ── SVG Icons ──
// ═══════════════════════════════════════

const ChevronDown = ({
  color = "#151515",
  size = 16,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);



// ═══════════════════════════════════════
// ── Interfaces ──
// ═══════════════════════════════════════

interface BacklogTask extends BaseTask {
  typeColor?: string;
  status: string;
  statusId?: string;
  statusColor?: string;
}

interface SprintItem {
  id: string;
  name: string;
  dates: string;
  tasks: BacklogTask[];
  active: boolean;
  sprintStatus?: string;
  rawStartDate?: string;
  rawEndDate?: string;
  page: number;
  totalPages: number;
  isLoadingMore?: boolean;
}

interface RowMeasurement {
  y: number;
  height: number;
}

interface RowMeasurement {
  y: number;
  height: number;
}

// ═══════════════════════════════════════
// ── BacklogTaskCard ──
// ═══════════════════════════════════════

interface BacklogTaskCardProps {
  task: BacklogTask;
  source: string;
  isSelected: boolean;
  isSelectionMode: boolean;
  isGhost: boolean; // dashed + low opacity (in-flight or floating)
  themeColors: any;
  onDragStart: (
    task: BacklogTask,
    source: string,
    pageX: number,
    pageY: number,
    locationX: number,
    locationY: number,
  ) => void;
  onDragMove: (dx: number, dy: number, pageX: number, pageY: number) => void;
  onDragEnd: () => void;
  onToggleSelect: (taskId: string, source: string) => void;
  onStatusChange: (
    taskId: string,
    statusId: string,
    source: string,
  ) => void;
  dragPosition: Animated.ValueXY;
  statusOptions: any[];
  onPressCard?: (taskId: string) => void;
}

const BacklogTaskCard = React.memo(
  function BacklogTaskCard({
    task,
    source,
    isSelected,
    isSelectionMode,
    isGhost,
    themeColors,
    onDragStart,
    onDragMove,
    onDragEnd,
    onToggleSelect,
    onStatusChange,
    dragPosition,
    statusOptions,
    onPressCard,
  }: BacklogTaskCardProps) {
    const callbacks = useRef({ onDragStart, onDragMove, onDragEnd, task, source });
    callbacks.current = { onDragStart, onDragMove, onDragEnd, task, source };

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponderCapture: () => true,
          onPanResponderTerminationRequest: () => false,
          onShouldBlockNativeResponder: () => true,
          onPanResponderGrant: (evt) => {
            const { task, source, onDragStart } = callbacks.current;
            onDragStart(
              task,
              source,
              evt.nativeEvent.pageX,
              evt.nativeEvent.pageY,
              evt.nativeEvent.locationX,
              evt.nativeEvent.locationY,
            );
          },
          onPanResponderMove: Animated.event(
            [null, { dx: dragPosition.x, dy: dragPosition.y }],
            {
              useNativeDriver: false,
              listener: ((evt: any, gs: any) => {
                callbacks.current.onDragMove(gs.dx, gs.dy, gs.moveX, gs.moveY);
              }) as any
            }
          ) as any,
          onPanResponderRelease: () => callbacks.current.onDragEnd(),
          onPanResponderTerminate: () => callbacks.current.onDragEnd(),
        }),
      [],
    );

    const typeConfig = {
      bg: task.typeColor || "#1565c0",
      char: task.type ? task.type.charAt(0).toUpperCase() : "T",
    };

    const statusColorCode = task.statusColor || "#8d8d8d";
    const textThemeColor = statusColorCode;
    const borderThemeColor = statusColorCode;
    const bgThemeColor = statusColorCode.startsWith("#")
      ? `${statusColorCode}15`
      : statusColorCode;

    return (
      <View
        style={[
          cardStyles.container,
          {
            borderColor: isSelected
              ? themeColors.brand.border.medium
              : themeColors.neutral.border.light,
            backgroundColor: isSelected
              ? themeColors.brand.surface.lighter
              : "#ffffff",
          },
          isGhost && {
            opacity: 0.3,
            borderStyle: "dashed" as const,
            borderColor: themeColors.neutral.border.medium,
          },
        ]}
      >
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={cardStyles.dragHandle}>
          <DragHandleIcon
            size={18}
            color={themeColors.neutral.onSurface.disabled}
          />
        </View>

        {/* Card Content — TAP to toggle in selection mode, LONG-PRESS to start selection */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            // In selection mode: simple tap toggles
            if (isSelectionMode) {
              onToggleSelect(task.id, source);
            } else if (onPressCard) {
              onPressCard(task.id);
            }
          }}
          onLongPress={() => {
            // NOT in selection mode: long-press starts selection
            if (!isSelectionMode) {
              onToggleSelect(task.id, source);
            }
          }}
          delayLongPress={400}
          style={cardStyles.contentArea}
        >
          {/* Selection checkbox */}
          {isSelectionMode && (
            <View
              style={[
                cardStyles.checkbox,
                {
                  backgroundColor: isSelected
                    ? themeColors.brand.surface.medium
                    : "transparent",
                  borderColor: isSelected
                    ? themeColors.brand.surface.medium
                    : themeColors.neutral.border.medium,
                },
              ]}
            >
              {isSelected && <CheckIcon size={10} color="#ffffff" />}
            </View>
          )}

          {/* Top: Type + Key */}
          <View style={cardStyles.topLine}>
            <View
              style={[cardStyles.typeIcon, { backgroundColor: typeConfig.bg }]}
            >
              <Typography
                fontVariant="LXS"
                variant="bold"
                color="#ffffff"
                style={cardStyles.typeIconText}
              >
                {typeConfig.char}
              </Typography>
            </View>
            <Typography
              fontVariant="BXS"
              variant="semibold"
              color="colors.neutral.onSurface.dark"
            >
              {task.type}
            </Typography>
          </View>

          {/* Title */}
          <Typography
            fontVariant="BS"
            variant="semibold"
            color="colors.neutral.onSurface.light"
            numberOfLines={2}
            style={cardStyles.title}
          >
            {task.title}
          </Typography>

          {/* Bottom: Epic + Status */}
          <View style={cardStyles.bottomLine}>
            {task.epic ? (
              <Tag
                label={task.epic}
                color="info"
                variant="bordered"
                labelVariant="semibold"
                labelFontVariant="BXS"
                tagStyle={cardStyles.epicTag}
                labelStyle={cardStyles.epicLabel}
              />
            ) : (
              <View />
            )}
            <Dropdown
              placeholder="Status"
              options={statusOptions}
              selectedValue={task.statusId}
              hideClearIcon={true}
              onValueChange={(val) => {
                if (val && val !== task.statusId) {
                  onStatusChange(task.id, val, source);
                }
              }}
              containerStyle={{ width: 130, marginBottom: 0 }}
              inputStyle={{
                height: 24,
                paddingHorizontal: 8,
                borderRadius: 4,
                backgroundColor: bgThemeColor,
                borderColor: borderThemeColor,
                borderWidth: 1,
              }}
              selectedOptionTextStyle={{
                color: textThemeColor,
                fontSize: 12,
                fontWeight: "bold",
              }}
              arrowColor={textThemeColor}
              hideTriggerBadge={true}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isGhost === nextProps.isGhost &&
      prevProps.isSelectionMode === nextProps.isSelectionMode &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.source === nextProps.source &&
      prevProps.task.id === nextProps.task.id &&
      prevProps.task.type === nextProps.task.type &&
      prevProps.task.key === nextProps.task.key &&
      prevProps.task.title === nextProps.task.title &&
      prevProps.task.epic === nextProps.task.epic &&
      prevProps.task.status === nextProps.task.status
    );
  }
);

const cardStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderRadius: 10,
    marginBottom: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  dragHandle: {
    width: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
    backgroundColor: "#fafbfc",
  },
  contentArea: {
    flex: 1,
    padding: 10,
    paddingLeft: 12,
    gap: 6,
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
  topLine: {
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
  title: {
    lineHeight: 18,
    paddingRight: 20,
  },
  bottomLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  epicTag: {
    backgroundColor: "#f3e5f5",
    borderColor: "transparent",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  epicLabel: {
    color: "#9c27b0",
    fontSize: 10,
  },
});



// ═══════════════════════════════════════
// ── Main BacklogContent Component ──
// ═══════════════════════════════════════

export default function BacklogContent({
  showOnlySprints = false,
  priorityData = [],
  priorityPage = 1,
  priorityTotalPages = 1,
  isPriorityLoading = false,
  getProjectPriority,
  tagData = [],
  tagPage = 1,
  tagTotalPages = 1,
  isTagLoading = false,
  getProjectTag,
  taskTypeData = [],
  taskTypePage = 1,
  taskTypeTotalPages = 1,
  isTaskTypeLoading = false,
  getProjectTaskType,
  statusData = [],
  projectId: propProjectId,
  searchQuery = "",
  setSearchQuery,
  selectedEpic = "",
  setSelectedEpic,
  selectedTag = [],
  setSelectedTag,
  selectedPriority = "",
  setSelectedPriority,
}: {
  showOnlySprints?: boolean;
  priorityData?: any[];
  priorityPage?: number;
  priorityTotalPages?: number;
  isPriorityLoading?: boolean;
  getProjectPriority?: (page: number) => void;
  tagData?: any[];
  tagPage?: number;
  tagTotalPages?: number;
  isTagLoading?: boolean;
  getProjectTag?: (page: number) => void;
  taskTypeData?: any[];
  taskTypePage?: number;
  taskTypeTotalPages?: number;
  isTaskTypeLoading?: boolean;
  getProjectTaskType?: (page: number) => void;
  statusData?: any[];
  projectId?: string;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  selectedEpic?: string;
  setSelectedEpic?: (e: string) => void;
  selectedTag?: string[];
  setSelectedTag?: (t: string[]) => void;
  selectedPriority?: string;
  setSelectedPriority?: (p: string) => void;
}) {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = propProjectId || (params.projectId as string);
  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { showToast } = useToast();
  const handlePressCard = useCallback((taskId: string) => {
    router.push({
      pathname: "/(protected)/(streamLine)/viewTask",
      params: { taskId, projectId }
    });
  }, [router, projectId]);
  const containerRef = useRef<View>(null);
  const containerYRef = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // ── API State from Redux Store ──
  const isLoadingBacklog = store.backlog.isLoadingGetList;
  const backlogError = store.backlog.errorGetList;
  const apiBacklogData = store.backlog.dataGetList?.data || [];

  const isLoadingSprint = store.sprint.isLoadingGetList;
  const sprintError = store.sprint.errorGetList;
  const apiSprintData = store.sprint.dataGetList?.data || [];

  const isLoading = isLoadingBacklog || isLoadingSprint;
  const apiError = backlogError || sprintError;

  // ── Search ──
  // Using props: searchQuery, setSearchQuery

  // ── Modals ──
  const [newSprintModalVisible, setNewSprintModalVisible] = useState(false);


  // ── Sprint Form ──
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null);
  const [newSprintName, setNewSprintName] = useState("");
  const [sprintStartDate, setSprintStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [sprintEndDate, setSprintEndDate] = useState<Date | undefined>(
    undefined,
  );

  // ── Multi-Select ──
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectionSource, setSelectionSource] = useState<string | null>(null);
  const isSelectionMode = selectedTaskIds.size > 0;

  // ── Drag State ──
  const [draggingTaskIds, setDraggingTaskIds] = useState<string[]>([]);
  const [draggingTasks, setDraggingTasks] = useState<BacklogTask[]>([]);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [hoveredDropTarget, setHoveredDropTarget] = useState<string | null>(
    null,
  );
  const [isPopupMounted, setIsPopupMounted] = useState(false);
  const showPopup = isPopupMounted;
  const popupAnim = useRef(new Animated.Value(0)).current;

  const animatePopup = useCallback((show: boolean) => {
    if (show) {
      setIsPopupMounted(true);
      Animated.spring(popupAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(popupAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setIsPopupMounted(false);
        }
      });
    }
  }, [popupAnim]);

  const popupTranslateX = popupAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [POPUP_WIDTH + 30, 0],
  });
  const isDragging = draggingTaskIds.length > 0;

  const dragPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const initialDragPos = useRef({ x: 0, y: 0 });
  const currentDragPos = useRef({ x: 0, y: 0 });

  // ── Floating Icon State (for failed drops) ──
  const [floatingPayload, setFloatingPayloadState] = useState<FloatingPayload | null>(
    null,
  );
  const floatingPayloadRef = useRef<FloatingPayload | null>(null);
  const setFloatingPayload = useCallback((payload: FloatingPayload | null) => {
    floatingPayloadRef.current = payload;
    setFloatingPayloadState(payload);
  }, []);

  const [isFloatingDragging, setIsFloatingDragging] = useState(false);
  const floatingPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const hasFloating = floatingPayload !== null;

  // All ghost task ids (in-flight during drag OR held in floating)
  const ghostTaskIds = useMemo(() => {
    const ids = new Set<string>();
    draggingTaskIds.forEach((id) => ids.add(id));
    floatingPayload?.taskIds.forEach((id) => ids.add(id));
    return ids;
  }, [draggingTaskIds, floatingPayload]);

  // ── Popup layout & auto-scroll ──
  const popupScrollRef = useRef<ScrollView>(null);
  const popupScrollY = useRef(0);
  const targetScrollY = useRef(0);
  const popupScrollLayout = useRef({ y: 0, height: 0 });
  const popupRowLayouts = useRef<{ [key: string]: RowMeasurement }>({});
  const autoScrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestDragPagePos = useRef({ x: 0, y: 0 });
  const currentSourceIdRef = useRef<string | null>(null);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  }, []);

  const startAutoScroll = useCallback((direction: "up" | "down") => {
    if (autoScrollInterval.current) return;
    autoScrollInterval.current = setInterval(() => {
      if (!popupScrollRef.current) return;
      const SCROLL_SPEED = 14;
      targetScrollY.current = direction === "up"
        ? Math.max(0, targetScrollY.current - SCROLL_SPEED)
        : targetScrollY.current + SCROLL_SPEED;

      popupScrollRef.current.scrollTo({ y: targetScrollY.current, animated: false });

      // Predict the hover target using the new scroll offset
      const simulatedContentY = (latestDragPagePos.current.y - popupScrollLayout.current.y) + targetScrollY.current;
      let target: string | null = null;
      for (const [id, m] of Object.entries(popupRowLayouts.current)) {
        if (simulatedContentY >= m.y && simulatedContentY <= m.y + m.height && id !== currentSourceIdRef.current) {
          target = id;
          break;
        }
      }
      setHoveredDropTarget((prev) => (prev !== target ? target : prev));
    }, 16);
  }, []);

  const checkAutoScroll = useCallback((pageX: number, pageY: number) => {
    const popupStartX = SCREEN_WIDTH - POPUP_WIDTH - 12;
    if (pageX < popupStartX) {
      stopAutoScroll();
      return;
    }
    const { y: scrollY, height: scrollHeight } = popupScrollLayout.current;
    if (scrollHeight === 0) return;

    const SCROLL_ZONE_HEIGHT = 65;
    const distFromTop = pageY - scrollY;
    const distFromBottom = (scrollY + scrollHeight) - pageY;

    if (distFromTop > 0 && distFromTop < SCROLL_ZONE_HEIGHT) {
      startAutoScroll("up");
    } else if (distFromBottom > 0 && distFromBottom < SCROLL_ZONE_HEIGHT) {
      startAutoScroll("down");
    } else {
      stopAutoScroll();
    }
  }, [startAutoScroll, stopAutoScroll]);

  // ── Data ──
  const [backlogTasks, setBacklogTasks] = useState<BacklogTask[]>([]);
  const [sprints, setSprints] = useState<SprintItem[]>([]);

  // ── Filter States ──
  // Using props: selectedEpic, selectedTag, selectedPriority

  // ═══════════════════════════════════════
  // ── Fetch Backlog & Sprint Data from Redux ──
  // ═══════════════════════════════════════

  // Removed API dispatch because projectDetails.tsx handles it now

  console.log('sprintGetList: ', JSON.stringify(store.sprint.dataGetList, null, 2))

  // Sync mapped API data to local backlogTasks state
  useEffect(() => {
    if (!apiBacklogData || !Array.isArray(apiBacklogData)) {
      setBacklogTasks([]);
      return;
    }

    const mapTaskType = (name?: string): "task" | "story" | "bug" => {
      if (!name) return "task";
      const lower = name.toLowerCase();
      if (lower === "story") return "story";
      if (lower === "bug") return "bug";
      return "task";
    };

    const mapStatus = (name?: string): "TO DO" | "IN PROGRESS" | "DONE" => {
      if (!name) return "TO DO";
      const lower = name.toLowerCase();
      if (lower === "todo" || lower === "to do") return "TO DO";
      if (lower === "in progress" || lower === "inprogress" || lower === "in_progress") return "IN PROGRESS";
      if (lower === "done") return "DONE";
      return "TO DO";
    };

    const flattenTasks = (tasksList: any[], parentEpicName?: string): BacklogTask[] => {
      let flat: BacklogTask[] = [];
      tasksList.forEach((task: any) => {
        const isEpic = task.taskType?.name?.toLowerCase() === "epic";
        const currentEpic = isEpic ? task.name : (parentEpicName || task.parentId?.name || (task.tags && task.tags[0]?.name));

        flat.push({
          id: task.id,
          type: task.taskType?.name || "Task",
          typeColor: task.taskType?.colorCode || "#1565c0",
          key: task.taskKey || task.key || "PRJ-1",
          title: task.name,
          epic: currentEpic,
          status: task.status?.name || "TO DO",
          statusId: task.status?.id,
          statusColor: task.status?.colorCode || "#8d8d8d",
        });

        if (task.children && task.children.length > 0) {
          flat = flat.concat(flattenTasks(task.children, currentEpic));
        }
      });
      return flat;
    };

    const mappedTasks = flattenTasks(apiBacklogData);

    // Only update if data actually changed (prevent infinite loops)
    setBacklogTasks((prevTasks) => {
      const hasChanged =
        prevTasks.length !== mappedTasks.length ||
        prevTasks.some((task, idx) =>
          !mappedTasks[idx] ||
          task.id !== mappedTasks[idx].id ||
          task.title !== mappedTasks[idx].title ||
          task.status !== mappedTasks[idx].status
        );
      return hasChanged ? mappedTasks : prevTasks;
    });
  }, [store.backlog.dataGetList]);

  // Sync mapped API data to local sprints state
  useEffect(() => {
    // Safely derive raw sprints without relying on external derived variables
    const list = store.sprint.dataGetList;
    const rawSprints = Array.isArray(list) ? list : (list && Array.isArray(list.data) ? list.data : []);

    if (rawSprints.length === 0) {
      setSprints([]);
      return;
    }

    const flattenTasks = (tasksList: any[], parentEpicName?: string): BacklogTask[] => {
      let flat: BacklogTask[] = [];
      tasksList.forEach((task: any) => {
        const isEpic = task.taskType?.name?.toLowerCase() === "epic";
        const currentEpic = isEpic ? task.name : (parentEpicName || task.parentId?.name || (task.tags && task.tags[0]?.name));

        flat.push({
          id: task.id,
          type: task.taskType?.name || "Task",
          typeColor: task.taskType?.colorCode || "#1565c0",
          key: task.taskKey || task.key || "",
          title: task.name,
          epic: currentEpic,
          status: task.status?.name || "TO DO",
          statusId: task.status?.id,
          statusColor: task.status?.colorCode || "#8d8d8d",
        });

        if (task.children && task.children.length > 0) {
          flat = flat.concat(flattenTasks(task.children, currentEpic));
        }
      });
      return flat;
    };

    const mappedSprints: SprintItem[] = rawSprints.map((s: any) => {
      let dates = "TBD";
      if (s.startDate && s.endDate) {
        const formatM = (dateStr: string) => {
          const d = new Date(dateStr);
          return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        };
        const startStr = formatM(s.startDate);
        const endStr = formatM(s.endDate);
        if (startStr && endStr) {
          dates = `${startStr} - ${endStr}`;
        }
      } else if (typeof s.dates === "string") {
        dates = s.dates;
      }

      const rawTasks = s.tasks || [];
      const mappedTasks = flattenTasks(rawTasks);

      return {
        id: s.id,
        name: s.name || s.sprintName || "Unnamed Sprint",
        dates,
        active: s.active === true || s.isActive === true || String(s.status).toLowerCase() === "active",
        sprintStatus: s.status,
        rawStartDate: s.startDate,
        rawEndDate: s.endDate,
        tasks: mappedTasks,
        page: 1,
        totalPages: 1,
      };
    });

    setSprints((prevSprints) => {
      const hasChanged =
        prevSprints.length !== mappedSprints.length ||
        prevSprints.some((s, idx) =>
          !mappedSprints[idx] ||
          s.id !== mappedSprints[idx].id ||
          s.name !== mappedSprints[idx].name ||
          s.dates !== mappedSprints[idx].dates ||
          s.active !== mappedSprints[idx].active ||
          s.sprintStatus !== mappedSprints[idx].sprintStatus ||
          s.tasks.length !== mappedSprints[idx].tasks.length
        );
      return hasChanged ? mappedSprints : prevSprints;
    });
  }, [store.sprint.dataGetList]);

  // Refetch sprints when start/complete is successful
  useEffect(() => {
    if (store.sprint.isSuccessStart) {
      if (!projectId) return;
      const query: any = { projectId };
      if (selectedEpic) query.epicId = selectedEpic;
      if (selectedTag) query.tagId = selectedTag;
      if (selectedPriority) query.priorityId = selectedPriority;

      dispatch({
        type: "SPRINT_GETLIST_API_REQUEST",
        payload: {
          url: "sprint",
          method: "GET",
          query,
        },
      });
      dispatch({ type: "SPRINT_START_API_CLEAR" } as any);
      showToast({ iconType: 'success', type: 'success', title: 'Sprint updated successfully' });
    }
    if (store.sprint.isErrorStart) {
      showToast({ iconType: 'error', type: 'error', title: store.sprint.errorStart || "Failed to update sprint" });
      dispatch({ type: "SPRINT_START_API_CLEAR" } as any);
    }
  }, [store.sprint.isSuccessStart, store.sprint.isErrorStart]);

  // ═══════════════════════════════════════
  // ── Layout Measurement ──
  // ═══════════════════════════════════════

  const onContainerLayout = useCallback(() => {
    containerRef.current?.measureInWindow((_x, y) => {
      containerYRef.current = y;
    });
  }, []);

  // ═══════════════════════════════════════
  // ── Drop Target Detection ──
  // ═══════════════════════════════════════

  const findDropTarget = useCallback(
    (pageX: number, pageY: number, sourceId: string | null): string | null => {
      const popupStartX = SCREEN_WIDTH - POPUP_WIDTH - 12;
      if (pageX < popupStartX) return null;

      const { y: scrollYOnScreen, height: scrollHeightOnScreen } = popupScrollLayout.current;

      if (pageY < scrollYOnScreen || pageY > scrollYOnScreen + scrollHeightOnScreen) {
        return null;
      }

      const fingerContentY = (pageY - scrollYOnScreen) + popupScrollY.current;

      for (const [id, m] of Object.entries(popupRowLayouts.current)) {
        if (fingerContentY >= m.y && fingerContentY <= m.y + m.height && id !== sourceId) {
          return id;
        }
      }
      return null;
    },
    [],
  );

  // ═══════════════════════════════════════
  // ── Card Drag Handlers ──
  // ═══════════════════════════════════════

  const handleDragStart = useCallback(
    (
      task: BacklogTask,
      source: string,
      pageX: number,
      pageY: number,
      locationX: number,
      locationY: number,
    ) => {
      // If there's a floating payload, cancel it first
      if (floatingPayload) {
        clearFloating();
      }

      let tasksToDrag: BacklogTask[];
      let taskIdsToDrag: string[];

      if (isSelectionMode && selectedTaskIds.has(task.id) && selectionSource === source) {
        const allTasks =
          source === "backlog"
            ? backlogTasks
            : sprints.find((s) => s.id === source)?.tasks || [];
        tasksToDrag = allTasks.filter((t) => selectedTaskIds.has(t.id));
        taskIdsToDrag = tasksToDrag.map((t) => t.id);
      } else {
        tasksToDrag = [task];
        taskIdsToDrag = [task.id];
      }

      setDraggingTasks(tasksToDrag);
      setDraggingTaskIds(taskIdsToDrag);
      setDragSource(source);
      currentSourceIdRef.current = source;
      animatePopup(true);

      const cardX = pageX - locationX;
      const cardY = pageY - locationY - containerYRef.current;
      initialDragPos.current = { x: cardX, y: cardY };
      currentDragPos.current = { x: cardX, y: cardY };
      dragPosition.setOffset({ x: cardX, y: cardY });
      dragPosition.setValue({ x: 0, y: 0 });
      latestDragPagePos.current = { x: pageX, y: pageY };
      targetScrollY.current = popupScrollY.current;
    },
    [
      floatingPayload,
      isSelectionMode,
      selectedTaskIds,
      selectionSource,
      backlogTasks,
      sprints,
      dragPosition,
      animatePopup,
    ],
  );

  const handleDragMove = useCallback(
    (dx: number, dy: number, pageX: number, pageY: number) => {
      latestDragPagePos.current = { x: pageX, y: pageY };

      const newX = initialDragPos.current.x + dx;
      const newY = initialDragPos.current.y + dy;
      currentDragPos.current = { x: newX, y: newY };

      const target = findDropTarget(pageX, pageY, dragSource);
      setHoveredDropTarget((prev) => (prev !== target ? target : prev));
      checkAutoScroll(pageX, pageY);
    },
    [findDropTarget, dragSource, checkAutoScroll],
  );

  const handleDragEnd = useCallback(() => {
    stopAutoScroll();
    if (hoveredDropTarget && dragSource) {
      // ✅ Valid drop — execute move
      moveTasksToTarget(draggingTaskIds, dragSource, hoveredDropTarget);
      if (isSelectionMode) clearSelection();
      animatePopup(false);
    } else {
      // ❌ Invalid drop — enter floating state
      setFloatingPayload({
        tasks: [...draggingTasks],
        source: dragSource!,
        taskIds: [...draggingTaskIds],
      });
      // Drop floating icon exactly centered on the finger's release position
      floatingPos.flattenOffset();
      floatingPos.setValue({
        x: latestDragPagePos.current.x - 25,
        y: latestDragPagePos.current.y - containerYRef.current - 25
      });
    }

    // Clear drag state (but NOT floating state)
    setDraggingTaskIds([]);
    setDraggingTasks([]);
    setDragSource(null);
    setHoveredDropTarget(null);
    dragPosition.flattenOffset();
  }, [
    hoveredDropTarget,
    dragSource,
    draggingTaskIds,
    draggingTasks,
    isSelectionMode,
    floatingPos,
    animatePopup,
    dragPosition,
  ]);

  // ═══════════════════════════════════════
  // ── Floating Icon PanResponder ──
  // ═══════════════════════════════════════

  const floatingPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          currentSourceIdRef.current = floatingPayloadRef.current?.source || null;
          setIsFloatingDragging(true);
          animatePopup(true);
          floatingPos.extractOffset();
          targetScrollY.current = popupScrollY.current;
        },
        onPanResponderMove: Animated.event(
          [null, { dx: floatingPos.x, dy: floatingPos.y }],
          {
            useNativeDriver: false,
            listener: ((evt: any, gs: any) => {
              const px = gs.moveX;
              const py = gs.moveY;
              latestDragPagePos.current = { x: px, y: py };
              const target = findDropTarget(
                px,
                py,
                floatingPayloadRef.current?.source || null,
              );
              setHoveredDropTarget((prev) => (prev !== target ? target : prev));
              checkAutoScroll(px, py);
            }) as any
          }
        ) as any,
        onPanResponderRelease: (evt, gs) => {
          stopAutoScroll();
          setIsFloatingDragging(false);
          floatingPos.flattenOffset();

          const target = findDropTarget(
            gs.moveX,
            gs.moveY,
            floatingPayloadRef.current?.source || null,
          );

          if (target && floatingPayloadRef.current) {
            // ✅ Valid drop from floating icon
            moveTasksToTarget(
              floatingPayloadRef.current.taskIds,
              floatingPayloadRef.current.source,
              target,
            );
            clearFloating();
          } else {
            // ❌ Invalid drop: stay exactly where released. No snapping.
          }

          setHoveredDropTarget(null);
        },
        onPanResponderTerminate: () => {
          stopAutoScroll();
          setIsFloatingDragging(false);
          floatingPos.flattenOffset();
          setHoveredDropTarget(null);
          // ❌ Invalid drop: stay exactly where released. No snapping.
        },
      }),
    [floatingPos, findDropTarget, animatePopup],
  );

  // ═══════════════════════════════════════
  // ── Floating Icon Helpers ──
  // ═══════════════════════════════════════

  const clearFloating = useCallback(() => {
    setFloatingPayload(null);
    setIsFloatingDragging(false);
    if (isSelectionMode) clearSelection();
    animatePopup(false);
  }, [isSelectionMode, animatePopup]);

  // ═══════════════════════════════════════
  // ── Move Tasks Logic ──
  // ═══════════════════════════════════════

  const moveTasksToTarget = (
    taskIds: string[],
    fromSource: string,
    toTarget: string,
  ) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const taskIdSet = new Set(taskIds);
    let movedTasks: BacklogTask[] = [];

    if (fromSource === "backlog") {
      setBacklogTasks((prev) => {
        movedTasks = prev.filter((t) => taskIdSet.has(t.id));
        return prev.filter((t) => !taskIdSet.has(t.id));
      });
    } else {
      setSprints((prev) =>
        prev.map((s) => {
          if (s.id === fromSource) {
            movedTasks = s.tasks.filter((t) => taskIdSet.has(t.id));
            return { ...s, tasks: s.tasks.filter((t) => !taskIdSet.has(t.id)) };
          }
          return s;
        }),
      );
    }

    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (toTarget === "backlog") {
        setBacklogTasks((prev) => [...prev, ...movedTasks]);
      } else {
        setSprints((prev) =>
          prev.map((s) =>
            s.id === toTarget
              ? { ...s, tasks: [...s.tasks, ...movedTasks] }
              : s,
          ),
        );
      }
    }, 0);

    // ── Dispatch PUT API to sync tasks to the target sprint ──
    // ── Dispatch PUT API to sync tasks to the target sprint ──
    const sprintsPayload: any[] = [];
    if (fromSource && fromSource !== "backlog") {
      sprintsPayload.push({
        sprintId: fromSource,
        addTasksId: [],
        removeTasksId: taskIds,
      });
    }
    if (toTarget && toTarget !== "backlog") {
      sprintsPayload.push({
        sprintId: toTarget,
        addTasksId: taskIds,
        removeTasksId: [],
      });
    }

    if (sprintsPayload.length > 0) {
      dispatch({
        type: "SPRINT_UPDATE_API_REQUEST",
        payload: {
          method: "PUT",
          url: "sprint/syncTasks",
          body: {
            sprints: sprintsPayload,
          },
        },
      });
    }
  };

  // ── Sprint syncTasks success/error listeners ──
  useEffect(() => {
    if (store.sprint.isSuccessUpdate) {
      showToast({
        iconType: "checkmark",
        type: "success",
        title: store.sprint.dataUpdate?.message || "Tasks synced successfully",
      });
      dispatch({ type: "SPRINT_UPDATE_API_CLEAR" });
      // Re-fetch backlog and sprint data to get fresh server state
      if (projectId) {
        dispatch({
          type: "BACKLOG_GETLIST_API_REQUEST",
          payload: {
            url: "streamlineTask/backlog",
            method: "GET",
            query: { projectId },
          },
        });
        dispatch({
          type: "SPRINT_GETLIST_API_REQUEST",
          payload: {
            url: "sprint",
            method: "GET",
            query: { projectId },
          },
        });
      }
      setEditingSprintId(null);
      setNewSprintName("");
      setSprintStartDate(undefined);
      setSprintEndDate(undefined);
      setNewSprintModalVisible(false);
    }
  }, [store.sprint.isSuccessUpdate]);

  useEffect(() => {
    if (store.sprint.errorUpdate) {
      showToast({
        iconType: "error",
        type: "error",
        title: store.sprint.errorUpdate?.message || "Failed to sync tasks",
      });
      dispatch({ type: "SPRINT_UPDATE_API_CLEAR" });
      // Re-fetch to revert optimistic local state back to server truth
      if (projectId) {
        dispatch({
          type: "BACKLOG_GETLIST_API_REQUEST",
          payload: {
            url: "streamlineTask/backlog",
            method: "GET",
            query: { projectId },
          },
        });
        dispatch({
          type: "SPRINT_GETLIST_API_REQUEST",
          payload: {
            url: "sprint",
            method: "GET",
            query: { projectId },
          },
        });
      }
    }
  }, [store.sprint.errorUpdate]);

  // ── Sprint create success/error listeners ──
  useEffect(() => {
    if (store.sprint.isSuccessCreate) {
      showToast({
        iconType: "checkmark",
        type: "success",
        title: store.sprint.dataCreate?.message || "Sprint created successfully",
      });
      dispatch({ type: "SPRINT_CREATE_API_CLEAR" });
      setNewSprintName("");
      setSprintStartDate(undefined);
      setSprintEndDate(undefined);
      setNewSprintModalVisible(false);
      // Re-fetch sprint list to include the new sprint with its real UUID
      if (projectId) {
        dispatch({
          type: "SPRINT_GETLIST_API_REQUEST",
          payload: {
            url: "sprint",
            method: "GET",
            query: { projectId },
          },
        });
      }
    }
  }, [store.sprint.isSuccessCreate]);

  useEffect(() => {
    if (store.sprint.errorCreate) {
      showToast({
        iconType: "error",
        type: "error",
        title: store.sprint.errorCreate?.message || "Failed to create sprint",
      });
      dispatch({ type: "SPRINT_CREATE_API_CLEAR" });
    }
  }, [store.sprint.errorCreate]);

  // ═══════════════════════════════════════
  // ── Multi-Select Handlers ──
  // ═══════════════════════════════════════

  const handleToggleSelect = useCallback(
    (taskId: string, source: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (!isSelectionMode) {
        setSelectionSource(source);
        setSelectedTaskIds(new Set([taskId]));
      } else if (selectionSource === source) {
        setSelectedTaskIds((prev) => {
          const next = new Set(prev);
          if (next.has(taskId)) {
            next.delete(taskId);
          } else {
            next.add(taskId);
          }
          return next;
        });
      }
    },
    [isSelectionMode, selectionSource],
  );

  const clearSelection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedTaskIds(new Set());
    setSelectionSource(null);
  };

  // ═══════════════════════════════════════
  // ── Sprint / Status Actions ──
  // ═══════════════════════════════════════

  const handleStartCompleteSprint = (sprintId: string, sprintStatus?: string) => {
    const isCompleting = sprintStatus === "ONGOING";
    dispatch({
      type: "SPRINT_START_API_REQUEST",
      payload: {
        url: "sprint/start",
        method: "PATCH",
        query: { id: sprintId },
        body: isCompleting
          ? { startSprint: false, completedSprint: true }
          : { startSprint: true, completedSprint: false },
      },
    });
  };

  const statusOptions = useMemo(() => {
    return (statusData || []).map((s: any) => ({
      value: s.id,
      label: s.name,
      badgeColor: s.colorCode || theme.colors.brand.surface.medium,
      badgeText: "",
      isAvatarCircle: false,
    }));
  }, [statusData, theme]);

  const handleStatusChange = (taskId: string, newStatusId: string, source: string) => {
    const newStatusObj = (statusData || []).find((s: any) => s.id === newStatusId);
    if (!newStatusObj) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const updatedStatusName = newStatusObj.name;
    const updatedStatusColor = newStatusObj.colorCode;

    if (source === "backlog") {
      setBacklogTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: updatedStatusName, statusId: newStatusId, statusColor: updatedStatusColor } : t)),
      );
    } else {
      setSprints((prev) =>
        prev.map((s) =>
          s.id === source
            ? {
              ...s,
              tasks: s.tasks.map((t) =>
                t.id === taskId ? { ...t, status: updatedStatusName, statusId: newStatusId, statusColor: updatedStatusColor } : t,
              ),
            }
            : s,
        ),
      );
    }

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("statusId", newStatusId);
    dispatch({
      type: "STREAMLINE_TASK_UPDATE_API_REQUEST",
      payload: { method: "PUT", url: "streamlineTask", query: { id: taskId }, body: formData, isMultipart: true },
    });
  };

  const handleCreateSprint = () => {
    const name = newSprintName.trim();
    if (!name) {
      showToast({ iconType: "error", type: "error", title: "Sprint name is required" });
      return;
    }
    if (!sprintStartDate || !sprintEndDate) {
      showToast({ iconType: "error", type: "error", title: "Start date and end date are required" });
      return;
    }

    const formatDateForApi = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (editingSprintId) {
      dispatch({
        type: "SPRINT_UPDATE_API_REQUEST",
        payload: {
          method: "PUT",
          url: "sprint",
          query: { id: editingSprintId },
          body: {
            sprintName: name,
            startDate: formatDateForApi(sprintStartDate),
            endDate: formatDateForApi(sprintEndDate),
          },
        },
      });
    } else {
      dispatch({
        type: "SPRINT_CREATE_API_REQUEST",
        payload: {
          method: "POST",
          url: "sprint",
          body: {
            sprintName: name,
            startDate: formatDateForApi(sprintStartDate),
            endDate: formatDateForApi(sprintEndDate),
            projectId: projectId,
            status: "UPCOMING",
          },
        },
      });
    }
  };

  // ═══════════════════════════════════════
  // ── Search Filter ──
  // ═══════════════════════════════════════

  const filterTasks = (tasks: BacklogTask[]) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q) ||
        (t.epic && t.epic.toLowerCase().includes(q)),
    );
  };

  // ═══════════════════════════════════════
  // ── Column Config ──
  // ═══════════════════════════════════════

  const columns = useMemo(() => {
    const cols: {
      id: string;
      label: string;
      tasks: BacklogTask[];
      isSprint: boolean;
      sprint?: SprintItem;
    }[] = [];

    if (!showOnlySprints) {
      cols.push({
        id: "backlog",
        label: "Backlog",
        tasks: backlogTasks,
        isSprint: false,
      });
    }

    sprints.forEach((sprint) => {
      cols.push({
        id: sprint.id,
        label: sprint.name,
        tasks: sprint.tasks,
        isSprint: true,
        sprint,
      });
    });

    return cols;
  }, [sprints, backlogTasks, showOnlySprints]);

  // ── Drop targets for popup ──
  const dropTargets = useMemo(() => {
    const targets: {
      id: string;
      label: string;
      subtitle?: string;
      count: number;
      isActive?: boolean;
    }[] = [];

    if (!showOnlySprints) {
      targets.push({ id: "backlog", label: "Backlog", count: backlogTasks.length });
    }

    sprints.forEach((s) => {
      targets.push({
        id: s.id,
        label: s.name,
        subtitle: s.dates,
        count: s.tasks.length,
        isActive: s.active,
      });
    });

    return targets;
  }, [sprints, backlogTasks, showOnlySprints]);

  // Current drag/floating source
  const activeSource = dragSource || floatingPayload?.source || null;

  // ═══════════════════════════════════════
  // ── Render ──
  // ═══════════════════════════════════════

  return (
    <View
      ref={containerRef}
      onLayout={onContainerLayout}
      style={styles.container}
    >
      {/* ── Loading State ── */}

      {/* ── Error State ── */}
      {apiError && !isLoading && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.negative.surface.lighter }]}>
          <Typography fontVariant="BS" variant="semibold" color="colors.negative.onSurface.light" align="center">
            {apiError?.message || String(apiError)}
          </Typography>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              // Dispatch retry action
              dispatch({
                type: "BACKLOG_GETLIST_API_REQUEST",
                payload: {
                  url: "streamlineTask/backlog",
                  method: "GET",
                  query: {
                    projectId: projectId,
                  },
                },
              });
              dispatch({
                type: "SPRINT_GETLIST_API_REQUEST",
                payload: {
                  url: "sprint",
                  method: "GET",
                  query: {
                    projectId: projectId,
                  },
                },
              });
            }}
            style={[styles.retryButton, { backgroundColor: theme.colors.negative.surface.medium }]}
          >
            <Typography fontVariant="BXS" variant="semibold" color="colors.negative.onSurface.light">
              Retry
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Top Bar ── */}
      <View style={styles.filterSection}>
        {isLoading && (apiBacklogData.length > 0 || apiSprintData.length > 0) && (
          <View style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
            <ActivityIndicator size="small" color={theme.colors.brand.surface.medium} />
          </View>
        )}
        <Input
          placeholder={
            showOnlySprints
              ? "Search Sprint, task, story or epic"
              : "Search task, story or Epic"
          }
          value={searchQuery}
          onChangeText={(text) => setSearchQuery && setSearchQuery(text)}
          leftIcon={
            <Search
              width={16}
              height={16}
              color={theme.colors.neutral.onSurface.dark}
              style={styles.searchIcon}
            />
          }
          rightIcon={
            searchQuery ? (
              <Close
                width={16}
                height={16}
                color={theme.colors.neutral.onSurface.dark}
              />
            ) : undefined
          }
          onRightIconClick={() => setSearchQuery && setSearchQuery("")}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          <Dropdown
            placeholder="Epic"
            options={(taskTypeData || []).map((t: any) => ({ value: t.id, label: t.name }))}
            selectedValue={selectedEpic}
            onValueChange={setSelectedEpic}
            onEndReached={() => {
              if (!isTaskTypeLoading && getProjectTaskType && taskTypePage && taskTypeTotalPages) {
                if (taskTypePage <= taskTypeTotalPages) {
                  getProjectTaskType(taskTypePage);
                }
              }
            }}
            containerStyle={{ width: 120, marginBottom: 0, marginRight: 8 }}
            inputStyle={{ height: 32, paddingHorizontal: 12, paddingLeft: 12, backgroundColor: "#ffffff" }}
          />
          <Dropdown
            placeholder="Tag"
            multiple={true}
            options={(tagData || []).map((t: any) => ({
              value: t.id,
              label: t.name,
              badgeColor: t.colorCode || theme.colors.brand.surface.medium,
              badgeText: "T",
            }))}
            selectedValues={selectedTag}
            onValuesChange={setSelectedTag}
            onEndReached={() => {
              if (!isTagLoading && getProjectTag && tagPage && tagTotalPages) {
                if (tagPage <= tagTotalPages) {
                  getProjectTag(tagPage);
                }
              }
            }}
            containerStyle={{ width: 120, marginBottom: 0, marginRight: 8 }}
            inputStyle={{ height: 32, paddingHorizontal: 12, paddingLeft: 12, backgroundColor: "#ffffff" }}
          />
          <Dropdown
            placeholder="Priority"
            options={(priorityData || []).map((p: any) => ({
              value: p.id,
              label: p.name,
              badgeColor: p.colorCode || theme.colors.brand.surface.medium,
              badgeText: "P",
            }))}
            selectedValue={selectedPriority}
            onValueChange={setSelectedPriority}
            onEndReached={() => {
              if (!isPriorityLoading && getProjectPriority && priorityPage && priorityTotalPages) {
                if (priorityPage <= priorityTotalPages) {
                  getProjectPriority(priorityPage);
                }
              }
            }}
            containerStyle={{ width: 120, marginBottom: 0, marginRight: 8 }}
            inputStyle={{ height: 32, paddingHorizontal: 12, paddingLeft: 12, backgroundColor: "#ffffff" }}
          />

        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
          {(!!searchQuery || !!selectedEpic || (selectedTag && selectedTag.length > 0) || !!selectedPriority) && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery && setSearchQuery("");
                setSelectedEpic && setSelectedEpic("");
                setSelectedTag && setSelectedTag([]);
                setSelectedPriority && setSelectedPriority("");
              }}
              style={{ justifyContent: 'center' }}
            >
              <Typography fontVariant="BXS" variant="semibold" color="colors.brand.surface.medium">Clear All</Typography>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setEditingSprintId(null);
              setNewSprintName("");
              setSprintStartDate(undefined);
              setSprintEndDate(undefined);
              setNewSprintModalVisible(true);
            }}
            style={[
              styles.newSprintPill,
              { backgroundColor: theme.colors.brand.surface.lighter, alignSelf: 'auto' },
            ]}
          >
            <Typography
              fontVariant="BXS"
              variant="semibold"
              color="colors.brand.onSurface.light"
            >
              + New Sprint
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Horizontal Column Deck ── */}
      {!apiError && (
        <FlatList
          ref={scrollViewRef as any}
          data={columns}
          keyExtractor={(col) => col.id}
          horizontal
          pagingEnabled={false}
          decelerationRate="fast"
          snapToInterval={COLUMN_WIDTH + 16}
          snapToAlignment="start"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.boardScroll}
          scrollEnabled={!isDragging && !isFloatingDragging}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={Platform.OS === "android"}
          renderItem={({ item: col }) => {
            const filteredColTasks = filterTasks(col.tasks);
            const sprint = col.sprint;

            return (
              <View
                style={[
                  styles.boardColumn,
                  { backgroundColor: theme.colors.neutral.surface.light },
                ]}
              >
                {/* Column Header */}
                <View
                  style={[
                    styles.columnHeader,
                    { borderBottomColor: theme.colors.neutral.border.light },
                  ]}
                >
                  <View style={styles.columnHeaderTop}>
                    <View style={styles.columnTitleRow}>
                      <Typography
                        fontVariant="LM"
                        variant="bold"
                        color={
                          col.isSprint
                            ? "colors.brand.onSurface.light"
                            : "colors.neutral.onSurface.light"
                        }
                        style={styles.columnTitle}
                      >
                        {col.label}
                      </Typography>
                      <View
                        style={[
                          styles.issueCountBadge,
                          {
                            backgroundColor: col.isSprint
                              ? theme.colors.brand.surface.lighter
                              : theme.colors.neutral.surface.medium,
                          },
                        ]}
                      >
                        <Typography
                          fontVariant="LXS"
                          variant="bold"
                          color={
                            col.isSprint
                              ? "colors.brand.onSurface.light"
                              : "colors.neutral.onSurface.light"
                          }
                        >
                          {col.tasks.length}
                        </Typography>
                      </View>
                    </View>
                    {sprint && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {sprint.sprintStatus && (
                          <View style={{
                            backgroundColor: sprint.sprintStatus === "ONGOING" ? theme.colors.brand.surface.lighter : theme.colors.neutral.surface.lighter,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                            marginRight: 8,
                          }}>
                            <Typography
                              fontVariant="LXS"
                              variant="bold"
                              color={sprint.sprintStatus === "ONGOING" ? "colors.brand.onSurface.light" : "colors.neutral.onSurface.dark"}
                            >
                              {sprint.sprintStatus.toUpperCase()}
                            </Typography>
                          </View>
                        )}
                        <Dropdown
                          placeholder=""
                          options={[{ value: "edit", label: "Edit Sprint" }]}
                          onValueChange={(val) => {
                            if (val === "edit") {
                              setEditingSprintId(sprint.id);
                              setNewSprintName(sprint.name);
                              setSprintStartDate(sprint.rawStartDate ? new Date(sprint.rawStartDate) : undefined);
                              setSprintEndDate(sprint.rawEndDate ? new Date(sprint.rawEndDate) : undefined);
                              setNewSprintModalVisible(true);
                            }
                          }}
                          hideClearIcon={true}
                          minDropdownWidth={120}
                          containerStyle={{ width: 'auto', marginBottom: 0 }}
                          customTrigger={
                            <View style={styles.columnMoreBtn}>
                              <MoreVert width={16} height={16} color={theme.colors.neutral.onSurface.dark} viewBox="0 0 24 24" />
                            </View>
                          }
                        />
                      </View>
                    )}
                  </View>

                  {sprint && (
                    <View style={styles.sprintMetaRow}>
                      <View style={styles.sprintDateRow}>
                        <CalendarToday width={12} height={12} color={theme.colors.neutral.onSurface.dark} />
                        <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                          {sprint.dates}
                        </Typography>
                      </View>
                      {sprint.sprintStatus !== "COMPLETED" && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleStartCompleteSprint(sprint.id, sprint.sprintStatus)}
                          style={[
                            styles.sprintActionBtn,
                            {
                              backgroundColor: sprint.sprintStatus === "ONGOING"
                                ? theme.colors.neutral.surface.lighter
                                : theme.colors.brand.surface.medium,
                            },
                          ]}
                        >
                          <Typography
                            fontVariant="LXS"
                            variant="semibold"
                            color={sprint.sprintStatus === "ONGOING" ? "colors.neutral.onSurface.light" : "#ffffff"}
                          >
                            {sprint.sprintStatus === "ONGOING" ? "Complete" : "Start"}
                          </Typography>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                {/* Cards */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.columnCardsScroll}
                  scrollEnabled={!isDragging && !isFloatingDragging}
                >
                  {filteredColTasks.length > 0 ? (
                    filteredColTasks.map((task) => (
                      <BacklogTaskCard
                        key={task.id}
                        task={task}
                        source={col.id}
                        isSelected={selectedTaskIds.has(task.id)}
                        isSelectionMode={isSelectionMode}
                        isGhost={ghostTaskIds.has(task.id)}
                        themeColors={theme.colors}
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        onToggleSelect={handleToggleSelect}
                        onStatusChange={handleStatusChange}
                        dragPosition={dragPosition}
                        statusOptions={statusOptions}
                        onPressCard={handlePressCard}
                      />
                    ))
                  ) : (
                    <View style={styles.emptyColumn}>
                      <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" align="center">
                        {searchQuery
                          ? "No tasks match your search."
                          : col.isSprint
                            ? "Drag issues here to plan this sprint."
                            : "No backlog items."}
                      </Typography>
                    </View>
                  )}



                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.createIssueTrigger}
                    onPress={() => router.push({ pathname: "/(protected)/(streamLine)/createTask", params: { projectId } })}
                  >
                    <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.dark">
                      + Create issue
                    </Typography>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            );
          }}
        />
      )}

      {/* ── Multi-Select Bar ── */}
      {isSelectionMode && !isDragging && !hasFloating && (
        <SelectionActionBar
          selectedCount={selectedTaskIds.size}
          onClearSelection={clearSelection}
          themeColors={theme.colors}
        />
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ── Drop Popup (compact card from right) ──    */}
      {/* ══════════════════════════════════════════════ */}
      {isPopupMounted && (
        <View
          style={styles.popupContainer}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.popupCard,
              {
                backgroundColor: "#ffffff",
                borderColor: theme.colors.neutral.border.light,
                transform: [{ translateX: popupTranslateX }],
              },
            ]}
          >
            {/* Drop Target Rows */}
            <ScrollView
              ref={popupScrollRef}
              showsVerticalScrollIndicator={false}
              bounces={false}
              onLayout={(e) => {
                (popupScrollRef.current as any)?.measureInWindow((_x: number, y: number, _w: number, height: number) => {
                  popupScrollLayout.current = { y, height };
                });
              }}
              onScroll={(e) => {
                popupScrollY.current = e.nativeEvent.contentOffset.y;
                targetScrollY.current = e.nativeEvent.contentOffset.y;
              }}
              scrollEventThrottle={16}
            >
              {dropTargets.map((target) => {
                const isSource = target.id === activeSource;
                const isHovered = hoveredDropTarget === target.id;

                return (
                  <PopupRowComponent
                    key={target.id}
                    target={target}
                    isSource={isSource}
                    isHovered={isHovered}
                    theme={theme}
                    onLayout={(e) => {
                      const { y, height } = e.nativeEvent.layout;
                      popupRowLayouts.current[target.id] = { y, height };
                    }}
                  />
                );
              })}
            </ScrollView>

            {/* New Sprint */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                animatePopup(false);
                setTimeout(() => setNewSprintModalVisible(true), 200);
              }}
              disabled={isDragging || isFloatingDragging}
              style={[
                styles.popupNewSprint,
                {
                  borderTopColor: theme.colors.neutral.border.light,
                  opacity: isDragging || isFloatingDragging ? 0.3 : 1,
                },
              ]}
            >
              <Typography fontVariant="BXS" variant="semibold" color="colors.brand.onSurface.light">
                + New Sprint
              </Typography>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ── Floating Icon (failed drop) ──             */}
      {/* ══════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════ */}
      {/* ── Floating Icon (failed drop) ──             */}
      {/* ══════════════════════════════════════════════ */}
      {hasFloating && !isDragging && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <FloatingDropButton
            floatingPayload={floatingPayload!}
            floatingPos={floatingPos}
            panHandlers={floatingPanResponder.panHandlers}
            themeColors={theme.colors}
            onClose={clearFloating}
          />
          {/* Overlay to catch the close button press since PanResponder intercepts touches */}
          <Animated.View
            style={[
              { position: "absolute", zIndex: 10000, elevation: 10000 },
              { transform: floatingPos.getTranslateTransform() }
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={clearFloating}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 20,
                height: 20,
              }}
            />
          </Animated.View>
        </View>
      )}

      {/* ── Drag Overlay ── */}
      {isDragging && draggingTasks.length > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View
            style={[
              styles.dragOverlayWrapper,
              { transform: dragPosition.getTranslateTransform() },
            ]}
          >
            <DragOverlayCard tasks={draggingTasks} themeColors={theme.colors} />
          </Animated.View>
        </View>
      )}



      {/* ── New Sprint Modal ── */}
      {newSprintModalVisible && (
        <Modal
          transparent
          visible={newSprintModalVisible}
          statusBarTranslucent
          animationType="fade"
          onRequestClose={() => setNewSprintModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setNewSprintModalVisible(false)}>
            <View style={styles.sprintModalBackdrop}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.newSprintCard,
                    {
                      backgroundColor: "#ffffff",
                      borderColor: theme.colors.neutral.border.light,
                    },
                  ]}
                >
                  <Typography fontVariant="TM" variant="semibold" color="colors.neutral.onSurface.light" style={styles.newSprintTitle}>
                    {editingSprintId ? "Edit sprint" : "New sprint"}
                  </Typography>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Input label="Sprint Name*" placeholder="Enter sprint name" value={newSprintName} onChangeText={setNewSprintName} />
                    <View style={{ marginBottom: 16 }}>
                      <DatePicker mode="single" label="Start date" placeholder="Select start date" value={sprintStartDate} onChange={setSprintStartDate} />
                    </View>
                    <View style={{ marginBottom: 16 }}>
                      <DatePicker mode="single" label="End date" placeholder="Select end date" value={sprintEndDate} onChange={setSprintEndDate} />
                    </View>
                    <View style={styles.modalButtonsRow}>
                      <View style={styles.modalButtonWrapper}>
                        <CustomButton variant="dull" title="Cancel" size="xs" onPress={() => setNewSprintModalVisible(false)} />
                      </View>
                      <View style={styles.modalButtonWrapper}>
                        <CustomButton variant="primary" title={editingSprintId ? "Update" : "Create"} size="xs" onPress={handleCreateSprint} />
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
}

// ═══════════════════════════════════════
// ── Styles ──
// ═══════════════════════════════════════

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Loading / Error States ──
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },

  // ── Filter / Search ──
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchIcon: { marginRight: 8 },
  filtersScroll: { gap: 8, alignItems: "center" },
  filterPill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  newSprintPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-end'
  },

  // ── Columns ──
  boardScroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  boardColumn: {
    width: COLUMN_WIDTH,
    borderRadius: 10,
    maxHeight: "92%",
    overflow: "hidden",
  },
  columnHeader: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  columnHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  columnTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  columnTitle: { fontSize: 14 },
  issueCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: "center",
  },
  columnMoreBtn: { padding: 4 },
  sprintMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  sprintDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sprintActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  columnCardsScroll: {
    padding: 10,
    paddingBottom: 16,
  },
  emptyColumn: {
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  createIssueTrigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  loadMoreBtn: {
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    marginVertical: 6,
  },

  // ── Selection Bar ──
  selectionBar: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  selectionBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectionCount: { marginLeft: 2 },

  // ── Drop Popup (compact card) ──
  popupContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 12,
  },
  popupCard: {
    width: POPUP_WIDTH,
    maxHeight: "85%",
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  popupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderRadius: 0,
    position: "relative",
    overflow: "hidden",
  },
  popupRowAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  popupRowInfo: {
    flex: 1,
    gap: 2,
  },
  popupRowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  popupActiveBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  popupRowCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 22,
    alignItems: "center",
    marginLeft: 8,
  },
  popupNewSprint: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    alignItems: "center",
  },

  // ── Floating Stack ──
  floatingStackContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    zIndex: 999,
  },
  floatingSquare: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  floatingStackLayer: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  floatingCloseIconBtn: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },

  // ── Drag Overlay ──
  dragOverlayWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0.92,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 12,
    zIndex: 9999,
  },

  // ── Status Modal ──
  statusModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
  },
  statusCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  statusCardTitle: { marginBottom: 12, paddingHorizontal: 8 },
  statusOptionRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 2,
  },

  // ── Sprint Modal ──
  sprintModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  newSprintCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
  newSprintTitle: { marginBottom: 16 },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "60%",
    alignSelf: "flex-end",
  },
  modalButtonWrapper: { flex: 1 },
});

interface PopupRowProps {
  target: {
    id: string;
    label: string;
    isActive?: boolean;
    subtitle?: string;
    count: number;
  };
  isSource: boolean;
  isHovered: boolean;
  theme: any;
  onLayout: (e: any) => void;
}

const PopupRowComponent: React.FC<PopupRowProps> = React.memo(({
  target,
  isSource,
  isHovered,
  theme,
  onLayout,
}) => {
  const hoverAnim = useRef(new Animated.Value(isHovered ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(hoverAnim, {
      toValue: isHovered ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isHovered]);

  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const borderCol = theme?.colors?.brand?.border?.medium || "#008FF5";
  const startBorder = hexToRgba(borderCol, 0);
  const endBorder = hexToRgba(borderCol, 1);

  const borderColor = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [startBorder, endBorder],
  });

  const startBg = isSource ? (theme?.colors?.neutral?.surface?.light || "#f5f5f5") : "rgba(255, 255, 255, 0)";
  const endBg = theme?.colors?.brand?.surface?.lighter || "#eff4ff";

  const backgroundColor = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [startBg, endBg],
  });

  const accentWidth = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  const accentOpacity = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const startTextColor = theme?.colors?.neutral?.onSurface?.light || "#262626";
  const endTextColor = theme?.colors?.brand?.onSurface?.light || "#0072c4";

  const textColor = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [startTextColor, endTextColor],
  });

  const startCountBg = theme?.colors?.neutral?.surface?.light || "#f5f5f5";
  const endCountBg = theme?.colors?.brand?.surface?.lighter || "#eff4ff";

  const countBgColor = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [startCountBg, endCountBg],
  });

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.popupRow,
        {
          borderColor,
          backgroundColor,
          opacity: isSource ? 0.35 : 1,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.popupRowAccent,
          {
            backgroundColor: theme.colors.brand.surface.medium,
            width: accentWidth,
            opacity: accentOpacity,
          },
        ]}
      />

      <View style={styles.popupRowInfo}>
        <View style={styles.popupRowTitleLine}>
          <Animated.Text
            style={{
              fontFamily: "OpenSansBold",
              fontSize: 12,
              lineHeight: 16,
              color: textColor,
            }}
          >
            {target.label}
          </Animated.Text>
          {target.isActive && (
            <View
              style={[
                styles.popupActiveBadge,
                { backgroundColor: theme.colors.positive.surface.lighter },
              ]}
            >
              <Typography fontVariant="LXS" variant="bold" color="colors.positive.onSurface.light">
                ●
              </Typography>
            </View>
          )}
        </View>
        {target.subtitle && (
          <Typography fontVariant="LXS" color="colors.neutral.onSurface.dark">
            {target.subtitle}
          </Typography>
        )}
      </View>

      <Animated.View
        style={[
          styles.popupRowCount,
          {
            backgroundColor: countBgColor,
          },
        ]}
      >
        <Animated.Text
          style={{
            fontFamily: "OpenSansBold",
            fontSize: 12,
            lineHeight: 16,
            color: textColor,
          }}
        >
          {target.count}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
});

