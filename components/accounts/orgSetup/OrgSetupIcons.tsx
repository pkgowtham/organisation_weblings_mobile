import React from "react";
import Svg, { Path } from "react-native-svg";

export const DomainIcon = ({
  width = 48,
  height = 48,
  color = "#0070E8",
}: {
  width?: number;
  height?: number;
  color?: string;
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
      fill={color}
    />
  </Svg>
);

export const GlobeIcon = ({
  width = 16,
  height = 16,
  color = "#0070E8",
}: {
  width?: number;
  height?: number;
  color?: string;
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.07c.83 1.2 1.5 2.59 1.95 3.93h-3.9c.45-1.34 1.12-2.73 1.95-3.93zM4.26 14a7.82 7.82 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4zm.81 2h2.95a15.65 15.65 0 0 0 1.38 3.56A8.03 8.03 0 0 1 5.07 16zm2.95-8H5.07a8.03 8.03 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.02 8zM12 19.93c-.83-1.2-1.5-2.59-1.95-3.93h3.9c-.45 1.34-1.12 2.73-1.95 3.93zm2.58-5.93h-5.16a14.6 14.6 0 0 1 0-4h5.16a14.6 14.6 0 0 1 0 4zm.37 5.49A15.65 15.65 0 0 0 16.33 16h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38a7.82 7.82 0 0 1 0 4z"
      fill={color}
    />
  </Svg>
);

export const WarningIcon = ({
  width = 20,
  height = 20,
  color = "#B78103",
}: {
  width?: number;
  height?: number;
  color?: string;
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill={color} />
  </Svg>
);

export const ContentCopyIcon = ({
  width = 16,
  height = 16,
  color = "#0070E8",
}: {
  width?: number;
  height?: number;
  color?: string;
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
      fill={color}
    />
  </Svg>
);

export const ArrowLeftIcon = ({
  width = 16,
  height = 16,
  color = "#000",
}: {
  width?: number;
  height?: number;
  color?: string;
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill={color} />
  </Svg>
);

export const ArrowRightIcon = ({
  width = 16,
  height = 16,
  color = "#000",
}: {
  width?: number;
  height?: number;
  color?: string;
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill={color} />
  </Svg>
);
