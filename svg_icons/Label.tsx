import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgLabel = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M17.13 5.84c-.36-.51-.96-.84-1.63-.84l-11 .01c-1.1 0-2 .89-2 1.99v10c0 1.1.9 1.99 2 1.99l11 .01c.67 0 1.27-.33 1.63-.84L21.5 12zM15.5 17h-11V7h11l3.55 5z"
    />
  </Svg>
);
export default SvgLabel;
