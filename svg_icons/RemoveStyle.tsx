import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgRemoveStyle = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      fillRule="evenodd"
      d="M9 5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V6h-5.117l-.266 2.124a1 1 0 1 1-1.984-.248L11.867 6H10a1 1 0 0 1-1-1m-4.743-.169a1 1 0 0 1 1.412-.074l15 13.5a1 1 0 1 1-1.338 1.486l-6.554-5.898-.785 6.279a1 1 0 1 1-1.984-.248l.957-7.662-6.634-5.97a1 1 0 0 1-.074-1.413"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgRemoveStyle;
