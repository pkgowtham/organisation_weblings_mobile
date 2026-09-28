import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgCheckboxFilled = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14zm-1.715-9.295A1 1 0 1 0 15.87 8.29l-5.88 5.88-1.875-1.867a1 1 0 0 0-1.413 1.417l2.58 2.575a1 1 0 0 0 1.414-.001z"
    />
  </Svg>
);
export default SvgCheckboxFilled;
