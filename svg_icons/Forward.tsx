import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgForward = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M5 19v-4q0-1.25.875-2.125A2.9 2.9 0 0 1 8 12h9.175l-3.6 3.6L15 17l6-6-6-6-1.425 1.4 3.6 3.6H8q-2.075 0-3.537 1.463Q3 12.926 3 15v4z"
    />
  </Svg>
);
export default SvgForward;
