import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgRouteAltLeftStreamlineTabler = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke={props.color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.5 3h-5v5M16.5 3h5v5"
    />
    <Path
      stroke={props.color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m3.5 3 7.536 7.536A5 5 0 0 1 12.5 14.07V21M18.5 6.01V6M16.5 8.02v-.01M14.5 10v.01"
    />
  </Svg>
);
export default SvgRouteAltLeftStreamlineTabler;
