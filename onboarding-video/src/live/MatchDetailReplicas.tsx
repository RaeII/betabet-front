import { colors } from "../theme";
import { Trophy } from "./icons";
import { FLAG, FloatCard, TeamFlag } from "./parts";

const ScoreTeam: React.FC<{ name: string; flag: string }> = ({ name, flag }) => (
  <div
    style={{
      display: "flex",
      height: 84,
      minWidth: 0,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 8,
    }}
  >
    <TeamFlag flag={flag} width={68} height={50} />
    <span
      style={{
        fontSize: 14,
        fontWeight: 600,
        lineHeight: "16px",
        color: colors.text,
        textAlign: "center",
      }}
    >
      {name}
    </span>
  </div>
);

interface LiveScoreboardReplicaProps {
  homeScore: number;
  awayScore: number;
  clock: string;
  statusLabel?: string;
  homeGoals?: string[];
  // 0..1 pop applied to the score digits when a goal lands.
  scorePop?: number;
  width?: number;
}

// Recreation of src/pages/match-detail/components/LiveScoreboard.tsx.
export const LiveScoreboardReplica: React.FC<LiveScoreboardReplicaProps> = ({
  homeScore,
  awayScore,
  clock,
  statusLabel = "2º tempo",
  homeGoals = [],
  scorePop = 0,
  width = 560,
}) => {
  return (
    <FloatCard pad={26} style={{ width }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: colors.textMuted,
          }}
        >
          <span
            style={{
              display: "inline-block",
              height: 9,
              width: 9,
              borderRadius: 999,
              background: "#ef4444",
            }}
          />
          {statusLabel}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <ScoreTeam name="Brasil" flag={FLAG.brazil} />

          <div
            style={{
              display: "flex",
              height: 84,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                fontSize: 46,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
                color: colors.text,
                transform: `scale(${1 + scorePop * 0.12})`,
              }}
            >
              <span>{homeScore}</span>
              <span style={{ color: colors.textMuted }}>×</span>
              <span>{awayScore}</span>
            </div>
            <span
              style={{
                borderRadius: 999,
                background: "rgba(16,185,129,0.15)",
                padding: "2px 10px",
                fontSize: 12,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color: "#059669",
              }}
            >
              {clock}
            </span>
          </div>

          <ScoreTeam name="Argentina" flag={FLAG.argentina} />
        </div>

        {homeGoals.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              textAlign: "center",
              fontSize: 12,
              color: colors.textMuted,
            }}
          >
            {homeGoals.map((g, i) => (
              <span key={i}>⚽ {g}</span>
            ))}
          </div>
        ) : null}
      </div>
    </FloatCard>
  );
};

const Chip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      borderRadius: 999,
      background: colors.surfaceSoft,
      padding: "5px 12px",
      fontSize: 13,
      fontWeight: 500,
      color: colors.text,
    }}
  >
    {label}
    <span style={{ fontWeight: 700, color: colors.brand }}>{value}</span>
  </span>
);

interface MatchPointsCardReplicaProps {
  // Animated total points won in this match.
  points: number;
  bet?: string;
  totalBefore: number;
  totalWith: number;
  showResultChip?: boolean;
  showExactChip?: boolean;
  resultPoints?: number;
  exactPoints?: number;
  // 0..1 pop applied to the big number on a points change.
  pointsPop?: number;
  width?: number;
}

// Recreation of src/pages/match-detail/components/MatchPointsCard.tsx (live state).
export const MatchPointsCardReplica: React.FC<MatchPointsCardReplicaProps> = ({
  points,
  bet = "4 × 0",
  totalBefore,
  totalWith,
  showResultChip = true,
  showExactChip = false,
  resultPoints = 5,
  exactPoints = 10,
  pointsPop = 0,
  width = 560,
}) => {
  return (
    <FloatCard pad={26} style={{ width }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy size={18} color={colors.brand} />
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: colors.text,
              }}
            >
              Pontos com a partida
            </h3>
          </div>
          <span
            style={{
              display: "inline-flex",
              flexShrink: 0,
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid rgba(234,179,8,0.30)",
              background: "rgba(234,179,8,0.10)",
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#ca8a04",
            }}
          >
            Pontos ao vivo
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 46,
                fontWeight: 700,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                color: colors.brand,
                transform: `scale(${1 + pointsPop * 0.16})`,
                transformOrigin: "left center",
              }}
            >
              +{points}
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 18,
                  fontWeight: 600,
                  color: colors.textMuted,
                }}
              >
                pts
              </span>
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: colors.textMuted }}>
              ganhando agora
            </p>
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            <p style={{ margin: 0 }}>
              Palpite{" "}
              <span style={{ fontWeight: 700, color: colors.text }}>{bet}</span>
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, minHeight: 30 }}>
          {showResultChip ? (
            <Chip label="Resultado" value={`+${resultPoints}`} />
          ) : null}
          {showExactChip ? (
            <Chip label="Placar exato" value={`+${exactPoints}`} />
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${colors.border}`,
            paddingTop: 14,
            fontSize: 13,
          }}
        >
          <span style={{ color: colors.textMuted }}>Total no Bolão</span>
          <span
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span style={{ color: colors.textMuted }}>{totalBefore} →</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>
              {totalWith} pts
            </span>
          </span>
        </div>
      </div>
    </FloatCard>
  );
};
