import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

export const CloseIcon = ({
  color = "#151515",
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckIcon = ({
  color = "#ffffff",
  size = 14,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const DragHandleIcon = ({
  color = "#999",
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="7" cy="4" r="1.5" fill={color} />
    <Circle cx="13" cy="4" r="1.5" fill={color} />
    <Circle cx="7" cy="10" r="1.5" fill={color} />
    <Circle cx="13" cy="10" r="1.5" fill={color} />
    <Circle cx="7" cy="16" r="1.5" fill={color} />
    <Circle cx="13" cy="16" r="1.5" fill={color} />
  </Svg>
);
