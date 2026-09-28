import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgEye = (props: SvgProps) => (
  <Svg
    width={18}
    height={19}
    fill="none"
    {...props}
    viewBox="0 0 18 19"
  >
    <Path
      fill={props.color || "#000"}
      d="M9 5.486a7.33 7.33 0 0 1 6.615 4.125A7.32 7.32 0 0 1 9 13.736a7.32 7.32 0 0 1-6.615-4.125A7.33 7.33 0 0 1 9 5.486m0-1.5c-3.75 0-6.953 2.333-8.25 5.625 1.297 3.293 4.5 5.625 8.25 5.625s6.953-2.332 8.25-5.625C15.953 6.32 12.75 3.986 9 3.986m0 3.75a1.876 1.876 0 1 1-.001 3.752A1.876 1.876 0 0 1 9 7.736m0-1.5a3.38 3.38 0 0 0-3.375 3.375A3.38 3.38 0 0 0 9 12.986a3.38 3.38 0 0 0 3.375-3.375A3.38 3.38 0 0 0 9 6.236"
    />
  </Svg>
);
export default SvgEye;
