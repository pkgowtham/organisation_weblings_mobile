import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgCircleCheck = (props: SvgProps) => (
  <Svg
    width={56}
    height={57}
    fill="none"
    {...props}
    viewBox="0 0 56 57"
  >
    <Path
      stroke={props.color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4.667}
      d="m21 28.612 4.666 4.666L35 23.945m16.333 4.667c0 12.886-10.446 23.333-23.333 23.333S4.667 41.498 4.667 28.612C4.666 15.725 15.112 5.278 28 5.278s23.333 10.447 23.333 23.334"
    />
  </Svg>
);
export default SvgCircleCheck;
