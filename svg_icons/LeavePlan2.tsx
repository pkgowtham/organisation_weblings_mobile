import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgLeavePlan2 = (props: SvgProps) => (
  <Svg
    width={24}
    height={25}
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.333}
      d="M19 4.5H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-14a2 2 0 0 0-2-2M16 2.5v4M3 10.5h18M8 2.5v4M17 14.5h-6M13 18.5H7M7 14.5h.007M17 18.5h.006"
    />
  </Svg>
);
export default SvgLeavePlan2;
