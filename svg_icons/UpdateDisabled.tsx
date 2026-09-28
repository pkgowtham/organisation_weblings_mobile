import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgUpdateDisabled = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M21.656 12.29a8.9 8.9 0 0 1-1.33 3.79l-1.47-1.47c.38-.71.65-1.49.77-2.32zM9.386 5.13a7.06 7.06 0 0 1 3.33-.84 7.01 7.01 0 0 1 5.74 3h-2.74v2h6v-6h-2v2.36c-1.65-2.04-4.17-3.36-7-3.36-1.76 0-3.4.51-4.78 1.39zm2.33 1.16v1.17l2 2V6.29zm8.78 15.61-3-3a8.97 8.97 0 0 1-4.78 1.39 9 9 0 0 1-9-9c0-1.76.51-3.4 1.39-4.78l-3-3 1.41-1.41 18.38 18.38zm-4.46-4.46-9.48-9.48a7.06 7.06 0 0 0-.84 3.33c0 3.86 3.14 7 7 7 1.2 0 2.34-.31 3.32-.85"
    />
  </Svg>
);
export default SvgUpdateDisabled;
