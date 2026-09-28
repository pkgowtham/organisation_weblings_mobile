import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgTextColor = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M3.5 20a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2h-16a1 1 0 0 1-1-1M15.996 14H9.004l-1.349 3.371A1 1 0 1 1 5.8 16.63l5.45-13A1 1 0 0 1 12.177 3h.646a1 1 0 0 1 .928.629l5.45 13a1 1 0 0 1-1.856.742zm-.8-2L12.5 5.885 9.804 12z"
    />
  </Svg>
);
export default SvgTextColor;
