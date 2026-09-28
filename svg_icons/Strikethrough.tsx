import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgStrikethrough = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#000"}
      d="M17.654 14q.346.774.346 1.72 0 2.014-1.571 3.147Q14.856 20 12.086 20q-2.179 0-4.32-.898a.91.91 0 0 1-.55-.85c0-.734.803-1.201 1.488-.938a8.8 8.8 0 0 0 3.178.602q3.826 0 3.839-2.197a2.2 2.2 0 0 0-.648-1.603l-.12-.117H4.5a1 1 0 1 1 0-2h16a1 1 0 1 1 0 2zm-4.134-3.02c.01.004.008.02-.004.02H8.133l-.007-.003a4 4 0 0 1-.478-.519Q7 9.642 7 8.452q0-1.854 1.397-3.153Q9.796 4 12.722 4q1.923 0 3.701.747c.323.136.521.459.521.809 0 .704-.772 1.157-1.44.938a8 8 0 0 0-2.506-.388q-3.72 0-3.719 2.346 0 .63.654 1.099c.436.313 1.613.75 1.613.75z"
    />
  </Svg>
);
export default SvgStrikethrough;
