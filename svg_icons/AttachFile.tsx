import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgAttachFile = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
    viewBox="0 0 24 24"
  >
    <Path
      fill={props.color || "#000"}
      d="M16 6.747v10.58c0 2.09-1.53 3.95-3.61 4.15A3.993 3.993 0 0 1 8 17.497V5.137c0-1.31.94-2.5 2.24-2.63A2.5 2.5 0 0 1 13 4.997v10.5c0 .55-.45 1-1 1s-1-.45-1-1v-8.75c0-.41-.34-.75-.75-.75s-.75.34-.75.75v8.61c0 1.31.94 2.5 2.24 2.63a2.5 2.5 0 0 0 2.76-2.49V5.167c0-2.09-1.53-3.95-3.61-4.15a4 4 0 0 0-4.39 3.98v12.27c0 2.87 2.1 5.44 4.96 5.71 3.29.3 6.04-2.26 6.04-5.48V6.747c0-.41-.34-.75-.75-.75s-.75.34-.75.75"
    />
  </Svg>
);
export default SvgAttachFile;
