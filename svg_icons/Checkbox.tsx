import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgCheckbox = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M19 20H5c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1h14.14c.55 0 .86.45.86 1v14c0 .55-.45 1-1 1m0-17H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2"
    />
  </Svg>
);
export default SvgCheckbox;
