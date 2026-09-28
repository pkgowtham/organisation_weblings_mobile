import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgEdit = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <Path
      fill={props.color || "#000"}
      d="m14.059 9.02.92.92L5.919 19h-.92v-.92zm3.6-6.02c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L2.999 17.25V21h3.75l11.06-11.06z"
    />
  </Svg>
);
export default SvgEdit;
