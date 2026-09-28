import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgCalendarPlus = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      stroke={props.color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.001 2.001v4m8-4v4m5 7v-7a2 2 0 0 0-2-2h-14a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8m-10-12h18m-5 9h6m-3-3v6"
    />
  </Svg>
);
export default SvgCalendarPlus;
