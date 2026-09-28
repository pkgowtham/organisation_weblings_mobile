import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgRefreshCw = (props: SvgProps) => (
  <Svg
    width={32}
    height={33}
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.667}
      d="M4 16.5a12 12 0 0 1 12-12 13 13 0 0 1 8.987 3.653L28 11.167m0 0V4.5m0 6.667h-6.667M28 16.5a12 12 0 0 1-12 12 13 13 0 0 1-8.987-3.653L4 21.833m0 0h6.667m-6.667 0V28.5"
    />
  </Svg>
);
export default SvgRefreshCw;
