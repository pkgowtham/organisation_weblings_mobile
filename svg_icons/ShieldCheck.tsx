import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgShieldCheck = (props: SvgProps) => (
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
      d="m12 16.611 2.666 2.667L20 13.945m6.666 4c0 6.666-4.666 10-10.213 11.933-.29.098-.606.094-.893-.013C10 27.945 5.333 24.61 5.333 17.945V8.61a1.333 1.333 0 0 1 1.333-1.333c2.667 0 6-1.6 8.32-3.627a1.56 1.56 0 0 1 2.027 0c2.333 2.04 5.653 3.627 8.32 3.627a1.333 1.333 0 0 1 1.333 1.333z"
    />
  </Svg>
);
export default SvgShieldCheck;
