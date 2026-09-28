import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgViewKanban = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path fill={props.color || "#0072C4"} d="M9 7H7v10h2zM13 7h-2v5h2zM17 7h-2v8h2z" />
    <Path
      fill={props.color || "#0072C4"}
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14z"
    />
  </Svg>
);
export default SvgViewKanban;
