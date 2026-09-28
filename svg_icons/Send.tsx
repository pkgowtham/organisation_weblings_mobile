import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgSend = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
    viewBox="0 0 24 24"
  >
    <Path fill={props.color || "#000"} d="M3 20V4l19 8zm2-3 11.85-5L5 7v3.5l6 1.5-6 1.5z" />
  </Svg>
);
export default SvgSend;
