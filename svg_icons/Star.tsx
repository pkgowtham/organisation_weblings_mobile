import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgStar = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="m12 17.77 6.18 3.73-1.64-7.03L22 9.74l-7.19-.61L12 2.5 9.19 9.13 2 9.74l5.46 4.73-1.64 7.03z"
    />
  </Svg>
);
export default SvgStar;
