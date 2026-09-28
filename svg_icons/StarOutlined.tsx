import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgStarOutlined = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="m22 9.74-7.19-.62L12 2.5 9.19 9.13 2 9.74l5.46 4.73-1.64 7.03L12 17.77l6.18 3.73-1.63-7.03zM12 15.9l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.6l1.71 4.04 4.38.38-3.32 2.88 1 4.28z"
    />
  </Svg>
);
export default SvgStarOutlined;
