import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Dimensions,
  Image,
  Animated,
  PanResponder,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { BaseTask, FloatingPayload } from "../dragDrop/types";
import DragOverlayCard from "../dragDrop/DragOverlayCard";
import FloatingDropButton from "../dragDrop/FloatingDropButton";
import SelectionActionBar from "../dragDrop/SelectionActionBar";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import Input from "../textInput";
import Dropdown from "../dropdown";
import Tag from "../tag";
import BoardCard, { BoardTask } from "../boardCard";
import { Search, CalendarToday, Edit, CalendarX2, Close } from "@/svg_icons";
import Svg, { Path } from "react-native-svg";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_WIDTH = SCREEN_WIDTH * 0.86;

// SVG Chevron Icons
const ChevronDown = ({
  color = "#151515",
  size = 14,
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

interface BoardContentProps {
  boardData?: any[];
  boardPage?: number;
  boardTotalPages?: number;
  isBoardLoading?: boolean;
  getBoard?: (page?: number, sprintId?: string) => void;
  statusData?: any[];
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
  sprintData?: any[];
  sprintPage?: number;
  sprintTotalPages?: number;
  isSprintLoading?: boolean;
  getProjectSprint?: (page: number) => void;
  boardSprint?: any;
  projectId?: string;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  selectedEpic?: string;
  setSelectedEpic?: (e: string) => void;
  selectedTag?: string[];
  setSelectedTag?: (t: string[]) => void;
  selectedPriority?: string;
  setSelectedPriority?: (p: string) => void;
  selectedSprint?: string;
  setSelectedSprint?: (s: string) => void;
}

export default function BoardContent({
  boardData = [],
  boardPage = 1,
  boardTotalPages = 1,
  isBoardLoading = false,
  getBoard,
  statusData = [],
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
  sprintData = [],
  sprintPage = 1,
  sprintTotalPages = 1,
  isSprintLoading = false,
  getProjectSprint,
  boardSprint,
  projectId: propProjectId,
  searchQuery = "",
  setSearchQuery,
  selectedEpic = "",
  setSelectedEpic,
  selectedTag = [],
  setSelectedTag,
  selectedPriority = "",
  setSelectedPriority,
  selectedSprint = "",
  setSelectedSprint,
}: BoardContentProps) {
  const { theme } = useTheme();

  // Root view layout measure refs to auto-calculate layout top offsets
  const boardRef = useRef<View>(null);
  const boardScreenYRef = useRef(0);

  const onBoardLayout = () => {
    boardRef.current?.measureInWindow((x, y) => {
      boardScreenYRef.current = y;
    });
  };

  // Filter states and search keyword state passed via props

  // Stateful Kanban Tasks lists per column
  const [tasks, setTasks] = useState<BoardTask[]>([]);

  React.useEffect(() => {
    if (!boardData) return;
    const mapped = boardData.map((task: any) => {
      const isEpic = task.taskType?.name?.toLowerCase() === "epic";
      const currentEpic = isEpic ? task.name : (task.parentId?.name || (task.tags && task.tags[0]?.name));
      return {
        ...task,
        key: task.taskKey || task.key || "PRJ-1",
        epic: currentEpic,
      };
    });
    setTasks(mapped);
  }, [boardData]);

  const dispatch = useMiddlewareDispatch();
  const router = useRouter();
  const { projectId: routeProjectId } = useLocalSearchParams<{ projectId: string }>();
  const projectId = propProjectId || routeProjectId;

  const handlePressCard = useCallback((taskId: string) => {
    router.push({
      pathname: "/(protected)/(streamLine)/viewTask",
      params: { taskId, projectId }
    });
  }, [router, projectId]);

  // Inline Composer Card State
  const [inlineComposerColumn, setInlineComposerColumn] = useState<
    BoardTask["status"] | null
  >(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardType, setNewCardType] = useState<"task" | "story" | "bug">(
    "task",
  );

  // ── Multi-Select ──
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
  const isSelectionMode = isSelectionModeActive || selectedTaskIds.size > 0;

  const handleToggleSelect = (taskId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const clearSelection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedTaskIds(new Set());
    setIsSelectionModeActive(false);
  };

  // ── Drag & Drop Gestures State ──
  const [draggingTaskIds, setDraggingTaskIds] = useState<string[]>([]);
  const [draggingTasks, setDraggingTasks] = useState<BoardTask[]>([]);
  const isDragging = draggingTaskIds.length > 0;

  // Floating Icon State (for invalid drops / empty space drops)
  const [floatingPayload, setFloatingPayloadState] = useState<FloatingPayload<BoardTask> | null>(null);
  const floatingPayloadRef = useRef<FloatingPayload<BoardTask> | null>(null);
  const setFloatingPayload = (payload: FloatingPayload<BoardTask> | null) => {
    floatingPayloadRef.current = payload;
    setFloatingPayloadState(payload);
  };
  const floatingPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const hasFloating = floatingPayload !== null;
  const latestDragPagePos = useRef({ x: 0, y: 0 });

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
    outputRange: [240, 0],
  });

  const hoveredDropTargetRef = useRef<BoardTask["status"] | null>(null);
  const setHoveredTarget = (target: BoardTask["status"] | null) => {
    hoveredDropTargetRef.current = target;
    setHoveredDropTarget(target);
  };

  const clearFloating = () => {
    setFloatingPayload(null);
    if (isSelectionMode) clearSelection();
    animatePopup(false);
  };

  const floatingPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: () => {
          activeSourceRef.current = floatingPayloadRef.current?.source as BoardTask["status"] || null;
          floatingPos.setOffset({
            x: (floatingPos.x as any)._value,
            y: (floatingPos.y as any)._value,
          });
          floatingPos.setValue({ x: 0, y: 0 });
          animatePopup(true);
        },
        onPanResponderMove: Animated.event(
          [null, { dx: floatingPos.x, dy: floatingPos.y }],
          {
            useNativeDriver: false,
            listener: ((evt: any, gestureState: any) => {
              const moveX = gestureState.moveX;
              const moveY = gestureState.moveY;

              if (moveX > SCREEN_WIDTH - 200) {
                const simulatedY = moveY - popupContainerY.current;
                let target: BoardTask["status"] | null = null;
                for (const [id, m] of Object.entries(popupRowLayouts.current)) {
                  if (simulatedY >= m.y && simulatedY <= m.y + m.height && id !== activeSourceRef.current) {
                    target = id as BoardTask["status"];
                    break;
                  }
                }
                if (hoveredDropTargetRef.current !== target) {
                  setHoveredTarget(target);
                }
              } else if (hoveredDropTargetRef.current !== null) {
                setHoveredTarget(null);
              }
            }) as any
          }
        ) as any,
        onPanResponderRelease: (evt, gs) => {
          floatingPos.flattenOffset();

          const target = hoveredDropTargetRef.current;
          if (target && floatingPayloadRef.current) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            const { taskIds } = floatingPayloadRef.current;
            const taskIdSet = new Set(taskIds);
            setTasks((prev) =>
              prev.map((t) =>
                taskIdSet.has(t.id) ? { ...t, status: target } : t
              )
            );
            taskIds.forEach((tId) => {
              const formData = new FormData();
              formData.append("projectId", projectId);
              formData.append("status", target);
              dispatch({
                type: "STREAMLINE_TASK_UPDATE_API_REQUEST",
                payload: { method: "PUT", url: "streamlineTask", query: { id: tId }, body: formData, isMultipart: true },
              });
            });
            clearFloating();
          } else {
            animatePopup(false);
          }

          setHoveredTarget(null);
          activeSourceRef.current = null;
        },
      }),
    [floatingPos, animatePopup]
  );



  const [hoveredDropTarget, setHoveredDropTarget] = useState<BoardTask["status"] | null>(null);
  const popupRowLayouts = useRef<Record<string, { y: number; height: number }>>({});
  const popupContainerY = useRef(0);
  const popupCardRef = useRef<View>(null);

  // Animated values for active coordinate drag translation
  const dragPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const initialCardPos = useRef({ x: 0, y: 0 });
  const scrollXOffsetRef = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const activeSourceRef = useRef<BoardTask["status"] | null>(null);

  const handleDragStart = (
    task: BoardTask,
    pageX: number,
    pageY: number,
    locationX: number,
    locationY: number,
  ) => {
    if (floatingPayload) {
      clearFloating();
    }

    let tasksToDrag: BoardTask[];
    let taskIdsToDrag: string[];

    if (isSelectionMode && selectedTaskIds.has(task.id)) {
      tasksToDrag = tasks.filter((t) => selectedTaskIds.has(t.id));
      taskIdsToDrag = tasksToDrag.map((t) => t.id);
    } else {
      tasksToDrag = [task];
      taskIdsToDrag = [task.id];
    }

    setDraggingTasks(tasksToDrag);
    setDraggingTaskIds(taskIdsToDrag);
    activeSourceRef.current = task.status;
    setHoveredDropTarget(null);

    // Calculate initial card Y coordinate relative to BoardContent to prevent layout offset jumps.
    // We center the card horizontally and shift it slightly up to align naturally with the finger,
    // because nativeEvent.locationX/Y are notoriously unreliable when pressing nested text elements.
    const CARD_WIDTH = COLUMN_WIDTH - 16;
    const cardX = pageX - (CARD_WIDTH / 2);
    const cardY = pageY - 40 - boardScreenYRef.current;

    initialCardPos.current = { x: cardX, y: cardY };
    latestDragPagePos.current = { x: pageX, y: pageY };

    dragPosition.setOffset({ x: cardX, y: cardY });
    dragPosition.setValue({ x: 0, y: 0 });

    setTimeout(() => {
      animatePopup(true);
    }, 150);
  };

  const handleDragMove = (
    gestureStateDx: number,
    gestureStateDy: number,
    moveX: number,
    moveY: number,
  ) => {
    if (moveX && moveY) {
      latestDragPagePos.current = { x: moveX, y: moveY };
    }

    // Intersection with popup rows
    if (moveX > SCREEN_WIDTH - 200) { // roughly within popup width
      const simulatedY = moveY - popupContainerY.current;
      let target: BoardTask["status"] | null = null;
      for (const [id, m] of Object.entries(popupRowLayouts.current)) {
        if (simulatedY >= m.y && simulatedY <= m.y + m.height && id !== activeSourceRef.current) {
          target = id as BoardTask["status"];
          break;
        }
      }
      if (hoveredDropTargetRef.current !== target) {
        setHoveredTarget(target);
      }
    } else {
      if (hoveredDropTargetRef.current !== null) {
        setHoveredTarget(null);
      }
    }
  };

  const handleDragEnd = () => {
    const currentTarget = hoveredDropTargetRef.current;
    if (draggingTaskIds.length > 0 && currentTarget) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const taskIdSet = new Set(draggingTaskIds);

      const newStatusObj = statusData?.find((s: any) => s.id === currentTarget);

      setTasks((prev) =>
        prev.map((t) =>
          taskIdSet.has(t.id) ? { ...t, status: newStatusObj || { id: currentTarget } } : t,
        ),
      );

      draggingTaskIds.forEach((tId) => {
        const formData = new FormData();
        formData.append("projectId", projectId);
        formData.append("status", currentTarget);
        dispatch({
          type: "STREAMLINE_TASK_UPDATE_API_REQUEST",
          payload: { method: "PUT", url: "streamlineTask", query: { id: tId }, body: formData, isMultipart: true },
        });
      });

      if (isSelectionMode) clearSelection();
    } else if (draggingTaskIds.length > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      // ❌ Invalid drop (did not drop on popup status) — enter floating state
      setFloatingPayload({
        tasks: [...draggingTasks],
        source: draggingTasks[0].status?.id,
        taskIds: [...draggingTaskIds],
      });
      floatingPos.flattenOffset();
      floatingPos.setValue({
        x: latestDragPagePos.current.x - 25,
        y: latestDragPagePos.current.y - boardScreenYRef.current - 25,
      });
    }

    setDraggingTaskIds([]);
    setDraggingTasks([]);
    setHoveredTarget(null);
    animatePopup(false);
    activeSourceRef.current = null;
    dragPosition.flattenOffset();
  };

  // Frontend filtering removed. Using 'tasks' directly as data is already filtered from backend
  const filteredTasks = tasks;

  // Columns helper
  const columns: { label: string; value: BoardTask["status"]; colorCode?: string }[] = useMemo(() => {
    if (!statusData || statusData.length === 0) return [];
    return statusData.map((s: any) => ({
      label: s.name,
      value: s.id,
      colorCode: s.colorCode || theme.colors.neutral.surface.dark
    }));
  }, [statusData, theme]);

  const statusOptions = useMemo(() => {
    if (!statusData || statusData.length === 0) return [];
    return statusData.map((s: any) => ({
      value: s.id,
      label: s.name,
      badgeColor: s.colorCode || theme.colors.neutral.surface.dark,
      badgeText: "●",
      isAvatarCircle: true,
    }));
  }, [statusData, theme]);

  // Column specific tasks filtering
  const getColumnTasks = (statusId: BoardTask["status"]) => {
    return filteredTasks.filter((t) => t.status?.id === statusId);
  };

  // Handle status changes (moving card to different column via dropdown)
  const handleStatusChange = useCallback((taskId: string, newStatusId: string) => {
    const newStatusObj = statusData?.find((s: any) => s.id === newStatusId);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatusObj || { id: newStatusId } } : t)),
    );

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("status", newStatusId);
    dispatch({
      type: "STREAMLINE_TASK_UPDATE_API_REQUEST",
      payload: {
        method: "PUT",
        url: "streamlineTask",
        query: { id: taskId },
        body: formData,
        isMultipart: true,
      },
    });
  }, [statusData, projectId, dispatch]);

  // Handle inline card creation
  const handleCreateInlineCard = (column: BoardTask["status"]) => {
    const title = newCardTitle.trim();
    if (!title) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const newCard: BoardTask = {
      id: `task-${Date.now()}`,
      name: title,
      taskType: { name: newCardType, colorCode: "#1565c0" },
      status: statusData?.find((s: any) => s.id === column) || { id: column },
    };

    setTasks((prev) => [...prev, newCard]);

    // Reset composer state
    setNewCardTitle("");
    setInlineComposerColumn(null);
  };

  return (
    <View ref={boardRef} onLayout={onBoardLayout} style={styles.container}>
      {/* ── Sprint Info Row ── */}
      {boardSprint && (
        <View style={[
          styles.sprintInfoRow,
          {
            backgroundColor: theme.colors.neutral.surface.lighter,
            borderColor: theme.colors.neutral.border.light,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.brand.surface.medium
          }
        ]}>
          <View style={styles.sprintInfoLeft}>
            <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" style={styles.sprintTitle}>
              {boardSprint.sprintName || boardSprint.name}
            </Typography>
            {(boardSprint.startDate || boardSprint.endDate) && (
              <View style={styles.calendarInterval}>
                <CalendarX2 color={theme.colors.neutral.onSurface.medium} width={14} height={14} style={styles.calendarIcon} />
                <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                  {boardSprint.startDate ? new Date(boardSprint.startDate).toLocaleDateString() : ""}
                  {boardSprint.startDate && boardSprint.endDate ? " - " : ""}
                  {boardSprint.endDate ? new Date(boardSprint.endDate).toLocaleDateString() : ""}
                </Typography>
              </View>
            )}
          </View>
          <View style={styles.sprintInfoRight}>
            <View style={[
              styles.completeBtn,
              { backgroundColor: boardSprint.status === "COMPLETED" ? theme.colors.positive.surface.medium : theme.colors.brand.surface.medium }
            ]}>
              <Typography fontVariant="BXS" variant="semibold" color="colors.neutral.surface.lighter">
                {boardSprint.status || "ONGOING"}
              </Typography>
            </View>
          </View>
        </View>
      )}

      {/* ── 2. Search Bar & Filters & Stack Avatars Row ── */}
      <View style={styles.filterSection}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={(text) => setSearchQuery && setSearchQuery(text)}
              leftIcon={<Search width={16} height={16} color="#777" />}
              rightIcon={
                searchQuery ? (
                  <Close
                    width={16}
                    height={16}
                    color="#777"
                  />
                ) : undefined
              }
              onRightIconClick={() => setSearchQuery && setSearchQuery("")}
              containerStyle={styles.searchInput}
              style={{ paddingVertical: 6 }}
            />
          </View>
        </View>

        <View style={styles.filtersAndAvatarsRow}>
          {/* Filters Scroll Horizontal */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1, marginRight: 8 }}
            contentContainerStyle={styles.filtersScroll}
          >
            <Dropdown
              placeholder="Sprint"
              options={(sprintData || []).map((s: any) => ({ value: s.id, label: s.name || s.sprintName }))}
              selectedValue={selectedSprint}
              onValueChange={(val) => {
                setSelectedSprint?.(val);
                if (getBoard) {
                  getBoard(1, val);
                }
              }}
              onEndReached={() => {
                if (!isSprintLoading && getProjectSprint && sprintPage && sprintTotalPages) {
                  if (sprintPage <= sprintTotalPages) {
                    getProjectSprint(sprintPage);
                  }
                }
              }}
              containerStyle={{ width: 120, marginBottom: 0, marginRight: 8 }}
              inputStyle={{ height: 32, paddingHorizontal: 12, paddingLeft: 12, backgroundColor: "#ffffff" }}
            />
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
              options={(tagData || []).map((t: any) => ({
                value: t.id,
                label: t.name,
                badgeColor: t.colorCode || theme.colors.brand.surface.medium,
                badgeText: "T",
              }))}
              multiple={true}
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
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginTop: 12 }}>
          {(!!searchQuery || !!selectedEpic || (selectedTag && selectedTag.length > 0) || !!selectedPriority || !!selectedSprint) && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery && setSearchQuery("");
                setSelectedEpic && setSelectedEpic("");
                setSelectedTag && setSelectedTag([]);
                setSelectedPriority && setSelectedPriority("");
                setSelectedSprint && setSelectedSprint("");
                if (getBoard) getBoard(1, "");
              }}
              style={{ justifyContent: 'center' }}
            >
              <Typography fontVariant="BXS" variant="semibold" color="colors.brand.surface.medium">Clear All</Typography>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.selectModeBtn,
              isSelectionModeActive && { backgroundColor: theme.colors.brand.surface.lighter, borderColor: theme.colors.brand.border.medium },
              { alignSelf: 'auto' }
            ]}
            onPress={() => {
              if (isSelectionModeActive) {
                clearSelection();
              } else {
                setIsSelectionModeActive(true);
              }
            }}
          >
            <Typography
              fontVariant="BS"
              variant="semibold"
              color={isSelectionModeActive ? "colors.brand.onSurface.dark" : "colors.neutral.onSurface.dark"}
            >
              {isSelectionModeActive ? "Cancel" : "Select"}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 3. Horizontal Swiping Kanban Column Deck ── */}
      <FlatList
        ref={scrollViewRef as any}
        data={columns}
        keyExtractor={(col) => col.value}
        horizontal
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={COLUMN_WIDTH + 16}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardScroll}
        scrollEnabled={!isDragging}
        onScroll={(e) => {
          scrollXOffsetRef.current = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        renderItem={({ item: col }) => {
          const colTasks = getColumnTasks(col.value);
          const isComposerOpen = inlineComposerColumn === col.value;

          return (
            <View
              style={[
                styles.boardColumn,
                { backgroundColor: theme.colors.neutral.surface.light },
              ]}
            >
              {/* Column Header */}
              <View style={styles.columnHeader}>
                <Typography
                  fontVariant="LM"
                  variant="bold"
                  color="colors.neutral.onSurface.light"
                  style={[styles.columnHeaderText, { color: col.colorCode || theme.colors.neutral.onSurface.light }]}
                >
                  {col.label} ({colTasks.length})
                </Typography>
              </View>

              {/* Column Cards List Scroll */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.columnCardsScroll}
                scrollEnabled={!isDragging}
              >
                {colTasks.map((t) => (
                  <BoardCard
                    key={t.id}
                    task={t}
                    isGhost={draggingTaskIds.includes(t.id) || (hasFloating && floatingPayload!.taskIds.includes(t.id))}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedTaskIds.has(t.id)}
                    onToggleSelect={handleToggleSelect}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    dragPosition={dragPosition}
                    onPressCard={() => handlePressCard(t.id)}
                  />
                ))}

                {/* Inline Card Composer Form */}
                {isComposerOpen && (
                  <View
                    style={[
                      styles.composerCard,
                      {
                        backgroundColor: "#ffffff",
                        borderColor: theme.colors.neutral.border.light,
                      },
                    ]}
                  >
                    <TextInput
                      autoFocus
                      multiline
                      value={newCardTitle}
                      onChangeText={setNewCardTitle}
                      placeholder="What needs to be done?"
                      placeholderTextColor={theme.colors.neutral.onSurface.disabled}
                      style={[
                        styles.composerInput,
                        { color: theme.colors.neutral.onSurface.light },
                      ]}
                    />

                    {/* Bottom controls row */}
                    <View style={styles.composerActionsRow}>
                      {/* Sub-row: Selection of task type */}
                      <View style={styles.typeSelectorRow}>
                        {(["task", "story", "bug"] as const).map((type) => {
                          const isSelected = newCardType === type;
                          const config = {
                            story: { bg: "#2e7d32", char: "S" },
                            task: { bg: "#1565c0", char: "T" },
                            bug: { bg: "#c62828", char: "B" },
                          }[type];

                          return (
                            <TouchableOpacity
                              key={type}
                              activeOpacity={0.7}
                              onPress={() => setNewCardType(type)}
                              style={[
                                styles.composerTypeBtn,
                                {
                                  backgroundColor: config.bg,
                                  opacity: isSelected ? 1 : 0.4,
                                  borderWidth: isSelected ? 1.5 : 0,
                                  borderColor: "#ffffff",
                                },
                              ]}
                            >
                              <Typography
                                fontVariant="LXS"
                                variant="bold"
                                color="#ffffff"
                                style={styles.composerTypeBtnText}
                              >
                                {config.char}
                              </Typography>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Bottom action trigger */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleCreateInlineCard(col.value)}
                        style={[
                          styles.composerCreateBtn,
                          {
                            backgroundColor: theme.colors.brand.surface.medium,
                          },
                        ]}
                      >
                        <Typography
                          fontVariant="BXS"
                          variant="bold"
                          color="#ffffff"
                        >
                          Create
                        </Typography>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Create issue button trigger */}
                {!isComposerOpen && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.push({ pathname: "/(protected)/(streamLine)/createTask", params: { projectId } })}
                    style={styles.createIssueTrigger}
                  >
                    <Typography
                      fontVariant="BS"
                      variant="semibold"
                      color="colors.neutral.onSurface.dark"
                    >
                      + Create issue
                    </Typography>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          );
        }}
      />

      {/* ── Drop Popup (compact card from right) ── */}
      {isPopupMounted && (
        <View
          style={styles.popupContainer}
          pointerEvents="box-none"
        >
          <Animated.View
            ref={popupCardRef}
            onLayout={() => {
              popupCardRef.current?.measureInWindow((_x, y) => {
                popupContainerY.current = y;
              });
            }}
            style={[
              styles.popupCard,
              {
                backgroundColor: "#ffffff",
                borderColor: theme.colors.neutral.border.light,
                transform: [{ translateX: popupTranslateX }],
              },
            ]}
          >
            {columns.map((col) => {
              const isSource = col.value === activeSourceRef.current;
              const isHovered = hoveredDropTarget === col.value;
              const colTasks = getColumnTasks(col.value);

              return (
                <BoardPopupRowComponent
                  key={col.value}
                  col={col}
                  colTasksCount={colTasks.length}
                  isSource={isSource}
                  isHovered={isHovered}
                  theme={theme}
                  onLayout={(e) => {
                    const { y, height } = e.nativeEvent.layout;
                    popupRowLayouts.current[col.value] = { y, height };
                  }}
                />
              );
            })}
          </Animated.View>
        </View>
      )}



      {/* ── Multi-Select Bar ── */}
      {isSelectionMode && !isDragging && !hasFloating && (
        <SelectionActionBar
          selectedCount={selectedTaskIds.size}
          onClearSelection={clearSelection}
          themeColors={theme.colors}
          subtitle="Long press to drag items"
        />
      )}

      {/* ── Floating Icon (failed drop) ── */}
      {hasFloating && !isDragging && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <FloatingDropButton
            floatingPayload={floatingPayload!}
            floatingPos={floatingPos}
            panHandlers={floatingPanResponder.panHandlers}
            themeColors={theme.colors}
            onClose={clearFloating}
          />
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

      {/* ── Root-Level Absolute Dragging Card Overlay Clone ── */}
      {isDragging && draggingTasks.length > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View
            style={[
              styles.draggingOverlay,
              {
                width: COLUMN_WIDTH - 24,
                position: "absolute",
                transform: dragPosition.getTranslateTransform(),
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 6,
                zIndex: 9999,
              },
            ]}
          >
            <DragOverlayCard
              tasks={draggingTasks.map(t => ({
                id: t.id,
                type: (t.taskType?.name?.toLowerCase() as "task" | "story" | "bug") || "task",
                key: t.key || "",
                title: t.name,
              }))}
              themeColors={theme.colors}
            />
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sprintInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderRadius: 8,
    // Note: border colors and bg colors are passed via array in render
  },
  sprintInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
    paddingRight: 8,
  },
  sprintTitle: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginRight: 4,
  },
  calendarInterval: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 6,
  },
  calendarIcon: {
    marginTop: -1,
  },
  sprintInfoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  completeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInput: {
    backgroundColor: "#ffffff",
  },
  selectModeBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 8,
  },
  filtersAndAvatarsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filtersScroll: {
    gap: 8,
  },
  filterPill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  membersWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 12,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
    width: 68,
  },
  stackAvatarItem: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    position: "absolute",
    overflow: "hidden",
  },
  stackAvatarImage: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
  },
  plusIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: {
    fontSize: 8,
    lineHeight: 11,
  },
  boardScroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  boardColumn: {
    width: COLUMN_WIDTH,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 8,
    padding: 12,
    maxHeight: "92%",
  },
  columnHeader: {
    marginBottom: 12,
  },
  columnHeaderText: {
    fontSize: 13,
  },
  columnCardsScroll: {
    paddingBottom: 16,
  },
  createIssueTrigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  composerCard: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  composerInput: {
    fontSize: 14,
    lineHeight: 20,
    color: "#262626",
    minHeight: 40,
    textAlignVertical: "top",
    padding: 0,
    marginBottom: 12,
  },
  composerActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeSelectorRow: {
    flexDirection: "row",
    gap: 6,
  },
  composerTypeBtn: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  composerTypeBtnText: {
    fontSize: 10,
    lineHeight: 11,
  },
  composerCreateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
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
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  statusCardTitle: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  statusRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 2,
  },
  statusInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  draggingOverlay: {
    opacity: 0.9,
  },
  popupContainer: {
    position: "absolute",
    right: 20,
    top: 140,
    bottom: 20,
    width: 220,
    zIndex: 9000,
  },
  popupCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  popupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 8,
    position: "relative",
    overflow: "hidden",
  },
  popupRowAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  popupRowInfo: {
    flex: 1,
  },
  popupRowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  popupRowCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    marginLeft: 12,
  },
});

interface BoardPopupRowProps {
  col: {
    value: string;
    label: string;
  };
  colTasksCount: number;
  isSource: boolean;
  isHovered: boolean;
  theme: any;
  onLayout: (e: any) => void;
}

const BoardPopupRowComponent: React.FC<BoardPopupRowProps> = React.memo(({
  col,
  colTasksCount,
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
    outputRange: [0, 4],
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
            {col.label}
          </Animated.Text>
        </View>
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
          {colTasksCount}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
});

