import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Animated,
  PanResponder,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface DraggableListProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (
    item: T,
    index: number,
    dragHandlers: any,
    isDragging: boolean
  ) => React.ReactNode;
  onReorder: (newData: T[]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function DraggableList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  onDragStart,
  onDragEnd,
}: DraggableListProps<T>) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [orderedData, setOrderedData] = useState<T[]>(data);

  // Sync internal state when external data changes (e.g. from API)
  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  const activeKeyRef = useRef<string | null>(null);
  const orderedDataRef = useRef<T[]>(orderedData);
  orderedDataRef.current = orderedData;

  const itemLayouts = useRef<Record<string, { y: number; height: number }>>({});
  const containerRef = useRef<View>(null);

  // Drag position values
  const dragY = useRef(new Animated.Value(0)).current;
  const initialItemY = useRef(0);

  // Track the layout positions of each list item relative to the container
  const handleItemLayout = (key: string) => (event: any) => {
    const { y, height } = event.nativeEvent.layout;
    itemLayouts.current[key] = { y, height };
  };

  // Find index based on Y coordinate relative to container
  const findHoverIndex = (touchY: number): number => {
    const items = orderedDataRef.current;
    let accumulatedY = 0;

    for (let i = 0; i < items.length; i++) {
      const key = keyExtractor(items[i]);
      const layout = itemLayouts.current[key];
      const height = layout ? layout.height : 68;

      if (touchY >= accumulatedY && touchY <= accumulatedY + height) {
        return i;
      }
      accumulatedY += height;
    }

    if (touchY < 0) return 0;
    return items.length - 1;
  };

  // Create PanResponder instances dynamically for each item's drag handle
  const createPanResponder = (key: string, index: number) => {
    return PanResponder.create({
      // Unconditionally capture and claim the gesture when touch starts on the drag handle.
      // Since this is spread ONLY on the drag handle View, it won't block clicking elsewhere on the card.
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      
      // Prevent parent scroll views or other gestures from canceling/stealing the gesture
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,

      onPanResponderGrant: () => {
        const layout = itemLayouts.current[key];
        const itemY = layout ? layout.y : index * 68;
        initialItemY.current = itemY;
        activeKeyRef.current = null; // drag state not active yet
      },

      onPanResponderMove: (evt, gestureState) => {
        // Trigger drag activation threshold of 4px
        if (activeKeyRef.current === null && Math.abs(gestureState.dy) > 4) {
          activeKeyRef.current = key;
          setActiveKey(key);
          onDragStart?.();
        }

        if (activeKeyRef.current === key) {
          const currentDragY = initialItemY.current + gestureState.dy;
          dragY.setValue(currentDragY);

          const layout = itemLayouts.current[key];
          const itemHeight = layout ? layout.height : 68;

          // Determine hover index and reorder dynamically with layout animations
          const hoverIndex = findHoverIndex(currentDragY + itemHeight / 2);
          const currentIndex = orderedDataRef.current.findIndex(
            (item) => keyExtractor(item) === key
          );

          if (hoverIndex !== -1 && hoverIndex !== currentIndex) {
            const reordered = [...orderedDataRef.current];
            const [draggedItem] = reordered.splice(currentIndex, 1);
            reordered.splice(hoverIndex, 0, draggedItem);

            // Re-calculate the initial item Y based on the layout shifts
            // so dragging continues smoothly after index swaps.
            let accY = 0;
            const newIndex = hoverIndex;
            for (let i = 0; i < newIndex; i++) {
              const itemKey = keyExtractor(reordered[i]);
              const l = itemLayouts.current[itemKey];
              accY += l ? l.height : 68;
            }
            initialItemY.current = accY - gestureState.dy;

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setOrderedData(reordered);
          }
        }
      },

      onPanResponderRelease: () => {
        if (activeKeyRef.current !== null) {
          const finalData = [...orderedDataRef.current];
          setActiveKey(null);
          activeKeyRef.current = null;
          onDragEnd?.();
          onReorder(finalData);
        }
      },

      onPanResponderTerminate: () => {
        if (activeKeyRef.current !== null) {
          setActiveKey(null);
          activeKeyRef.current = null;
          onDragEnd?.();
          setOrderedData(data); // revert to original data on termination
        }
      },
    });
  };

  return (
    <View ref={containerRef} style={styles.container}>
      {orderedData.map((item, index) => {
        const key = keyExtractor(item);
        const isDragging = activeKey === key;
        const panResponder = createPanResponder(key, index);

        return (
          <View
            key={key}
            onLayout={handleItemLayout(key)}
            style={[
              styles.itemWrapper,
              isDragging && { opacity: 0 },
            ]}
          >
            {renderItem(item, index, panResponder.panHandlers, isDragging)}
          </View>
        );
      })}

      {/* Floating element for the active dragging item */}
      {activeKey !== null && (() => {
        const activeItem = orderedData.find(
          (item) => keyExtractor(item) === activeKey
        );
        if (!activeItem) return null;

        const activeIndex = orderedData.findIndex(
          (item) => keyExtractor(item) === activeKey
        );

        return (
          <Animated.View
            style={[
              styles.floatingCard,
              {
                transform: [{ translateY: dragY }, { scale: 1.03 }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 8,
              },
            ]}
          >
            {renderItem(activeItem, activeIndex, {}, true)}
          </Animated.View>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  itemWrapper: {
    width: "100%",
  },
  draggingPlaceholder: {
    opacity: 0.9,
  },
  placeholderCard: {
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  floatingCard: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});
