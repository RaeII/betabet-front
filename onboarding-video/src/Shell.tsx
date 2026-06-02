import type { ReactNode } from "react";
import { Img, staticFile } from "remotion";
import { colors } from "./theme";
import { ArrowLeft, IconCircle } from "./ui";

// Moon icon (theme toggle) — matches lucide's Moon used in OnboardingShell.
const Moon: React.FC = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <path
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      stroke={colors.text}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LogOut: React.FC = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <path
      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
      stroke={colors.text}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ShellProps {
  children: ReactNode;
  back?: boolean;
  step?: { current: number; total: number } | null;
  showLogout?: boolean;
  // Scroll offset (px, negative = scrolled down) applied to the content.
  scrollY?: number;
  // Vertical motion-blur amount (px) applied while scrolling.
  blur?: number;
  // Unique id so multiple Shells don't share the same SVG filter.
  filterId?: string;
}

export const Shell: React.FC<ShellProps> = ({
  children,
  back = false,
  step = null,
  showLogout = false,
  scrollY = 0,
  blur = 0,
  filterId = "vblur",
}) => {
  const useBlur = blur > 0.08;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        color: colors.text,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Vertical-only blur filter (directional motion blur on scroll) */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={filterId} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation={`0 ${blur.toFixed(2)}`} />
        </filter>
      </svg>

      {/* Header (fixed) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 22px",
          flexShrink: 0,
          zIndex: 2,
          background: "transparent",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {back ? (
            <IconCircle>
              <ArrowLeft size={16} color={colors.text} />
            </IconCircle>
          ) : (
            <>
              <Img
                src={staticFile("bolao_clt_logo.png")}
                style={{ height: 34, width: 34, objectFit: "contain" }}
              />
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>
                Bolão CLT
              </span>
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {step && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: colors.textMuted,
              }}
            >
              Passo {step.current} de {step.total}
            </span>
          )}
          <IconCircle>
            <Moon />
          </IconCircle>
          {showLogout && (
            <IconCircle>
              <LogOut />
            </IconCircle>
          )}
        </div>
      </div>

      {/* Scrollable content area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "4px 22px 40px",
            transform: `translateY(${scrollY}px)`,
            filter: useBlur ? `url(#${filterId})` : "none",
            willChange: "transform",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
