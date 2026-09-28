import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgClient = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      stroke={props.color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m11 17 2 2a2.12 2.12 0 1 0 3-3m-2-2 2.5 2.5a2.121 2.121 0 0 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a2.121 2.121 0 0 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4m0-1 1 11h-2M3 3 2 14l6.5 6.5a2.121 2.121 0 0 0 3-3M3 4h8"
    />
  </Svg>
);
export default SvgClient;
