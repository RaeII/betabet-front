import { Img, staticFile } from "remotion";
import { colors, radius } from "../theme";

// Team flag assets shipped in /public. Brazil & Argentina national-team crests.
export const FLAG = {
  brazil: "10_Brazil_BR.svg",
  argentina: "05_Argentina_AR.svg",
} as const;

export const TeamFlag: React.FC<{
  flag: string;
  width: number;
  height: number;
}> = ({ flag, width, height }) => (
  <div
    style={{
      display: "flex",
      width,
      height,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Img
      src={staticFile(flag)}
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain",
        borderRadius: 4,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
    />
  </div>
);

// Mirrors MatchTeamIdentity: flag above, name below, centered.
export const TeamIdentity: React.FC<{
  name: string;
  flag: string;
}> = ({ name, flag }) => (
  <div
    style={{
      display: "flex",
      minWidth: 0,
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      textAlign: "center",
    }}
  >
    <TeamFlag flag={flag} width={64} height={44} />
    <span
      style={{
        maxWidth: 130,
        fontSize: 15,
        fontWeight: 600,
        lineHeight: "16px",
        color: colors.text,
      }}
    >
      {name}
    </span>
  </div>
);

// A floating card frame: rounded surface with border + soft elevation, the
// look every component shares in the "floating components on white" treatment.
export const FloatCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  pad?: number;
  elevation?: number;
}> = ({ children, style, pad = 24, elevation = 1 }) => (
  <div
    style={{
      borderRadius: radius.xl,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      padding: pad,
      boxShadow:
        elevation > 0
          ? `0 ${10 * elevation}px ${34 * elevation}px rgba(21,23,19,${0.10 * elevation}), 0 2px 6px rgba(21,23,19,0.04)`
          : "none",
      ...style,
    }}
  >
    {children}
  </div>
);
