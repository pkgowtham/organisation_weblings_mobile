import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgReplyArrowRight = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
    viewBox="0 0 24 24"
  >
    <Path
      fill={props.color || "#000"}
      d="M4 5a1 1 0 0 1 1 1v3q0 1.25.875 2.125A2.9 2.9 0 0 0 8 12h9.175l-3.6-3.6L15 7l6 6-6 6-1.425-1.4 3.6-3.6H8q-2.075 0-3.537-1.463Q3 11.075 3 9V6a1 1 0 0 1 1-1"
    />
  </Svg>
);
export default SvgReplyArrowRight;
