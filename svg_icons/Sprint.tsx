import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgSprint = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="m9 21-1.425-1.4 1.6-1.6H9q-2.925 0-4.962-2.037T2 11t2.037-4.962T9 4h6q2.925 0 4.962 2.037T22 11t-2.038 4.963T15 18v-2q2.075 0 3.538-1.463T20 11t-1.462-3.537Q17.074 6 15 6H9Q6.925 6 5.463 7.463 4 8.925 4 11q0 2.074 1.463 3.563Q6.925 16.05 9 16.2h.4l-1.8-1.8L9 13l4 4z"
    />
  </Svg>
);
export default SvgSprint;
