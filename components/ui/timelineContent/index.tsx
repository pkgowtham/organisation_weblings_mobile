import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator, FlatList, Dimensions } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { Typography } from "../typography";
import { TimelineMode } from "../viewHeader";
import CustomButton from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { Add, Edit, Delete, Eye } from "@/svg_icons";
import { useStore } from "@/store";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useToast } from "@/context/ToastContext";
import { apiFetch } from "@/store/apiInstance";

// ── Types ───────────────────────────────────────────────
export interface TaskItem {
  id: string;
  title: string;
  key: string;
  type: string;
  typeColor: string;
  hasArrow?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  spans?: {
    weeks?: { start: number; end: number } | null;
    months?: { start: number; end: number } | null;
    quarter?: { start: number; end: number } | null;
  };
  vSpans?: {
    weeks?: { start: number; end: number } | null;
    months?: { start: number; end: number } | null;
    quarter?: { start: number; end: number } | null;
  };
  children?: TaskItem[];
  durationDays?: number;
  levelWeight?: any;
}

/** Flattened item with depth for rendering indentation */
interface FlatItem extends TaskItem {
  depth: number;
}

export interface TimelineContentProps {
  /** Selected mode: weeks / months / quarter */
  mode: TimelineMode;
  /** Layout direction: horizontal Gantt chart or vertical week-row view */
  layout?: "horizontal" | "vertical";
  data?: any[];
  isLoading?: boolean;
  onEndReached?: () => void;
  taskTypeData?: any[];
}

// ── Inline Chevrons ─────────────────────────────────────
const ChevronRight = ({ color, styles }: { color: string; styles: any }) => (
  <View style={styles.chevronContainer}>
    <View
      style={[
        styles.chevronArrow,
        { borderColor: color, transform: [{ rotate: "45deg" }] },
      ]}
    />
  </View>
);

const ChevronDown = ({ color, styles }: { color: string; styles: any }) => (
  <View style={styles.chevronContainer}>
    <View
      style={[
        styles.chevronArrow,
        { borderColor: color, transform: [{ rotate: "135deg" }] },
      ]}
    />
  </View>
);

// ── Vertical view helpers ─────────────────────────────
const V_ROW_H = 150;
const V_ROW_GAP = 8;
const V_LABEL_W = 60;
const V_BAR_W = 28;

const mapIndexToY = (idx: number, numRows: number) => {
  const r = Math.max(1, Math.min(numRows, Math.floor(idx)));
  const frac = idx - r;
  return (r - 1) * (V_ROW_H + V_ROW_GAP) + 26 + frac * (V_ROW_H - 38);
};

// ═════════════════════════════════════════════════════════
export default function TimelineContent({
  mode,
  layout = "horizontal",
  data = [],
  isLoading = false,
  onEndReached,
  taskTypeData = [],
}: TimelineContentProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safePush } = useSafeNavigation();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const maxLevelWeight = useMemo(() => {
    const types = taskTypeData.length > 0 ? taskTypeData : (store.projectTaskType.dataGetList?.data || []);
    if (!types.length) return 0;
    return Math.max(...types.map((t: any) => t.levelWeight || 0));
  }, [taskTypeData, store.projectTaskType.dataGetList?.data]);
  const { showToast } = useToast();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    dispatch({
      type: "STREAMLINE_TASK_DESTROY_API_REQUEST",
      payload: {
        method: "DELETE",
        url: "streamlineTask",
        query: { id: taskToDelete.id },
      },
    });
    setDeleteDialogVisible(false);
  };

  useEffect(() => {
    if (store.streamlineTask.isSuccessDestroy) {
      showToast({
        iconType: "checkmark",
        type: "success",
        title: store.streamlineTask.dataDestroy?.message || "Task deleted successfully",
      });
      dispatch({ type: "STREAMLINE_TASK_DESTROY_API_CLEAR" });
      if (projectId) {
        dispatch({
          type: "STREAMLINE_TASK_GETLIST_API_REQUEST",
          payload: {
            method: "GET",
            url: "streamlineTask",
            query: { projectId, page: 1, limit: 10 }
          }
        });
      }
    }
  }, [store.streamlineTask.isSuccessDestroy, projectId]);

  useEffect(() => {
    if (store.streamlineTask.isErrorDestroy && store.streamlineTask.errorDestroy) {
      showToast({
        iconType: "error",
        type: "error",
        title: store.streamlineTask.errorDestroy?.message || "Failed to delete task",
      });
      dispatch({ type: "STREAMLINE_TASK_DESTROY_API_CLEAR" });
    }
  }, [store.streamlineTask.isErrorDestroy, store.streamlineTask.errorDestroy]);

  const today = useMemo(() => new Date(), []);

  // Calculate Monday of the current week
  const getMondayDate = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const monday = useMemo(() => getMondayDate(today), [today]);

  // ── Horizontal column definitions (Dynamic) ─────────────────────
  const weekCols = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        day: ["Mon", "Tue", "Wed", "Thu", "Fri"][i],
        date: String(d.getDate()),
        highlighted: d.toDateString() === today.toDateString(),
        fullDate: d,
      };
    });
  }, [monday, today]);

  const monthCols = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - 2 + i, 1);
      return {
        label: d.toLocaleDateString("en-US", { month: "short" }),
        highlighted: d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        fullDate: d,
      };
    });
  }, [today]);

  const quarterCols = useMemo(() => {
    const getQuarterInfo = (d: Date) => {
      const q = Math.floor(d.getMonth() / 3) + 1;
      return { q, year: d.getFullYear() };
    };
    const currentQInfo = getQuarterInfo(today);
    return Array.from({ length: 5 }, (_, i) => {
      const offsetQuarters = -2 + i;
      const targetMonth = today.getMonth() + offsetQuarters * 3;
      const d = new Date(today.getFullYear(), targetMonth, 1);
      const q = Math.floor(d.getMonth() / 3) + 1;
      return {
        label: `Q${q}`,
        year: String(d.getFullYear()),
        highlighted: q === currentQInfo.q && d.getFullYear() === currentQInfo.year,
        fullDate: d,
      };
    });
  }, [today]);

  const activeCols =
    mode === "weeks" ? weekCols : mode === "months" ? monthCols : quarterCols;

  // ── Date span calculation helpers ───────────────────────────────
  const calculateWeekSpan = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const tStart = new Date(startDate).getTime();
    const tEnd = new Date(endDate).getTime();
    const monTime = new Date(weekCols[0].fullDate).setHours(0, 0, 0, 0);
    const friTimeEnd = monTime + 5 * 24 * 3600 * 1000;

    if (tEnd < monTime || tStart >= friTimeEnd) {
      return null;
    }

    // 1-based start day of Mon-Fri week columns
    const startCol = Math.max(1, Math.min(5, Math.floor((tStart - monTime) / (24 * 3600 * 1000)) + 1));
    const endCol = Math.max(1, Math.min(5, Math.floor((tEnd - monTime) / (24 * 3600 * 1000)) + 1));
    return { start: startCol, end: endCol };
  };

  const calculateMonthSpan = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const sVal = sDate.getFullYear() * 12 + sDate.getMonth();
    const eVal = eDate.getFullYear() * 12 + eDate.getMonth();
    const colStartVal = monthCols[0].year * 12 + monthCols[0].monthIndex;

    if (eVal < colStartVal || sVal > colStartVal + 4) {
      return null;
    }

    const startCol = Math.max(1, Math.min(5, sVal - colStartVal + 1));
    const endCol = Math.max(1, Math.min(5, eVal - colStartVal + 1));
    return { start: startCol, end: endCol };
  };

  const calculateQuarterSpan = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const sQ = Math.floor(sDate.getMonth() / 3) + 1;
    const eQ = Math.floor(eDate.getMonth() / 3) + 1;
    const sVal = sDate.getFullYear() * 4 + (sQ - 1);
    const eVal = eDate.getFullYear() * 4 + (eQ - 1);
    const parseColQVal = (col: any) => {
      const q = parseInt(col.label.replace("Q", ""), 10);
      const y = parseInt(col.year, 10);
      return y * 4 + (q - 1);
    };
    const colStartVal = parseColQVal(quarterCols[0]);

    if (eVal < colStartVal || sVal > colStartVal + 4) {
      return null;
    }

    const startCol = Math.max(1, Math.min(5, sVal - colStartVal + 1));
    const endCol = Math.max(1, Math.min(5, eVal - colStartVal + 1));
    return { start: startCol, end: endCol };
  };

  const verticalWeeksRange = useMemo(() => {
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const startDate = new Date(currentYear, currentMonth, 1);
    
    if (mode !== "weeks" || layout !== "vertical") {
      return { start: startDate, count: 4 };
    }
    
    let maxEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).getTime();
    if (data && Array.isArray(data)) {
      data.forEach((task: any) => {
        if (task.endDate) {
          const tEnd = new Date(task.endDate).getTime();
          if (tEnd > maxEnd) maxEnd = tEnd;
        }
        if (task.children) {
           task.children.forEach((child: any) => {
              if (child.endDate) {
                 const cEnd = new Date(child.endDate).getTime();
                 if (cEnd > maxEnd) maxEnd = cEnd;
              }
           });
        }
      });
    }

    const totalDays = (maxEnd - startDate.getTime()) / (24 * 3600 * 1000);
    const count = Math.max(4, Math.ceil(totalDays / 7));
    return { start: startDate, count };
  }, [mode, layout, today, data]);

  const calculateVerticalWeekSpan = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);

    const firstTime = verticalWeeksRange.start.getTime();

    if (eDate.getTime() < firstTime) {
      return null;
    }

    const getWeekFloatIndex = (d: Date) => {
      if (d.getTime() < firstTime) return 1.0;
      const diffTime = d.getTime() - firstTime;
      const diffDays = diffTime / (24 * 3600 * 1000);
      return 1.0 + (diffDays / 7.0);
    };

    return { start: getWeekFloatIndex(sDate), end: getWeekFloatIndex(eDate) };
  };

  const calculateVerticalMonthSpan = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const currentYear = today.getFullYear();

    const firstDay = new Date(currentYear, 0, 1);
    const lastDay = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    if (eDate.getTime() < firstDay.getTime() || sDate.getTime() > lastDay.getTime()) {
      return null;
    }

    const getMonthFloatIndex = (d: Date) => {
      if (d.getFullYear() < currentYear) return 1.0;
      if (d.getFullYear() > currentYear) return 13.0;
      const m = d.getMonth(); // 0-11
      const day = d.getDate(); // 1-31
      const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
      const progress = (day - 1) / daysInMonth;
      return (m + 1) + progress;
    };

    return { start: getMonthFloatIndex(sDate), end: getMonthFloatIndex(eDate) };
  };

  const calculateVerticalQuarterSpan = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const currentYear = today.getFullYear();

    const firstDay = new Date(currentYear, 0, 1);
    const lastDay = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    if (eDate.getTime() < firstDay.getTime() || sDate.getTime() > lastDay.getTime()) {
      return null;
    }

    const getQuarterFloatIndex = (d: Date) => {
      if (d.getFullYear() < currentYear) return 1.0;
      if (d.getFullYear() > currentYear) return 5.0;

      const m = d.getMonth(); // 0-11
      const q = Math.floor(m / 3); // 0-3 (Q1-Q4)
      const startMonthOfQuarter = q * 3;

      const day = d.getDate();
      const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
      const monthProgress = (day - 1) / daysInMonth;

      const quarterProgress = (m - startMonthOfQuarter + monthProgress) / 3;
      return (q + 1) + quarterProgress;
    };

    return { start: getQuarterFloatIndex(sDate), end: getQuarterFloatIndex(eDate) };
  };

  const calculateDurationDays = useCallback((startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, diffDays);
  }, []);

  const mapRawTaskToItem = useCallback((task: any): TaskItem | null => {
    if (!task || !task.id) return null;
    const type = task.taskType?.name || "Task";
    const spans = {
      weeks: calculateWeekSpan(task.startDate, task.endDate),
      months: calculateMonthSpan(task.startDate, task.endDate),
      quarter: calculateQuarterSpan(task.startDate, task.endDate),
    };
    const vSpans = {
      weeks: calculateVerticalWeekSpan(task.startDate, task.endDate),
      months: calculateVerticalMonthSpan(task.startDate, task.endDate),
      quarter: calculateVerticalQuarterSpan(task.startDate, task.endDate),
    };
    const durationDays = calculateDurationDays(task.startDate, task.endDate);

    return {
      id: task.id,
      title: task.name || "Untitled Task",
      key: task.project?.projectName || "PRJ",
      type,
      typeColor: task.taskType?.colorCode ||
        (type.toLowerCase().includes("epic")
          ? "#A65DFE"
          : type.toLowerCase().includes("story")
            ? "#008117"
            : type.toLowerCase().includes("bug")
              ? "#E00028"
              : "#0072C4"),
      hasArrow: type.toLowerCase() === "epic",
      hasChildren: !!task.hasChildren,
      isExpanded: true,
      spans,
      vSpans,
      children: [],
      durationDays,
      levelWeight: task.taskType?.levelWeight || 0,
    };
  }, [calculateWeekSpan, calculateMonthSpan, calculateQuarterSpan, calculateVerticalWeekSpan, calculateVerticalMonthSpan, calculateVerticalQuarterSpan, calculateDurationDays]);

  // ── Parse dynamic TaskItems tree from streamlineTask data ─────────
  const parsedTimelineData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const taskMap: Record<string, TaskItem> = {};
    const rootItems: TaskItem[] = [];

    data.forEach((task: any) => {
      if (!task || !task.id) return;
      const mappedTask = mapRawTaskToItem(task);
      if (mappedTask) {
        taskMap[task.id] = mappedTask;
      }
    });

    data.forEach((task: any) => {
      if (!task || !task.id) return;
      const mappedTask = taskMap[task.id];
      const pId = task.parentId?.id || task.parentId;
      if (pId && taskMap[pId]) {
        taskMap[pId].children = taskMap[pId].children || [];
        taskMap[pId].children.push(mappedTask);
      } else {
        rootItems.push(mappedTask);
      }
    });

    return rootItems;
  }, [data, mode, weekCols, monthCols, quarterCols]);

  // ── Expand / collapse state ───────────────────────────
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedEpics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Track which vertical bar's tooltip is visible
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  // ── Children dropdown state (for hasChildren items) ───
  const [expandedChildren, setExpandedChildren] = useState<Record<string, boolean>>({});
  const [childrenLoading, setChildrenLoading] = useState<Record<string, boolean>>({});
  const [childrenData, setChildrenData] = useState<Record<string, any[]>>({});
  const fetchedParentsRef = React.useRef<Set<string>>(new Set());

  const toggleChildrenDropdown = useCallback(async (parentId: string) => {
    setExpandedChildren((prev) => {
      const isCurrentlyExpanded = prev[parentId];
      return { ...prev, [parentId]: !isCurrentlyExpanded };
    });

    // If already fetched, just toggle (no re-fetch)
    if (fetchedParentsRef.current.has(parentId)) {
      return;
    }

    // Mark as fetched and fetch children via API
    fetchedParentsRef.current.add(parentId);
    setChildrenLoading((prev) => ({ ...prev, [parentId]: true }));
    try {
      const response = await apiFetch({
        method: "GET",
        url: "streamlineTask",
        params: parentId,
      });
      const fetchedChildren = response?.children || [];
      setChildrenData((prev) => ({ ...prev, [parentId]: fetchedChildren }));
    } catch (error) {
      console.error("Failed to fetch children for", parentId, error);
      fetchedParentsRef.current.delete(parentId); // Allow retry on error
      setChildrenData((prev) => ({ ...prev, [parentId]: [] }));
    } finally {
      setChildrenLoading((prev) => ({ ...prev, [parentId]: false }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Re-fetch children for parents that were already fetched to ensure data is fresh after edits
      if (fetchedParentsRef.current && fetchedParentsRef.current.size > 0) {
        Array.from(fetchedParentsRef.current).forEach(async (parentId) => {
          try {
            const response = await apiFetch({
              method: "GET",
              url: "streamlineTask",
              params: parentId,
            });
            const fetchedChildren = response?.children || [];
            setChildrenData((prev) => ({ ...prev, [parentId]: fetchedChildren }));
          } catch (error) {
            console.error("Failed to background refresh children for", parentId, error);
          }
        });
      }
    }, [])
  );

  // ── Flatten hierarchy for rendering ───────────────────
  const flatItems = useMemo((): FlatItem[] => {
    const items: FlatItem[] = [];
    const recurse = (nodeList: TaskItem[], depth: number) => {
      nodeList.forEach((node) => {
        items.push({ ...node, depth });
        // Use expandedChildren (if loaded from API) or expandedEpics (if epic) or node.isExpanded
        const isOpen = expandedChildren[node.id] ?? expandedEpics[node.id] ?? node.isExpanded ?? false;
        
        if (isOpen) {
          const fetchedChildren = childrenData[node.id];
          if (fetchedChildren && fetchedChildren.length > 0) {
            const mappedChildren = fetchedChildren.map(mapRawTaskToItem).filter(Boolean) as TaskItem[];
            recurse(mappedChildren, depth + 1);
          } else if (node.children && node.children.length > 0) {
            recurse(node.children, depth + 1);
          }
        }
      });
    };
    recurse(parsedTimelineData, 0);
    return items;
  }, [parsedTimelineData, expandedEpics, expandedChildren, childrenData, mapRawTaskToItem]);

  const verticalLabels = useMemo((): string[] => {
    if (mode === "weeks")
      return Array.from({ length: verticalWeeksRange.count }, (_, i) => `W${i + 1}`);
    if (mode === "months")
      return [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
    return [
      "Q1 (Jan-Mar )",
      "Q2 (Apr-Jun )",
      "Q3 (Jul-Sep )",
      "Q4 (Oct-Dec )",
    ];
  }, [mode, verticalWeeksRange.count]);

  const todayY = useMemo(() => {
    if (layout !== "vertical") return null;

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    let floatIndex = 1.0;
    if (mode === "weeks") {
      const diffTime = today.getTime() - verticalWeeksRange.start.getTime();
      const diffDays = diffTime / (24 * 3600 * 1000);
      floatIndex = 1.0 + (diffDays / 7.0);
    } else if (mode === "months") {
      const m = today.getMonth();
      const day = today.getDate();
      const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
      const progress = (day - 1) / daysInMonth;
      floatIndex = (m + 1) + progress;
    } else if (mode === "quarter") {
      const m = today.getMonth();
      const q = Math.floor(m / 3);
      const startMonthOfQuarter = q * 3;
      const day = today.getDate();
      const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
      const monthProgress = (day - 1) / daysInMonth;
      const quarterProgress = (m - startMonthOfQuarter + monthProgress) / 3;
      floatIndex = (q + 1) + quarterProgress;
    }

    const numRows = verticalLabels.length;
    return mapIndexToY(floatIndex, numRows);
  }, [mode, layout, today, verticalLabels]);

  // Assign horizontal/vertical lanes so overlapping bars don't collide
  const taskLanes = useMemo(() => {
    const result: {
      item: FlatItem;
      lane: number;
      span: { start: number; end: number };
    }[] = [];
    const laneEnds: number[] = [];

    flatItems.forEach((item) => {
      const span = layout === "vertical" ? item.vSpans?.[mode] : item.spans?.[mode];
      if (!span) return;

      let effectiveStart = span.start;
      let effectiveEnd = span.end;

      const requiredLanes = 1;

      // Find first lane block of size `requiredLanes` whose last bar ended before this one starts
      let assignedLane = -1;
      for (let i = 0; i <= laneEnds.length; i++) {
        let allFree = true;
        for (let j = 0; j < requiredLanes; j++) {
          if ((laneEnds[i + j] || 0) >= effectiveStart) {
            allFree = false;
            break;
          }
        }
        if (allFree) {
          assignedLane = i;
          break;
        }
      }

      if (assignedLane === -1) {
        assignedLane = laneEnds.length;
      }

      // Mark the assigned lanes as occupied until effectiveEnd
      for (let j = 0; j < requiredLanes; j++) {
        laneEnds[assignedLane + j] = effectiveEnd;
      }

      result.push({ item, lane: assignedLane, span });
    });

    return result;
  }, [mode, flatItems, layout, expandedChildren, childrenLoading, childrenData]);

  // Find the maximum lane used to calculate dynamic width
  const maxLane = useMemo(() => {
    let m = 0;
    taskLanes.forEach(({ lane }) => {
      m = Math.max(m, lane);
    });
    return m;
  }, [taskLanes]);

  const contentWidth = useMemo(() => {
    return V_LABEL_W + V_ROW_GAP + 16 + (maxLane + 1) * (V_BAR_W + 12) + 200; // extra padding for tooltip
  }, [maxLane]);

  const verticalScrollRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    if (layout === "vertical" && todayY !== null && verticalScrollRef.current) {
      setTimeout(() => {
         verticalScrollRef.current?.scrollTo({ y: Math.max(0, todayY - 100), animated: true });
      }, 500);
    }
  }, [layout, todayY]);

  // ── VERTICAL layout ───────────────────────────────────
  if (layout === "vertical") {
    const totalHeight = verticalLabels.length * (V_ROW_H + V_ROW_GAP) - V_ROW_GAP;
    const windowWidth = Dimensions.get('window').width;
    const scrollWidth = Math.max(windowWidth, contentWidth);

    return (
      <>
        <ScrollView
          ref={verticalScrollRef}
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setActiveTooltipId(null)}
          onScroll={(e) => {
            const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
            if (isCloseToBottom && onEndReached && !isLoading) {
              onEndReached();
            }
          }}
          scrollEventThrottle={400}
        >
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ minWidth: '100%', width: scrollWidth }}
          >
            <Pressable
              style={{ height: totalHeight + 30, position: "relative", width: scrollWidth }}
              onPress={() => setActiveTooltipId(null)}
            >
              {/* ── Row backgrounds + labels ──────────── */}
              {verticalLabels.map((label, idx) => (
                <React.Fragment key={idx}>
                  <View
                    style={[
                      styles.vRow,
                      {
                        height: V_ROW_H,
                        marginBottom: V_ROW_GAP,
                      },
                    ]}
                  >
                    <View style={styles.vLabelCell}>
                      <Typography
                        fontVariant="BS"
                        variant="semibold"
                        color="colors.neutral.onSurface.dark"
                        style={[
                          mode === "quarter" && {
                            transform: [{ rotate: "-90deg" }],
                            width: 140,
                            textAlign: "center",
                          },
                        ]}
                      >
                        {label}
                      </Typography>
                    </View>

                    <View style={styles.vContentCell} />
                  </View>
                </React.Fragment>
              ))}

              {todayY !== null && (
                <View
                  style={[
                    styles.vTodayLineContainer,
                    {
                      top: todayY,
                      zIndex: 5,
                    },
                  ]}
                  pointerEvents="none"
                >
                  {/* Dot marker on the left label cell */}
                  <View
                    style={[
                      styles.vTodayMarker,
                      {
                        backgroundColor: theme.colors.brand.surface.medium,
                      },
                    ]}
                  />
                  {/* Dashed line starting after label cell (left: V_LABEL_W) */}
                  <View
                    style={[
                      styles.vTodayDashedLine,
                      {
                        borderColor: theme.colors.brand.surface.medium,
                        borderStyle: "dashed",
                      },
                    ]}
                  />
                </View>
              )}

              {/* ── Overlaid task bars ──────────────────── */}
              {taskLanes.map(({ item, lane, span }) => {
                const numRows = verticalLabels.length;
                const topPos = mapIndexToY(span.start, numRows);
                const bottomPos = mapIndexToY(span.end, numRows);
                const barHeight = Math.max(16, bottomPos - topPos);
                const leftPos = V_LABEL_W + V_ROW_GAP + 16 + lane * (V_BAR_W + 12);
                const isTooltipOpen = activeTooltipId === item.id;
                const isChildrenExpanded = expandedChildren[item.id] ?? false;
                const isChildrenLoadingItem = childrenLoading[item.id] ?? false;
                const fetchedChildrenItems = childrenData[item.id] || [];

                return (
                  <React.Fragment key={item.id}>
                    {/* Chevron dropdown button — above the bar for hasChildren items */}
                    {item.hasChildren && (
                      <Pressable
                        style={[
                          styles.vDropdownBtn,
                          {
                            top: topPos - 22,
                            left: leftPos + (V_BAR_W - 20) / 2,
                            zIndex: 9998,
                          },
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleChildrenDropdown(item.id);
                        }}
                      >
                        {isChildrenLoadingItem ? (
                          <ActivityIndicator
                            size={10}
                            color={theme.colors.brand.surface.medium}
                          />
                        ) : isChildrenExpanded ? (
                          <ChevronDown
                            color={theme.colors.brand.surface.medium}
                            styles={styles}
                          />
                        ) : (
                          <ChevronRight
                            color={theme.colors.brand.surface.medium}
                            styles={styles}
                          />
                        )}
                      </Pressable>
                    )}

                    {/* Main task bar */}
                    <Pressable
                      style={[
                        styles.vBarGroup,
                        {
                          top: topPos,
                          left: leftPos,
                          width: V_BAR_W,
                          height: barHeight,
                          zIndex: isTooltipOpen ? 9999 : 1000 - lane,
                        },
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        setActiveTooltipId(isTooltipOpen ? null : item.id);
                      }}
                    >
                      {/* Colored translucent vertical bar */}
                      <View
                        style={[
                          styles.vBar,
                          {
                            height: barHeight,
                            backgroundColor: (item.typeColor || "#A65DFE") + "50", // 20% opacity of matching color
                            borderRadius: theme.borderRadius.b150,
                            width: V_BAR_W,
                          },
                        ]}
                      />

                      {/* Badge — always visible, centered at the top of the bar */}
                      <View
                        style={[
                          styles.vBadgeOnly,
                          {
                            position: "absolute",
                            top: 4,
                            left: (V_BAR_W - 20) / 2,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.typeBadge,
                            {
                              backgroundColor: item.typeColor || "#A65DFE",
                              width: 20,
                              height: 20,
                              borderRadius: 4,
                              marginRight: 0,
                            },
                          ]}
                        >
                          <Typography
                            fontVariant="LXS"
                            variant="bold"
                            color="#ffffff"
                            style={styles.typeText}
                          >
                            {(item.type || "").charAt(0).toUpperCase()}
                          </Typography>
                        </View>
                      </View>

                      {/* Duration Tag — always visible, centered below the bar */}
                      <View
                        style={[
                          styles.durationTag,
                          {
                            backgroundColor: theme.colors.neutral.surface.lighter,
                            borderColor: theme.colors.neutral.border.light,
                          },
                        ]}
                      >
                        <Typography
                          fontVariant="LXS"
                          variant="bold"
                          color="colors.neutral.onSurface.dark"
                          style={styles.durationText}
                        >
                          {`${item.durationDays ?? 0}d`}
                        </Typography>
                      </View>

                      {/* Tooltip — shown on tap */}
                      {isTooltipOpen && (() => {
                        const isNearRightEdge = leftPos + V_BAR_W + 4 + 240 > scrollWidth && leftPos > 240;
                        return (
                          <View
                            style={[
                              styles.vTooltip,
                              {
                                backgroundColor: theme.colors.neutral.surface.lighter,
                                shadowColor: "#000",
                                borderColor: theme.colors.neutral.border.light,
                                left: isNearRightEdge ? undefined : V_BAR_W + 4,
                                right: isNearRightEdge ? V_BAR_W + 4 : undefined,
                                flexDirection: "column",
                                alignItems: "stretch",
                                paddingBottom: 8,
                              },
                            ]}
                          >
                            {/* Tooltip pointer */}
                            <View
                              style={[
                                styles.vTooltipArrow,
                                {
                                  left: isNearRightEdge ? undefined : -6,
                                  right: isNearRightEdge ? -6 : undefined,
                                  borderRightWidth: isNearRightEdge ? 0 : 6,
                                  borderLeftWidth: isNearRightEdge ? 6 : 0,
                                  borderRightColor: isNearRightEdge
                                    ? "transparent"
                                    : theme.colors.neutral.surface.lighter,
                                  borderLeftColor: isNearRightEdge
                                    ? theme.colors.neutral.surface.lighter
                                    : "transparent",
                                },
                              ]}
                            />
                          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                            <View
                              style={[
                                styles.typeBadge,
                                { backgroundColor: item.typeColor || "#A65DFE" },
                              ]}
                            >
                              <Typography
                                fontVariant="LXS"
                                variant="bold"
                                color="#ffffff"
                                style={styles.typeText}
                              >
                                {(item.type || "").charAt(0).toUpperCase()}
                              </Typography>
                            </View>
                            <Typography
                              fontVariant="BXS"
                              color="colors.neutral.onSurface.light"
                              numberOfLines={1}
                              style={{ flexShrink: 1, marginLeft: 4 }}
                            >
                              {item.title}
                            </Typography>
                          </View>

                          <View style={{ flexDirection: "row", marginTop: 8, width: "100%", gap: 8, justifyContent: "center" }}>
                            <CustomButton
                              variant="positive"
                              iconLeft={<Eye color="#ffffff" width={14} height={14} viewBox="0 0 18 19" />}
                              size="xs"
                              buttonStyle={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                              onPress={() => {
                                safePush("/(protected)/(streamLine)/viewTask", {
                                  taskId: item.id,
                                  projectId,
                                });
                              }}
                            />
                            {item.levelWeight < maxLevelWeight && (
                              <CustomButton
                                variant="primary"
                                iconLeft={<Add color="#ffffff" width={14} height={14} />}
                                size="xs"
                                buttonStyle={{
                                  flex: 1,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                                onPress={() => {
                                  safePush("/(protected)/(streamLine)/createTask", {
                                    projectId,
                                    parentId: item.id,
                                    parentName: item.title,
                                    parentLevel: String(item.levelWeight),
                                  });
                                }}
                              />
                            )}
                            <CustomButton
                              variant="warning"
                              iconLeft={<Edit color="#ffffff" width={14} height={14} />}
                              size="xs"
                              buttonStyle={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                              onPress={() => {
                                safePush("/(protected)/(streamLine)/editTask", {
                                  taskId: item.id,
                                  projectId,
                                });
                              }}
                            />
                            <CustomButton
                              variant="negative"
                              iconLeft={<Delete color="#ffffff" width={14} height={14} />}
                              size="xs"
                              buttonStyle={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                              onPress={() => {
                                setTaskToDelete(item);
                                setDeleteDialogVisible(true);
                              }}
                            />
                          </View>
                          </View>
                        );
                      })()}
                    </Pressable>

                  </React.Fragment>
                );
              })}
            </Pressable>
          </ScrollView>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={theme.colors.brand.surface.medium}
              style={{ marginVertical: 10 }}
            />
          )}
        </ScrollView>
        <Dialog
          visible={deleteDialogVisible}
          variant="negative"
          title="Delete Task"
          cancelLabel="Cancel"
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteDialogVisible(false);
            setTaskToDelete(null);
          }}
          onDismiss={() => {
            setDeleteDialogVisible(false);
            setTaskToDelete(null);
          }}
        >
          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark">
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </Dialog>
      </>
    );
  }

  // ── HORIZONTAL layout (Gantt chart) ────────────────────
  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
          if (isCloseToBottom && onEndReached && !isLoading) {
            onEndReached();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.gridSplit}>
          {/* ── Left Column: Task Info Pane ──────────── */}
          <View
            style={[
              styles.leftPane,
              { borderRightColor: theme.colors.neutral.border.light },
            ]}
          >
            {/* Left Header */}
            <View
              style={[
                styles.headerCell,
                { backgroundColor: theme.colors.neutral.surface.light },
              ]}
            >
              <Typography
                fontVariant="LS"
                variant="semibold"
                color="colors.neutral.onSurface.light"
              >
                Task name
              </Typography>
            </View>

            {/* Left Rows — hierarchy-aware */}
            {flatItems.map((item) => {
              const isExpanded = expandedEpics[item.id] ?? false;
              const isChildrenExpanded = expandedChildren[item.id] ?? false;
              const isChildrenLoadingItem = childrenLoading[item.id] ?? false;
              return (
                <React.Fragment key={item.id}>
                  <View
                    style={[
                      styles.taskRow,
                      {
                        borderBottomColor: theme.colors.neutral.border.light,
                        paddingLeft: 4 + item.depth * 16,
                      },
                    ]}
                  >
                    {/* Chevron for hasChildren dropdown */}
                    {item.hasChildren ? (
                      <Pressable
                        onPress={() => toggleChildrenDropdown(item.id)}
                        style={styles.chevronBtn}
                      >
                        {isChildrenLoadingItem ? (
                          <ActivityIndicator
                            size={12}
                            color={theme.colors.brand.surface.medium}
                          />
                        ) : isChildrenExpanded ? (
                          <ChevronDown
                            color={theme.colors.neutral.onSurface.disabled}
                            styles={styles}
                          />
                        ) : (
                          <ChevronRight
                            color={theme.colors.neutral.onSurface.disabled}
                            styles={styles}
                          />
                        )}
                      </Pressable>
                    ) : item.hasArrow ? (
                      <Pressable
                        onPress={() => toggleExpand(item.id)}
                        style={styles.chevronBtn}
                      >
                        {isExpanded ? (
                          <ChevronDown
                            color={theme.colors.neutral.onSurface.disabled}
                            styles={styles}
                          />
                        ) : (
                          <ChevronRight
                            color={theme.colors.neutral.onSurface.disabled}
                            styles={styles}
                          />
                        )}
                      </Pressable>
                    ) : (
                      <View style={styles.chevronPlaceholder} />
                    )}

                    {/* Type Badge */}
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: item.typeColor },
                      ]}
                    >
                      <Typography
                        fontVariant="LXS"
                        variant="bold"
                        color="#ffffff"
                        style={styles.typeText}
                      >
                        {(item.type || "").charAt(0).toUpperCase()}
                      </Typography>
                    </View>

                    {/* Title only */}
                    <View style={styles.taskTextStack}>
                      <Typography
                        fontVariant="BS"
                        color="colors.neutral.onSurface.light"
                        style={styles.titleText}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Typography>
                    </View>
                  </View>


                </React.Fragment>
              );
            })}
          </View>

          {/* ── Right Columns: Interactive Gantt Grid ──── */}
          <View style={styles.rightPane}>
            {/* Right Headers */}
            <View
              style={[
                styles.headerRow,
                { backgroundColor: theme.colors.neutral.surface.light },
              ]}
            >
              {activeCols.map((col, idx) => {
                const isHighlight = (col as any).highlighted;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.headerCol,
                      {
                        borderLeftColor: theme.colors.neutral.border.light,
                      },
                      isHighlight && {
                        backgroundColor: theme.colors.brand.surface.lighter,
                      },
                    ]}
                  >
                    {mode === "weeks" && (
                      <View style={styles.headerStack}>
                        <Typography
                          fontVariant="LS"
                          variant={"semibold"}
                          style={{
                            color: theme.colors.neutral.onSurface.dark,
                          }}
                        >
                          {(col as any).day}
                        </Typography>
                        <Typography
                          fontVariant="LS"
                          variant="semibold"
                          style={{
                            fontSize: 16,
                            color: isHighlight
                              ? theme.colors.brand.surface.medium
                              : theme.colors.neutral.onSurface.light,
                          }}
                        >
                          {(col as any).date}
                        </Typography>
                      </View>
                    )}

                    {mode === "months" && (
                      <Typography
                        fontVariant="BS"
                        variant={isHighlight ? "bold" : "semibold"}
                        style={{
                          color: isHighlight
                            ? theme.colors.brand.surface.medium
                            : theme.colors.neutral.onSurface.dark,
                        }}
                      >
                        {(col as any).label}
                      </Typography>
                    )}

                    {mode === "quarter" && (
                      <View style={styles.headerStack}>
                        <Typography
                          fontVariant="BS"
                          variant={isHighlight ? "bold" : "semibold"}
                          style={{
                            color: isHighlight
                              ? theme.colors.brand.surface.medium
                              : theme.colors.neutral.onSurface.light,
                          }}
                        >
                          {(col as any).label}
                        </Typography>
                        <Typography
                          fontVariant="BXS"
                          style={{
                            fontSize: 10,
                            color: theme.colors.neutral.onSurface.dark,
                          }}
                        >
                          {(col as any).year}
                        </Typography>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Right Rows with Gantt Bars */}
            <View style={styles.gridRowsContainer}>
              {/* Highlighted column background tint */}
              <View
                style={[
                  styles.highlightColBackground,
                  {
                    backgroundColor: theme.colors.brand.surface.lighter,
                    opacity: 0.4,
                  },
                ]}
              />

              {flatItems.map((item) => {
                const span = item.spans?.[mode];

                return (
                  <React.Fragment key={item.id}>
                    <View
                      style={[
                        styles.gridRow,
                        {
                          borderBottomColor: theme.colors.neutral.border.light,
                        },
                      ]}
                    >
                      {/* Grid column separators */}
                      {Array.from({ length: 5 }).map((_, colIdx) => (
                        <View
                          key={colIdx}
                          style={[
                            styles.gridColCell,
                            {
                              borderLeftColor: theme.colors.neutral.border.light,
                            },
                          ]}
                        />
                      ))}

                      {/* Absolute Gantt Bar */}
                      {span && (
                        <View
                          style={[
                            styles.taskBar,
                            {
                              backgroundColor: item.typeColor || theme.colors.info.surface.light,
                              left: `${(span.start - 1) * 20}%`,
                              width: `${(span.end - span.start + 1) * 20}%`,
                            },
                          ]}
                        />
                      )}
                    </View>
                  </React.Fragment>
                );
              })}

              {/* Vertical Blue Today Line Indicator */}
              <View
                style={[
                  styles.todayLine,
                  {
                    backgroundColor: theme.colors.brand.border.medium,
                  },
                ]}
              >
                <View
                  style={[
                    styles.todayMarker,
                    {
                      backgroundColor: theme.colors.brand.border.medium,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={theme.colors.brand.surface.medium}
            style={{ marginVertical: 10 }}
          />
        )}
      </ScrollView>
      <Dialog
        visible={deleteDialogVisible}
        variant="negative"
        title="Delete Task"
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogVisible(false);
          setTaskToDelete(null);
        }}
        onDismiss={() => {
          setDeleteDialogVisible(false);
          setTaskToDelete(null);
        }}
      >
        <Typography fontVariant="BS" color="colors.neutral.onSurface.dark">
          Are you sure you want to delete this task? This action cannot be undone.
        </Typography>
      </Dialog>
    </>
  );
}

// ═════════════════════════════════════════════════════════
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    gridSplit: {
      flexDirection: "row",
      width: "100%",
    },
    leftPane: {
      width: 135,
      borderRightWidth: 1,
    },
    headerCell: {
      height: 52,
      justifyContent: "center",
      paddingLeft: 10,
    },
    taskRow: {
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
    },
    chevronBtn: {
      padding: 4,
      justifyContent: "center",
      alignItems: "center",
    },
    chevronContainer: {
      width: 14,
      height: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    chevronPlaceholder: {
      width: 22,
    },
    chevronArrow: {
      width: 5,
      height: 5,
      borderRightWidth: 1.5,
      borderBottomWidth: 1.5,
      marginTop: -2,
    },
    typeBadge: {
      width: 18,
      height: 18,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 6,
    },
    typeText: {
      fontSize: 9,
      lineHeight: 10,
    },
    taskTextStack: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    keyText: {
      fontSize: 11,
      marginRight: 3,
    },
    titleText: {
      flex: 1,
      fontSize: 12,
    },
    rightPane: {
      flex: 1,
    },
    headerRow: {
      height: 52,
      flexDirection: "row",
    },
    headerCol: {
      flex: 1,
      borderLeftWidth: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    headerStack: {
      justifyContent: "center",
      alignItems: "center",
    },
    gridRowsContainer: {
      position: "relative",
      flex: 1,
    },
    highlightColBackground: {
      position: "absolute",
      left: "20%",
      width: "20%",
      top: 0,
      bottom: 0,
      zIndex: 0,
    },
    gridRow: {
      height: 48,
      flexDirection: "row",
      borderBottomWidth: 1,
      position: "relative",
      overflow: "hidden",
    },
    gridColCell: {
      flex: 1,
      borderLeftWidth: 1,
    },
    taskBar: {
      position: "absolute",
      height: 16,
      top: 16,
      borderRadius: theme.borderRadius.b100,
      zIndex: 2,
      paddingHorizontal: 8,
    },
    todayLine: {
      position: "absolute",
      left: "30%",
      width: 1.5,
      top: 0,
      bottom: 0,
      zIndex: 3,
    },
    todayMarker: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      alignSelf: "center",
      position: "absolute",
      top: -2.5,
    },
    // ── Children dropdown styles ────────────────────────
    childrenDropdownContainer: {
      borderLeftWidth: 2,
      borderLeftColor: theme.colors.brand.surface.medium,
      marginLeft: 14,
    },
    childrenScrollContent: {
      flexDirection: 'column' as const,
    },
    childTaskRow: {
      height: 40,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      borderBottomWidth: 1,
      paddingLeft: 10,
      minWidth: 135,
    },
    // ── Vertical view styles ───────────────────────────
    vDropdownBtn: {
      position: 'absolute' as const,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    vRow: {
      height: V_ROW_H,
      flexDirection: "row" as const,
    },
    vLabelCell: {
      width: V_LABEL_W,
      height: V_ROW_H,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: 4,
      marginRight: theme.spacing.s200
    },
    vContentCell: {
      flex: 1,
      height: V_ROW_H,
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: 4,
    },
    vBarGroup: {
      position: "absolute" as const,
      zIndex: 2,
    },
    vBar: {
      width: V_BAR_W,
    },
    vBadgeOnly: {
      // styles handled inline
    },
    vTooltip: {
      position: "absolute" as const,
      left: 38,
      top: 0,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
      zIndex: 100,
      minWidth: 160,
      maxWidth: 240,
    },
    vTooltipArrow: {
      position: "absolute" as const,
      left: -6,
      top: 10,
      width: 0,
      height: 0,
      borderTopWidth: 6,
      borderBottomWidth: 6,
      borderRightWidth: 6,
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
    },
    vBarLabel: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginLeft: 6,
      marginTop: 2,
    },
    vKeyText: {
      marginLeft: 4,
      marginRight: 2,
    },
    durationTag: {
      position: "absolute" as const,
      bottom: -20,
      alignSelf: "center" as const,
      minWidth: 26,
      height: 16,
      borderRadius: 4,
      borderWidth: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingHorizontal: 4,
      zIndex: 5,
    },
    durationText: {
      fontSize: 9,
      lineHeight: 10,
    },
    vTodayLineContainer: {
      position: "absolute" as const,
      left: 0,
      right: 0,
      height: 6,
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    vTodayMarker: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginLeft: V_LABEL_W - 3,
    },
    vTodayDashedLine: {
      flex: 1,
      height: 0,
      borderTopWidth: 1,
      marginLeft: 3,
    },
  });
