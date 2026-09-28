import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgRedo = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M16.5 8h-4a6 6 0 1 0 0 12h3a1 1 0 1 1 0 2h-3a8 8 0 0 1 0-16h4V3.388a.65.65 0 0 1 1.066-.5l4.335 3.613a.65.65 0 0 1 0 .998l-4.335 3.613a.65.65 0 0 1-1.066-.5z"
    />
  </Svg>
);
export default SvgRedo;
