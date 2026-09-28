import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import Svg, {
  Path,
  G,
  Text as SvgText,
  Line,
  Circle,
  Rect,
  LinearGradient,
  Stop,
  Defs,
} from 'react-native-svg';
import { RegularText, SemiBoldText } from '../ui/typography';
import { useTheme } from '@/context/CustomThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRAPH_WIDTH = SCREEN_WIDTH - 48;
const GRAPH_HEIGHT = 200;
const PADDING = 16;
const POINT_RADIUS = 4;
const TOOLTIP_WIDTH = 80;
const TOOLTIP_HEIGHT = 40;

interface DataPoint {
  label: string;
  value: number;
  timestamp?: number;
}

type CurveType = 'linear' | 'smooth' | 'monotone';

interface LineGraphProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  gradientColors?: string[];
  lineColor?: string;
  pointColor?: string;
  tooltipBackground?: string;
  tooltipTextColor?: string;
  showGrid?: boolean;
  animateOnLoad?: boolean;
  animationDuration?: number;
  title?: string;
  subtitle?: string;
  showPoints?: boolean;
  curveType?: CurveType;
  showArea?: boolean;
  strokeWidth?: number;
}

const LineGraph: React.FC<LineGraphProps> = ({
  data,
  width = GRAPH_WIDTH,
  height = GRAPH_HEIGHT,
  gradientColors = ['rgba(120, 120, 255, 0.3)', 'rgba(120, 120, 255, 0.1)', 'rgba(120, 120, 255, 0)'],
  lineColor = '#7878FF',
  pointColor = '#7878FF',
  tooltipBackground = 'rgba(28, 28, 30, 0.95)',
  tooltipTextColor = '#FFFFFF',
  showGrid = true,
  animateOnLoad = true,
  animationDuration = 1500,
  title,
  subtitle,
  showPoints = true,
  curveType = 'smooth',
  showArea = true,
  strokeWidth = 3,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const animationValue = useRef(new Animated.Value(0)).current;
  const viewRef = useRef<View>(null);
  const checkIntervalRef = useRef<number | null>(null);
  const gradientId = useRef(`gradient-${title || Math.random()}`).current;
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  const chartWidth = width - PADDING * 2;
  const chartHeight = height - PADDING * 2;

  // Memoize calculations
  const { values, maxValue, minValue, valueRange } = useMemo(() => {
    const vals = data.map(point => point.value);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return {
      values: vals,
      maxValue: max,
      minValue: min,
      valueRange: max - min || 1,
    };
  }, [data]);

  // Calculate coordinates for each data point (memoized)
  const getPointCoordinates = useCallback((index: number) => {
    const x = (index / (data.length - 1)) * chartWidth + PADDING;
    const y = chartHeight - ((data[index].value - minValue) / valueRange) * chartHeight + PADDING;
    return { x, y };
  }, [data, chartWidth, chartHeight, minValue, valueRange]);

  // Helper function to calculate control points for smooth Bezier curves
  const getControlPoints = useCallback((
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    tension = 0.3
  ) => {
    const d01 = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
    const d12 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

    const fa = tension * d01 / (d01 + d12);
    const fb = tension * d12 / (d01 + d12);

    const cp1x = p1.x - fa * (p2.x - p0.x);
    const cp1y = p1.y - fa * (p2.y - p0.y);

    const cp2x = p1.x + fb * (p2.x - p0.x);
    const cp2y = p1.y + fb * (p2.y - p0.y);

    return { cp1: { x: cp1x, y: cp1y }, cp2: { x: cp2x, y: cp2y } };
  }, []);

  // Generate smooth curve path
  const generateSmoothPath = useCallback(() => {
    if (data.length < 2) return '';

    const points = data.map((_, index) => getPointCoordinates(index));
    let path = `M${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const controlPoints = getControlPoints(p0, p1, p2, 0.3);
      const nextControlPoints = getControlPoints(p1, p2, p3, 0.3);

      path += ` C${controlPoints.cp2.x},${controlPoints.cp2.y} ${nextControlPoints.cp1.x},${nextControlPoints.cp1.y} ${p2.x},${p2.y}`;
    }

    return path;
  }, [data, getPointCoordinates, getControlPoints]);

  // Generate monotone cubic interpolation
  const generateMonotonePath = useCallback(() => {
    if (data.length < 2) return '';

    const points = data.map((_, index) => getPointCoordinates(index));
    let path = `M${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const dx = p2.x - p1.x;
      const cp1x = p1.x + dx * 0.33;
      const cp2x = p1.x + dx * 0.67;

      path += ` C${cp1x},${p1.y} ${cp2x},${p2.y} ${p2.x},${p2.y}`;
    }

    return path;
  }, [data, getPointCoordinates]);

  // Generate linear path
  const generateLinearPath = useCallback(() => {
    if (data.length < 2) return '';

    let path = '';
    data.forEach((_, index) => {
      const { x, y } = getPointCoordinates(index);
      if (index === 0) {
        path = `M${x},${y}`;
      } else {
        path += ` L${x},${y}`;
      }
    });

    return path;
  }, [data, getPointCoordinates]);

  // Get the appropriate path based on curve type (memoized)
  const linePath = useMemo(() => {
    switch (curveType) {
      case 'smooth':
        return generateSmoothPath();
      case 'monotone':
        return generateMonotonePath();
      case 'linear':
      default:
        return generateLinearPath();
    }
  }, [curveType, generateSmoothPath, generateMonotonePath, generateLinearPath]);

  // Generate area path (memoized)
  const areaPath = useMemo(() => {
    if (!linePath || data.length < 2) return '';

    const firstPoint = getPointCoordinates(0);
    const lastIndex = data.length - 1;
    const lastPoint = getPointCoordinates(lastIndex);

    const linePathWithoutM = linePath.substring(1);

    return `M${firstPoint.x},${chartHeight + PADDING} L${linePathWithoutM} L${lastPoint.x},${chartHeight + PADDING} Z`;
  }, [linePath, data, getPointCoordinates, chartHeight]);

  // Calculate path length (memoized)
  const pathLength = useMemo(() => chartWidth * 2, [chartWidth]);

  // Handle point press
  const handlePointPress = useCallback((index: number) => {
    const { x, y } = getPointCoordinates(index);

    let tooltipX = x - TOOLTIP_WIDTH / 2;
    let tooltipY = y - TOOLTIP_HEIGHT - 20;

    if (tooltipX < PADDING) tooltipX = PADDING;
    if (tooltipX + TOOLTIP_WIDTH > width - PADDING) {
      tooltipX = width - PADDING - TOOLTIP_WIDTH;
    }
    if (tooltipY < PADDING) tooltipY = y + 20;

    setTooltipPosition({ x: tooltipX, y: tooltipY });
    setSelectedPoint(index);
    setIsTooltipVisible(true);
  }, [getPointCoordinates, width]);

  // Viewport detection - only animate when graph comes into view
  useEffect(() => {
    if (!animateOnLoad || hasAnimated || !isChecking) return;

    let mounted = true;
    const checkIfInView = () => {
      if (viewRef.current && mounted && isChecking) {
        viewRef.current.measureInWindow((x, y, width, height) => {
          const windowHeight = Dimensions.get('window').height;
          // Add buffer zone for smoother trigger (100px before entering viewport)
          const isVisible = y < windowHeight + 100 && y + height > -100;

          if (isVisible && !isInView && mounted) {
            setIsInView(true);
            setIsChecking(false); // Stop checking once visible
          }
        });
      }
    };

    // Check immediately
    checkIfInView();

    // Use longer interval to reduce checks
    checkIntervalRef.current = setInterval(checkIfInView, 300);

    return () => {
      mounted = false;
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [animateOnLoad, hasAnimated, isInView, isChecking]);

  // Trigger animation when graph becomes visible
  useEffect(() => {
    if (isInView && !hasAnimated && animateOnLoad) {
      // Stop interval checking immediately
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }

      animationValue.setValue(0);

      Animated.timing(animationValue, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }).start(() => {
        setHasAnimated(true);
      });
    } else if (!animateOnLoad && !hasAnimated) {
      animationValue.setValue(1);
      setHasAnimated(true);
      setIsChecking(false);
    }
  }, [isInView, hasAnimated, animateOnLoad, animationDuration, animationValue]);

  // Hide tooltip after delay
  useEffect(() => {
    if (isTooltipVisible) {
      const timer = setTimeout(() => {
        setIsTooltipVisible(false);
        setSelectedPoint(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isTooltipVisible]);

  if (!data || data.length < 2) {
    return (
      <View style={[styles.container, { width, height }]}>
        <RegularText>Not enough data to display graph</RegularText>
      </View>
    );
  }

  // Grid lines memoized
  const gridLines = useMemo(() => {
    if (!showGrid) return null;

    return [0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
      const y = PADDING + chartHeight * (1 - ratio);
      const value = minValue + valueRange * ratio;
      return (
        <G key={`grid-${index}`}>
          <Line
            x1={PADDING}
            y1={y}
            x2={width - PADDING}
            y2={y}
            stroke="rgba(120, 120, 132, 0.2)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <SvgText
            x={0}
            y={y + 4}
            fontFamily='OpenSansMedium'
            fontSize="10"
            fill="rgba(120, 120, 132, 0.7)"
            textAnchor="start"
          >
            {Math.round(value)}
          </SvgText>
        </G>
      );
    });
  }, [showGrid, chartHeight, minValue, valueRange, width]);

  // Data points memoized
  const dataPoints = useMemo(() => {
    if (!showPoints) return null;

    return data.map((_, index) => {
      const { x, y } = getPointCoordinates(index);
      const isSelected = selectedPoint === index;

      return (
        <G key={`point-${index}`}>
          {isSelected && (
            <Circle
              cx={x}
              cy={y}
              r={POINT_RADIUS * 2}
              fill={pointColor}
              opacity="0.3"
            />
          )}

          <Circle
            cx={x}
            cy={y}
            r={POINT_RADIUS}
            fill={isSelected ? '#FFFFFF' : pointColor}
            stroke={pointColor}
            strokeWidth={isSelected ? 2 : 0}
            onPress={() => handlePointPress(index)}
          />

          <Circle
            cx={x}
            cy={y}
            r={POINT_RADIUS * 2}
            fill="transparent"
            onPress={() => handlePointPress(index)}
          />
        </G>
      );
    });
  }, [showPoints, data, getPointCoordinates, selectedPoint, pointColor, handlePointPress]);

  return (
    <View
      ref={viewRef}
      style={[styles.container, { width, height }]}
      onLayout={() => {
        // Trigger viewport check on layout
        if (viewRef.current && !hasAnimated && animateOnLoad && isChecking) {
          // Use requestAnimationFrame for better performance
          requestAnimationFrame(() => {
            viewRef.current?.measureInWindow((x, y, w, h) => {
              const windowHeight = Dimensions.get('window').height;
              const isVisible = y < windowHeight + 100 && y + h > -100;
              if (isVisible && !isInView) {
                setIsInView(true);
                setIsChecking(false);
              }
            });
          });
        }
      }}
    >
      {/* Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <SemiBoldText style={styles.titleText}>
              {title}
            </SemiBoldText>
          )}
          {subtitle && (
            <RegularText style={styles.subtitleText}>
              {subtitle}
            </RegularText>
          )}
        </View>
      )}

      {/* Graph Container */}
      <View style={styles.graphContainer}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={gradientColors[0]} stopOpacity="0.4" />
              <Stop offset="50%" stopColor={gradientColors[1]} stopOpacity="0.2" />
              <Stop offset="100%" stopColor={gradientColors[2]} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Grid Lines */}
          <G>{gridLines}</G>

          {/* Gradient Area with Animation */}
          {showArea && areaPath && (
            <AnimatedPath
              d={areaPath}
              fill={`url(#gradient-${title || Math.random()})`}
              opacity={animationValue}
            />
          )}

          {/* Animated Line with strokeDasharray */}
          {linePath && (
            <AnimatedPath
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLength}
              strokeDashoffset={animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [pathLength, 0],
              })}
            />
          )}

          {/* Data Points */}
          <G>{dataPoints}</G>

          {/* Tooltip */}
          {isTooltipVisible && selectedPoint !== null && (
            <G>
              <Rect
                x={tooltipPosition.x}
                y={tooltipPosition.y}
                width={TOOLTIP_WIDTH}
                height={TOOLTIP_HEIGHT}
                fill={tooltipBackground}
                rx="8"
              />

              <SvgText
                x={tooltipPosition.x + TOOLTIP_WIDTH / 2}
                y={tooltipPosition.y + TOOLTIP_HEIGHT / 2 - 6}
                fontSize="12"
                fill={tooltipTextColor}
                textAnchor="middle"
                fontWeight="bold"
              >
                {data[selectedPoint].value}
              </SvgText>

              <SvgText
                x={tooltipPosition.x + TOOLTIP_WIDTH / 2}
                y={tooltipPosition.y + TOOLTIP_HEIGHT / 2 + 8}
                fontSize="10"
                fill={tooltipTextColor}
                textAnchor="middle"
              >
                {data[selectedPoint].label}
              </SvgText>

              <Path
                d={`M${tooltipPosition.x + TOOLTIP_WIDTH / 2 - 6},${tooltipPosition.y + TOOLTIP_HEIGHT} L${tooltipPosition.x + TOOLTIP_WIDTH / 2},${tooltipPosition.y + TOOLTIP_HEIGHT + 6} L${tooltipPosition.x + TOOLTIP_WIDTH / 2 + 6},${tooltipPosition.y + TOOLTIP_HEIGHT} Z`}
                fill={tooltipBackground}
              />
            </G>
          )}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: lineColor }]} />
          <RegularText style={styles.legendText}>
            Current Period
          </RegularText>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      paddingHorizontal: PADDING,
      marginBottom: 16,
      width: '100%',
    },
    titleText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.neutral.onSurface.light,
      marginBottom: 4,
      textAlign: 'center',
    },
    subtitleText: {
      fontSize: 14,
      color: theme.colors.neutral.onSurface.dark,
      textAlign: 'center',
    },
    graphContainer: {
      position: 'relative',
      paddingVertical: 24,
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
      paddingHorizontal: PADDING,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 8,
    },
    legendColor: {
      width: 12,
      height: 3,
      borderRadius: 1.5,
      marginRight: 6,
    },
    legendText: {
      fontSize: 12,
      color: theme.colors.neutral.onSurface.dark,
    },
  });

export default React.memo(LineGraph);