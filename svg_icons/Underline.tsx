import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgUnderline = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M8.5 4a1 1 0 0 0-2 0v7c0 3.866 1 7 6 7s6-3.134 6-7V4a1 1 0 1 0-2 0v7c0 2.761 0 5-4 5s-4-2.239-4-5zM6.5 19a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2z"
    />
  </Svg>
);
export default SvgUnderline;
