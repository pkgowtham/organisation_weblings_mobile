import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgImage = (props: SvgProps) => (
  <Svg
    width={24}
    height={25}
    fill="none"
    {...props}
    viewBox="0 0 24 24"
  >
    <Path
      fill={props.color || "#000"}
      d="M19 5.5v14H5v-14zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2m-4.86 8.86-3 3.87L9 13.64 6 17.5h12z"
    />
  </Svg>
);
export default SvgImage;
