import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgDelete = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M16 9v10H8V9zm-1.354-5.854A.5.5 0 0 0 14.293 3H9.707a.5.5 0 0 0-.353.146L8.5 4h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-3zM18 7.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5V19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2z"
    />
  </Svg>
);
export default SvgDelete;
