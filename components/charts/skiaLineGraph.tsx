import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback, Pressable } from 'react-native';
import { Canvas, Path, Group, LinearGradient, vec, Text, useFont, DashPathEffect } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/context/CustomThemeContext';
import { MediumText, SemiBoldText } from '../ui/typography';

// -----------------------------
// LineGraph Component (React Native + Skia + Reanimated)
// - Support for multiple lines AND backward compatibility
// - Smooth / monotone / linear curves
// - Area gradients
// - Animated drawing on load
// - Optional points
// - X & Y axis legends
// - Tooltip on line click
// -----------------------------

type DataPoint = { label: string; value: number };
type Dataset = {
  data: DataPoint[];
  color: string;
  gradientColors?: string[];
  label?: string;
};

type LineGraphProps = {
  // Backward compatible: accept single data array OR multiple datasets
  data?: DataPoint[];
  datasets?: Dataset[];
  width?: number;
  height?: number;
  curveType?: 'smooth' | 'monotone' | 'linear';
  showPoints?: boolean;
  showArea?: boolean;
  showGrid?: boolean;
  frequencyChange?: boolean;
  gradientColors?: string[];
  lineColor?: string;
  pointColor?: string;
  strokeWidth?: number;
  animateOnLoad?: boolean;
  animationDuration?: number;
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showXAxisLabels?: boolean;
  minXAxisLabels?: number;
  showYAxisLabels?: boolean;
  frequencyPeriod?: string;
  frequencyPeriodSet?: any;
  tooltipFormatter?: (point: DataPoint, datasetIndex: number) => string;
  yAxisMin?: number;
  yAxisMax?: number;
  yAxisFormatter?: (value: number) => string;
  currentDataIndex?: number;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default colors for multiple lines
const DEFAULT_COLORS = [
  '#007AFF', // Blue
  '#FF3B30', // Red
  '#4CD964', // Green
  '#FFCC00', // Yellow
  '#5856D6', // Purple
  '#FF2D55', // Pink
  '#34C759', // Light Green
];

function computePathPoints(data: DataPoint[], w: number, h: number, padding = 12) {
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (w - padding * 2) / Math.max(1, data.length - 1);

  return data.map((d, i) => {
    const x = padding + i * step;
    const y = padding + (1 - (d.value - min) / range) * (h - padding * 2);
    return { x, y, original: d };
  });
}

function computePathPointsWithGlobalScale(
  data: DataPoint[],
  w: number,
  h: number,
  globalScale: { min: number; max: number; range: number },
  padding = 12
) {
  const step = (w - padding * 2) / Math.max(1, data.length - 1);

  return data.map((d, i) => {
    const x = padding + i * step;
    const y = padding + (1 - (d.value - globalScale.min) / globalScale.range) * (h - padding * 2);
    return { x, y, original: d };
  });
}

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

function buildLinearPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

function buildMonotonePath(points: { x: number; y: number }[]) {
  return buildSmoothPath(points);
}

export default function SkiaLineGraph({
  data,
  datasets,
  width = SCREEN_WIDTH - 64,
  height = 220,
  frequencyChange = false,
  curveType = 'smooth',
  showPoints = true,
  showArea = true,
  showGrid = true,
  gradientColors = ['rgba(0,122,255,0.3)', 'rgba(0,122,255,0.1)', 'rgba(0,122,255,0)'],
  lineColor = '#007AFF',
  pointColor = '#007AFF',
  strokeWidth = 3,
  animateOnLoad = true,
  animationDuration = 1600,
  title,
  subtitle,
  showXAxisLabels = true,
  minXAxisLabels,
  showYAxisLabels = true,
  tooltipFormatter = (point) => `${point.label}: ${point.value}`,
  frequencyPeriodSet,
  frequencyPeriod,
  yAxisMin,
  yAxisMax,
  yAxisFormatter,
  currentDataIndex,
}: LineGraphProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const fontSize = 10;
  const font = useFont(require('@/assets/fonts/OpenSans-Regular.ttf'), fontSize);

  const [selectedPoint, setSelectedPoint] = useState<{
    point: DataPoint;
    x: number;
    y: number;
    datasetIndex: number;
    datasetColor: string;
    datasetLabel?: string;
  } | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Normalize datasets - handle both single data and multiple datasets
  const normalizedDatasets = useMemo((): Dataset[] => {
    if (datasets) {
      return datasets;
    }

    if (data) {
      return [{
        data,
        color: lineColor,
        gradientColors,
        label: 'Dataset 1'
      }];
    }

    return [];
  }, [data, datasets, lineColor, gradientColors]);

  // Calculate global min and max values across all datasets for consistent scaling
  const globalMinMax = useMemo(() => {
    const allValues = normalizedDatasets.flatMap(dataset => dataset.data.map(d => d.value));
    if (allValues.length === 0) return { min: 0, max: 100, range: 100 };

    const min = yAxisMin !== undefined ? yAxisMin : Math.min(...allValues);
    const max = yAxisMax !== undefined ? yAxisMax : Math.max(...allValues);
    return { min, max, range: max - min || 1 };
  }, [normalizedDatasets, yAxisMin, yAxisMax]);

  // Compute path points for each dataset with consistent scaling
  const allPathPoints = useMemo(() => {
    return normalizedDatasets.map(dataset =>
      computePathPointsWithGlobalScale(dataset.data, width, height, globalMinMax)
    );
  }, [normalizedDatasets, width, height, globalMinMax]);

  // Build paths for each dataset
  const allPaths = useMemo(() => {
    return allPathPoints.map(points => {
      if (curveType === 'linear') return buildLinearPath(points);
      if (curveType === 'monotone') return buildMonotonePath(points);
      return buildSmoothPath(points);
    });
  }, [allPathPoints, curveType]);

  const progress = useSharedValue(animateOnLoad ? 0 : 1);

  useEffect(() => {
    if (!animateOnLoad) return;
    progress.value = withTiming(1, {
      duration: animationDuration ?? 1600,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [animateOnLoad, animationDuration, progress]);

  // Build area paths for each dataset
  const allAreaPaths = useMemo(() => {
    return allPathPoints.map((points, index) => {
      if (!showArea || points.length === 0) return '';
      const baseY = height - 12;
      let d = '';
      d += `M ${points[0].x} ${baseY}`;
      d += ` L ${points[0].x} ${points[0].y}`;
      d += allPaths[index].replace(/^M /, ' L ');
      d += ` L ${points[points.length - 1].x} ${baseY} Z`;
      return d;
    });
  }, [showArea, allPathPoints, allPaths, height]);

  // Calculate Y-axis values for labels based on global scale
  const yAxisValues = useMemo(() => {
    const { min, max, range } = globalMinMax;
    return [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max];
  }, [globalMinMax]);

  // Calculate Y positions for axis labels
  const yAxisPositions = useMemo(() => {
    return [1, 0.75, 0.5, 0.25, 0].map(t => 12 + t * (height - 24));
  }, [height]);

  const handleGraphPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;

    // Find the closest point across all datasets
    let closestPoint: {
      point: DataPoint;
      x: number;
      y: number;
      datasetIndex: number;
      datasetColor: string;
      datasetLabel?: string;
    } | null = null;
    let minDistance = Infinity;

    allPathPoints.forEach((points, datasetIndex) => {
      points.forEach((pt) => {
        const distance = Math.sqrt(
          Math.pow(locationX - pt.x, 2) + Math.pow(locationY - pt.y, 2)
        );

        if (distance < minDistance && distance < 30) { // 30px touch radius
          minDistance = distance;
          closestPoint = {
            point: pt.original,
            x: pt.x,
            y: pt.y,
            datasetIndex,
            datasetColor: normalizedDatasets[datasetIndex].color,
            datasetLabel: normalizedDatasets[datasetIndex].label
          };
        }
      });
    });

    if (closestPoint) {
      setSelectedPoint(closestPoint);
      setTooltipVisible(true);

      // Auto-hide tooltip after 3 seconds
      setTimeout(() => {
        setTooltipVisible(false);
      }, 3000);
    } else {
      setTooltipVisible(false);
    }
  };

  // Get default gradient colors based on line color
  const getDefaultGradientColors = (lineColor: string) => {
    return [
      `${lineColor}30`, // 30% opacity
      `${lineColor}10`, // 10% opacity  
      `${lineColor}00`, // 0% opacity
    ];
  };

  // Use the first dataset for X-axis labels
  const firstDatasetData = normalizedDatasets[0]?.data;

  return (
    <View style={[styles.container, { width, height: height + 80 }]}>
      {title || subtitle ? (
        <View style={styles.header}>
          {title ? <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <SemiBoldText fontVariant='BM' style={styles.title}>{title}</SemiBoldText>
            {frequencyChange && frequencyPeriod && (
              <View style={{ flexDirection: 'row', gap: 18 }}>
                <SemiBoldText
                  onPress={() => frequencyPeriodSet('ThreeMonth')}
                  color={frequencyPeriod === 'ThreeMonth' ? theme.colors.brand.onSurface.light : theme.colors.neutral.onSurface.light}
                >
                  3 Months
                </SemiBoldText>
                <SemiBoldText
                  onPress={() => frequencyPeriodSet('Month')}
                  color={frequencyPeriod === 'Month' ? theme.colors.brand.onSurface.light : theme.colors.neutral.onSurface.light}
                >
                  Month
                </SemiBoldText>
                <SemiBoldText
                  onPress={() => frequencyPeriodSet('Week')}
                  color={frequencyPeriod === 'Week' ? theme.colors.brand.onSurface.light : theme.colors.neutral.onSurface.light}
                >
                  Week
                </SemiBoldText>
              </View>
            )}
          </View> : null}
          {subtitle ? <MediumText fontVariant='BS' style={styles.subtitle}>{subtitle}</MediumText> : null}
        </View>
      ) : null}

      <View style={styles.graphContainer}>
        {/* Y Axis Labels */}
        {showYAxisLabels && (
          <Canvas style={styles.yAxisCanvas}>
            {font && yAxisValues.map((value, index) => {
              const formattedValue = yAxisFormatter ? yAxisFormatter(value) : value.toFixed(1);
              return (
                <Text
                  key={`y-label-${index}`}
                  x={0}
                  y={yAxisPositions[index] + fontSize / 2}
                  text={formattedValue}
                  font={font}
                  color={theme.colors.neutral.onSurface.dark}
                />
              );
            })}
          </Canvas>
        )}

        <Pressable onPress={handleGraphPress}>
          <View>
            <Canvas style={{ width: width, height }}>
              {/* Optional grid background */}
              {showGrid && (
                <Group>
                  {yAxisPositions.map((y, i) => (
                    <Path
                      key={`grid-${i}`}
                      path={`M 12 ${y} L ${width - 12} ${y}`}
                      strokeWidth={1}
                      style="stroke"
                      strokeMiter={1}
                      color={theme.colors.neutral.surface.light}
                    />
                  ))}
                </Group>
              )}

              {/* Current Date Line */}
              {currentDataIndex !== undefined && allPathPoints[0]?.[currentDataIndex] && (
                <Path
                  path={`M ${allPathPoints[0][currentDataIndex].x} 12 L ${allPathPoints[0][currentDataIndex].x} ${height - 12}`}
                  strokeWidth={2}
                  style="stroke"
                  color={theme.colors.brand.surface.medium || '#007AFF'}
                  opacity={0.5}
                >
                  <DashPathEffect intervals={[4, 4]} />
                </Path>
              )}

              {/* Render all datasets */}
              {normalizedDatasets.map((dataset, index) => (
                <Group key={`dataset-${index}`}>
                  {/* Area fill */}
                  {showArea && allAreaPaths[index] && (
                    <Path
                      path={allAreaPaths[index]}
                      color={dataset.gradientColors?.[0] || getDefaultGradientColors(dataset.color)[0]}
                    >
                      <LinearGradient
                        start={vec(0, 0)}
                        end={vec(0, height)}
                        colors={dataset.gradientColors || getDefaultGradientColors(dataset.color)}
                      />
                    </Path>
                  )}

                  {/* Line path */}
                  {allPaths[index] && (
                    <Path
                      path={allPaths[index]}
                      strokeWidth={strokeWidth}
                      style="stroke"
                      strokeJoin="round"
                      strokeCap="round"
                      color={dataset.color}
                      start={0}
                      end={progress}
                    />
                  )}

                  {/* Points */}
                  {showPoints && allPathPoints[index].map((p, i) => (
                    <Group key={`pt-${index}-${i}`} transform={[{ translateX: p.x }, { translateY: p.y }]}>
                      <Path
                        path={`M ${0} ${0} m -4, 0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0`}
                        style="fill"
                        color={dataset.color}
                      />
                    </Group>
                  ))}
                </Group>
              ))}

              {/* Selected point highlight */}
              {selectedPoint && tooltipVisible && (
                <Group>
                  <Path
                    path={`M ${selectedPoint.x} ${selectedPoint.y} m -6, 0 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0`}
                    style="fill"
                    color={selectedPoint.datasetColor}
                  />
                </Group>
              )}

              {/* X Axis Labels */}
              {showXAxisLabels && font && firstDatasetData && (
                <Group>
                  {firstDatasetData.map((item, index) => {
                    const total = firstDatasetData.length;
                    const desiredLabels = minXAxisLabels ?? 7;
                    const step =
                      total <= desiredLabels ? 1 : Math.ceil(total / (desiredLabels - 1));

                    const shouldShow =
                      index === 0 || index === total - 1 || index % step === 0;

                    if (!shouldShow) return null;

                    return (
                      <Text
                        key={`x-label-${index}`}
                        x={allPathPoints[0][index]?.x - 12}
                        y={height - 2}
                        text={item.label}
                        font={font}
                        color={theme.colors.neutral.onSurface.dark}
                      />
                    );
                  })}
                </Group>
              )}

            </Canvas>

            {/* Tooltip */}
            {selectedPoint && tooltipVisible && (
              <View
                style={[
                  styles.tooltip,
                  {
                    left: selectedPoint.x - 26,
                    top: selectedPoint.y - 65,
                    borderLeftColor: selectedPoint.datasetColor,
                  }
                ]}
              >
                <View style={styles.tooltipContent}>
                  <SemiBoldText fontVariant="BS" style={styles.tooltipText}>
                    {tooltipFormatter(selectedPoint.point, selectedPoint.datasetIndex)}
                  </SemiBoldText>
                  {selectedPoint.datasetLabel && (
                    <MediumText fontVariant="BS" style={styles.tooltipSubtext}>
                      {selectedPoint.datasetLabel}
                    </MediumText>
                  )}
                </View>
                <View style={[styles.tooltipArrow, { borderTopColor: selectedPoint.datasetColor }]} />
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingVertical: 8,
    },
    header: {
      width: '100%',
      paddingHorizontal: 8,
      marginBottom: 8,
    },
    title: {
      color: theme.colors.neutral.onSurface.light,
    },
    subtitle: {
      color: theme.colors.neutral.onSurface.dark,
    },
    graphContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    yAxisCanvas: {
      height: 220,
      width: 20,
      marginRight: 4,
    },
    tooltip: {
      position: 'absolute',
      backgroundColor: theme.colors.neutral.surface.light,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      shadowColor: theme.colors.neutral.surface.inverse,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 1,
      borderLeftWidth: 4,
    },
    tooltipContent: {
      alignItems: 'center',
    },
    tooltipText: {
      color: theme.colors.neutral.onSurface.light,
      fontSize: 12,
    },
    tooltipSubtext: {
      color: theme.colors.neutral.onSurface.dark,
      fontSize: 10,
      marginTop: 2,
    },
    tooltipArrow: {
      position: 'absolute',
      bottom: -6,
      left: '50%',
      marginLeft: -6,
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: 6,
      borderRightWidth: 6,
      borderTopWidth: 6,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    },
  });