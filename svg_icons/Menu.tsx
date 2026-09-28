import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgMenu = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path fill={props.color || "#000"} d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z" />
  </Svg>
);
export default SvgMenu;
