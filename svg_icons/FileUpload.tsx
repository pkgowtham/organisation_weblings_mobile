import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgFileUpload = (props: SvgProps) => (
  <Svg
    width={24}
    height={25}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M19 15.5a1 1 0 0 0-1 1v2H6v-2a1 1 0 1 0-2 0v2c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2a1 1 0 0 0-1-1M7.706 8.794a.998.998 0 0 0 1.41 1.413L11 8.33v7.17a1 1 0 1 0 2 0V8.33l1.884 1.877a.998.998 0 0 0 1.41-1.413l-3.587-3.587a1 1 0 0 0-1.414 0z"
    />
  </Svg>
);
export default SvgFileUpload;
