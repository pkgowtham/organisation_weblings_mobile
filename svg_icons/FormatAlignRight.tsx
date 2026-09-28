import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgFormatAlignRight = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M3 21h18v-2H3zm6-4h12v-2H9zm-6-4h18v-2H3zm6-4h12V7H9zM3 3v2h18V3z"
    />
  </Svg>
);
export default SvgFormatAlignRight;
