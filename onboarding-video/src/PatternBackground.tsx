import { AbsoluteFill } from "remotion";
import { colors } from "./theme";

// Subtle geometric "Brasil Essencial" pattern (Athos Bulcão inspired modular
// shapes). Recreated as an inline SVG tile because the app's PNG asset isn't
// part of this video project.
const TILE = 110;

export const PatternBackground: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <AbsoluteFill style={{ opacity: 0.05 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="brasil-tile"
              width={TILE}
              height={TILE}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M0 0 L${TILE / 2} 0 L0 ${TILE / 2} Z`}
                fill={colors.brand}
              />
              <path
                d={`M${TILE} ${TILE} L${TILE / 2} ${TILE} L${TILE} ${TILE / 2} Z`}
                fill={colors.support}
              />
              <circle cx={TILE / 2} cy={TILE / 2} r={6} fill={colors.brand} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#brasil-tile)" />
        </svg>
      </AbsoluteFill>
      {/* Veil to keep the pattern behind the content hierarchy. */}
      <AbsoluteFill style={{ background: "rgba(245, 243, 238, 0.82)" }} />
    </AbsoluteFill>
  );
};
