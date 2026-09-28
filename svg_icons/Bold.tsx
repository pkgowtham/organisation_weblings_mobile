import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgBold = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M8.5 11H13a2.5 2.5 0 0 0 0-5H8.5zm10 4.5A4.5 4.5 0 0 1 14 20H7.15a.65.65 0 0 1-.65-.65V4.65A.65.65 0 0 1 7.15 4H13a4.5 4.5 0 0 1 3.256 7.606A4.5 4.5 0 0 1 18.5 15.5M8.5 13v5H14a2.5 2.5 0 0 0 0-5z"
    />
  </Svg>
);
export default SvgBold;
