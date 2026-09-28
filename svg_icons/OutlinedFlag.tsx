import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgOutlinedFlag = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="m13.5 5.5-1-2h-8v17h2v-7h5l1 2h7v-10zm4 8h-4l-1-2h-6v-6h5l1 2h5z"
    />
  </Svg>
);
export default SvgOutlinedFlag;
