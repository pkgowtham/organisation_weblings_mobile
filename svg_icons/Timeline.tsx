import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgTimeline = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path fill={props.color || "#000"} d="M12 15H6v2h6zM18 7h-6v2h6zM15 11H9v2h6z" />
    <Path
      fill={props.color || "#000"}
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14z"
    />
  </Svg>
);
export default SvgTimeline;
