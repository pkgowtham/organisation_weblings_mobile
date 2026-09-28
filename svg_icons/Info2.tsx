import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgInfo2 = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path fill={props.color || "#000"} d="M10.398 4h3.2v3.2h-3.2zm0 6.4h3.2V20h-3.2z" />
  </Svg>
);
export default SvgInfo2;
