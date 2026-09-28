import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgFormatAlignJustify = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M3 21h18v-2H3zm0-4h18v-2H3zm0-4h18v-2H3zm0-4h18V7H3zm0-6v2h18V3z"
    />
  </Svg>
);
export default SvgFormatAlignJustify;
