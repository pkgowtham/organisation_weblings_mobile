import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgAddPerson = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M20.5 9a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM9 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m6.39 8.56C13.71 13.7 11.53 13 9 13s-4.71.7-6.39 1.56A2.97 2.97 0 0 0 1 17.22V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.78c0-1.12-.61-2.15-1.61-2.66M15 18H3v-.78c0-.38.2-.72.52-.88C4.71 15.73 6.63 15 9 15s4.29.73 5.48 1.34c.32.16.52.5.52.88z"
    />
  </Svg>
);
export default SvgAddPerson;
