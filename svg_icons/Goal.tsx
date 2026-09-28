import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgGoal = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 13V2l8 4-8 4m8.562.222a9 9 0 1 1-12.55-5.29m-.01 5.065a5 5 0 1 0 8.9 2.02"
    />
  </Svg>
);
export default SvgGoal;
