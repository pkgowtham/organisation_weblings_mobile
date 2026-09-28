import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgArrowForwardIos = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
    viewBox="0 0 24 24"
  >
    <Path
      fill={props.color || "#000"}
      d="M6.115 20.23 7.885 22l10-10-10-10-1.77 1.77 8.23 8.23z"
    />
  </Svg>
);
export default SvgArrowForwardIos;
