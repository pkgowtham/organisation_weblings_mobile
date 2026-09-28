import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgIndentLeft = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M3.5 5a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2h-16a1 1 0 0 1-1-1m0 15a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2h-16a1 1 0 0 1-1-1m8-5a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1m0-5a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1m-7.44 2.99a.65.65 0 0 1 0-.98l2.362-2.067a.65.65 0 0 1 1.078.49v4.135a.65.65 0 0 1-1.078.489z"
    />
  </Svg>
);
export default SvgIndentLeft;
