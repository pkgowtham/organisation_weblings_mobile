import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgArrowDropDown = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="m8.706 11.414 2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71h-5.18c-.89 0-1.33 1.08-.7 1.71"
    />
  </Svg>
);
export default SvgArrowDropDown;
