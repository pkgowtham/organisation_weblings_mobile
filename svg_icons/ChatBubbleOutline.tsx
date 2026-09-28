import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgChatBubbleOutline = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
    viewBox="0 0 24 24"
  >
    <Path
      fill={props.color || "#000"}
      d="M20 4.703v12H5.17L4 17.873V4.703zm0-2H4c-1.1 0-2 .9-2 2v15.59c0 .89 1.08 1.34 1.71.71l2.29-2.3h14c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2"
    />
  </Svg>
);
export default SvgChatBubbleOutline;
