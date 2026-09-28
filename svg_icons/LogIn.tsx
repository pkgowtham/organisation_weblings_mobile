import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgLogIn = (props: SvgProps) => (
  <Svg
    width={32}
    height={33}
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.667}
      d="M20 4.611h5.333A2.667 2.667 0 0 1 28 7.278v18.667a2.667 2.667 0 0 1-2.667 2.666H20m-6.667-5.333L20 16.611m0 0-6.667-6.666M20 16.61H4"
    />
  </Svg>
);
export default SvgLogIn;
