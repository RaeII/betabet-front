import { colors } from "../theme";

// Minimal lucide-style icon set, recreated inline so the floating component
// replicas match the real app (which uses lucide-react) 1:1.

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const base = (size: number): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
});

export const Plus: React.FC<IconProps> = ({ size = 16, color = colors.textMuted, strokeWidth = 2 }) => (
  <svg {...base(size)}>
    <path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const Minus: React.FC<IconProps> = ({ size = 16, color = colors.textMuted, strokeWidth = 2 }) => (
  <svg {...base(size)}>
    <path d="M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const ChevronRight: React.FC<IconProps> = ({ size = 16, color = colors.textMuted, strokeWidth = 2 }) => (
  <svg {...base(size)}>
    <path d="M9 6l6 6-6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckCircle: React.FC<IconProps> = ({ size = 20, color = colors.brand, strokeWidth = 2 }) => (
  <svg {...base(size)}>
    <circle cx={12} cy={12} r={10} stroke={color} strokeWidth={strokeWidth} />
    <path d="M8 12.5l2.5 2.5L16 9.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Trophy: React.FC<IconProps> = ({ size = 16, color = colors.brand, strokeWidth = 2 }) => (
  <svg {...base(size)}>
    <path
      d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M6 4h12v5a6 6 0 01-12 0V4zM9 18h6M10 22h4M12 15v3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TrendingUp: React.FC<IconProps> = ({ size = 12, color = "#16a34a", strokeWidth = 2.4 }) => (
  <svg {...base(size)}>
    <path d="M3 17l6-6 4 4 7-7M17 8h4v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
