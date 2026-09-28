import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgMoreTime = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path fill={props.color || "#000"} d="M9.5 8v6l4.7 2.9.8-1.2-4-2.4V8z" />
    <Path
      fill={props.color || "#000"}
      d="M17.42 12a6.957 6.957 0 0 1-6.92 8c-3.9 0-7-3.1-7-7s3.1-7 7-7c.7 0 1.37.1 2 .29V4.23c-.64-.15-1.31-.23-2-.23-5 0-9 4-9 9s4 9 9 9a8.963 8.963 0 0 0 8.94-10z"
    />
    <Path fill={props.color || "#000"} d="M19.5 5V2h-2v3h-3v2h3v3h2V7h3V5z" />
  </Svg>
);
export default SvgMoreTime;
