import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgItalic = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      fillRule="evenodd"
      d="M9.5 5a1 1 0 0 1 1-1h9a1 1 0 1 1 0 2h-3.765L11.36 18h3.14a1 1 0 1 1 0 2h-9a1 1 0 1 1 0-2h3.765L13.64 6H10.5a1 1 0 0 1-1-1"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgItalic;
