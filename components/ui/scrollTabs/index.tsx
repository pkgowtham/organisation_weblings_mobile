import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";

// ──────────────────────────────────────────────────────────────
//  ScrollTabs — horizontal scrollable tab bar
//
//  Renders a row of touchable tab labels inside a horizontal
//  ScrollView with a hardware-accelerated 60fps/120fps sliding
//  animated indicator line.
//
//  All colours and spacing come from the app theme.
// ──────────────────────────────────────────────────────────────

export interface ScrollTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** Override wrapper style (e.g. paddingHorizontal) */
  containerStyle?: ViewStyle;
}

const SPRING_CONFIG = {
  damping: 24,
  stiffness: 300,
  mass: 0.5,
  overshootClamping: true,
};

const ScrollTabs: React.FC<ScrollTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  containerStyle,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const scrollViewRef = useRef<ScrollView>(null);

  const [tabLayouts, setTabLayouts] = useState<{
    [key: string]: { x: number; width: number };
  }>({});

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const opacity = useSharedValue(0);

  const handleLayout = (tab: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => {
      if (prev[tab]?.x === x && prev[tab]?.width === width) return prev;
      return { ...prev, [tab]: { x, width } };
    });
  };

  useEffect(() => {
    const currentLayout = tabLayouts[activeTab];
    if (currentLayout && currentLayout.width > 0) {
      const centerX = currentLayout.x + currentLayout.width / 2 - 0.5;
      const width = currentLayout.width;

      if (opacity.value === 0) {
        indicatorX.value = centerX;
        indicatorWidth.value = width;
        opacity.value = withTiming(1, { duration: 150 });
      } else {
        indicatorX.value = withSpring(centerX, SPRING_CONFIG);
        indicatorWidth.value = withSpring(width, SPRING_CONFIG);
      }

      scrollViewRef.current?.scrollTo({
        x: Math.max(0, currentLayout.x - 20),
        animated: true,
      });
    }
  }, [activeTab, tabLayouts]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: indicatorX.value },
      { scaleX: indicatorWidth.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        style={{ flexGrow: 0 }}
      >
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              onPress={() => onTabChange(tab)}
              onLayout={(e) => handleLayout(tab, e)}
              style={styles.tabItem}
            >
              <Typography
                fontVariant="LS"
                variant="semibold"
                style={{
                  color: isActive
                    ? theme.colors.brand.surface.medium
                    : theme.colors.neutral.onSurface.disabled,
                }}
              >
                {tab}
              </Typography>
            </TouchableOpacity>
          );
        })}

        <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: theme.spacing.s500,
    },
    tabsContainer: {
      flexDirection: "row",
      position: "relative",
      alignItems: "center",
    },
    tabItem: {
      paddingVertical: theme.spacing.s150 ?? 6,
      marginRight: theme.spacing.s600,
    },
    indicator: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 1,
      height: 2,
      backgroundColor: theme.colors.brand.surface.medium,
    },
  });

export default ScrollTabs;
