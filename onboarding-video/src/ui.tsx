import type { ReactNode } from "react";
import { colors, radius } from "./theme";

// Small pill badge ("Bem-vindo", "Aguardando aprovação"...).
export const Chip: React.FC<{ dotColor: string; children: ReactNode }> = ({
  dotColor,
  children,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      borderRadius: radius.pill,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      padding: "6px 12px",
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.18em",
      color: colors.textMuted,
    }}
  >
    <span
      style={{ height: 6, width: 24, borderRadius: 999, background: dotColor }}
    />
    {children}
  </span>
);

// Primary CTA button (filled brand).
export const PrimaryButton: React.FC<{
  children: ReactNode;
  press?: number;
  style?: React.CSSProperties;
}> = ({ children, press = 0, style }) => (
  <div
    style={{
      display: "inline-flex",
      minHeight: 48,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: radius.pill,
      padding: "0 24px",
      fontSize: 14,
      fontWeight: 700,
      background: colors.brand,
      color: colors.brandText,
      transform: `scale(${1 - press * 0.03})`,
      boxShadow: press > 0 ? "0 2px 10px rgba(18,61,42,0.35)" : "none",
      ...style,
    }}
  >
    {children}
  </div>
);

export const SecondaryButton: React.FC<{
  children: ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      display: "inline-flex",
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: radius.pill,
      padding: "0 24px",
      fontSize: 14,
      fontWeight: 700,
      border: `1px solid ${colors.border}`,
      background: "transparent",
      color: colors.text,
      ...style,
    }}
  >
    {children}
  </div>
);

export const ChevronRight: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = colors.textMuted,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M9 6l6 6-6 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ArrowLeft: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = colors.textMuted,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconCircle: React.FC<{ children: ReactNode }> = ({ children }) => (
  <span
    style={{
      display: "inline-flex",
      height: 36,
      width: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      color: colors.text,
    }}
  >
    {children}
  </span>
);
