import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgUndo = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M8.5 8v2.612a.65.65 0 0 1-1.066.5L3.099 7.499a.65.65 0 0 1 0-.998l4.335-3.613a.65.65 0 0 1 1.066.5V6h4a8 8 0 0 1 0 16h-3a1 1 0 1 1 0-2h3a6 6 0 1 0 0-12z"
    />
  </Svg>
);
export default SvgUndo;
