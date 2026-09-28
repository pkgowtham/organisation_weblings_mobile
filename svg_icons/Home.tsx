import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgHome = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="m12 6.19 5 4.5v7.81h-2v-6H9v6H7v-7.81zm0-2.69-10 9h3v8h6v-6h2v6h6v-8h3z"
    />
  </Svg>
);
export default SvgHome;
