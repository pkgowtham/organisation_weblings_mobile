import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgTag = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
    viewBox="0 0 24 24"
  >
    <Path
      fill={props.color || "#000"}
      d="m21.408 11.413-8.83-8.83c-.37-.37-.88-.58-1.41-.58h-7.17c-1.1 0-2 .9-2 2v7.17c0 .53.21 1.04.59 1.41l8.83 8.83c.78.78 2.05.78 2.83 0l7.17-7.17c.78-.78.78-2.04-.01-2.83m-8.58 8.59-8.83-8.83v-7.17h7.17l8.83 8.83z"
    />
    <Path fill={props.color || "#000"} d="M7.998 9.503a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
  </Svg>
);
export default SvgTag;
