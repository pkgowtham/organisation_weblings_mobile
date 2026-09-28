import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgDirectionsCar = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8zM6.85 6h10.29l1.08 3.11H5.77zM19 16H5v-5h14z"
    />
    <Path
      fill={props.color || "#000"}
      d="M7.5 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M16.5 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
    />
  </Svg>
);
export default SvgDirectionsCar;
