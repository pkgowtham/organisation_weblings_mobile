import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgArrowBackIos = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
    viewBox="0 0 24 24"
  >
    <Path
      fill={props.color || "#000"}
      d="m17.835 3.87-1.78-1.77-9.89 9.9 9.9 9.9 1.77-1.77L9.705 12z"
    />
  </Svg>
);
export default SvgArrowBackIos;
