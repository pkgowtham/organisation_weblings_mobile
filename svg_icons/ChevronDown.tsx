import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgChevronDown = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
    viewBox="0 0 24 24"
  >
    <Path
      fill={props.color || "#000"}
      d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
    />
  </Svg>
);
export default SvgChevronDown;
