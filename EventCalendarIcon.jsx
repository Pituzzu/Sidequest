import Svg, { Circle, Path } from 'react-native-svg';

export default function EventCalendarIcon({ color = '#FFFFFF', height = 27, width = 27 }) {
  return (
    <Svg height={height} viewBox="0 0 27 27" width={width}>
      <Path
        d="M5.25 2.25H3.9A2.9 2.9 0 0 0 1 5.15V23.1A2.9 2.9 0 0 0 3.9 26H23.1a2.9 2.9 0 0 0 2.9-2.9V5.15a2.9 2.9 0 0 0-2.9-2.9h-1.35M6.5 1v3.5M20.5 1v3.5M6.5 2.25h14M1 8h25"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Circle cx={6.5} cy={12} fill={color} r={1.35} />
      <Circle cx={13.5} cy={12} fill={color} r={1.35} />
      <Circle cx={20.5} cy={12} fill={color} r={1.35} />
      <Circle cx={6.5} cy={18} fill={color} r={1.35} />
      <Circle cx={13.5} cy={18} fill={color} r={1.35} />
      <Circle cx={20.5} cy={18} fill={color} r={1.35} />
      <Circle cx={6.5} cy={23} fill={color} r={1.35} />
      <Circle cx={13.5} cy={23} fill={color} r={1.35} />
    </Svg>
  );
}
