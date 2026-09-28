import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgPalette = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0 1 12 22m0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 0 1 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7"
    />
    <Path
      fill={props.color || "#000"}
      d="M6.5 13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M9.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M14.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M17.5 13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
    />
  </Svg>
);
export default SvgPalette;
