import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgLayers = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="m11.99 19.005-7.37-5.73L3 14.535l9 7 9-7-1.63-1.27zm.01-2.54 7.36-5.73L21 9.465l-9-7-9 7 1.63 1.27zm0-11.47 5.74 4.47-5.74 4.47-5.74-4.47z"
    />
  </Svg>
);
export default SvgLayers;
