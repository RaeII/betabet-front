import { colors, radius } from "../theme";
import { ChevronRight, TrendingUp } from "./icons";
import { FloatCard } from "./parts";

export interface RankRow {
  key: string;
  name: string;
  isMe: boolean;
  // Whole-number points to display (already animated by the scene).
  points: number;
  // Live delta to show as a green "+N" badge (0 = hidden).
  livePoints: number;
  // Animated vertical slot position in px (0 = top row).
  y: number;
  // Rank number to print in the "#" column (already animated/rounded).
  rank: number;
  // Show the "moved up" trend arrow.
  movedUp: boolean;
}

export const ROW_H = 66;

const Avatar: React.FC<{ name: string; isMe: boolean }> = ({ name, isMe }) => (
  <div
    style={{
      display: "flex",
      height: 34,
      width: 34,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      background: isMe ? colors.brand : colors.surfaceSoft,
      fontSize: 13,
      fontWeight: 700,
      color: isMe ? colors.brandText : colors.brand,
    }}
  >
    {name.charAt(0).toUpperCase()}
  </div>
);

interface RankingReplicaProps {
  rows: RankRow[];
  liveDelta: number;
  width?: number;
}

// Recreation of src/pages/group-detail/components/GroupRanking.tsx with the
// live overlay banner and animated row reordering.
export const RankingReplica: React.FC<RankingReplicaProps> = ({
  rows,
  liveDelta,
  width = 600,
}) => {
  const cols = "56px 1fr 96px";

  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* live banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderRadius: radius.md,
          border: "1px solid rgba(234,179,8,0.30)",
          background: "rgba(234,179,8,0.10)",
          padding: "12px 16px",
          fontSize: 13,
          fontWeight: 500,
          color: "#a16207",
        }}
      >
        <span
          style={{
            display: "inline-block",
            height: 9,
            width: 9,
            flexShrink: 0,
            borderRadius: 999,
            background: "#eab308",
          }}
        />
        Ranking ao vivo — você está ganhando{" "}
        <span style={{ fontWeight: 700 }}>+{liveDelta} pts</span> na partida em
        andamento.
      </div>

      <FloatCard pad={0} style={{ overflow: "hidden" }}>
        {/* head */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: cols,
            alignItems: "center",
            gap: 0,
            padding: "14px 20px",
            borderBottom: `1px solid ${colors.border}`,
            background: colors.surfaceSoft,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: colors.textMuted,
          }}
        >
          <span>#</span>
          <span>Jogador</span>
          <span style={{ textAlign: "right" }}>Pts</span>
        </div>

        {/* body — rows absolutely positioned for smooth FLIP reordering */}
        <div style={{ position: "relative", height: rows.length * ROW_H }}>
          {rows.map((row) => (
            <div
              key={row.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: ROW_H,
                transform: `translateY(${row.y}px)`,
                display: "grid",
                gridTemplateColumns: cols,
                alignItems: "center",
                padding: "0 20px",
                background: row.isMe
                  ? "color-mix(in srgb, #123d2a 6%, transparent)"
                  : colors.surface,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.brand,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {row.rank}°
                {row.movedUp ? <TrendingUp size={13} /> : null}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <Avatar name={row.name} isMe={row.isMe} />
                <span style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>
                  {row.name}
                  {row.isMe ? (
                    <span style={{ marginLeft: 6, fontSize: 12, color: colors.textMuted }}>
                      (você)
                    </span>
                  ) : null}
                </span>
              </div>

              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 5,
                  fontSize: 15,
                  fontWeight: 700,
                  color: colors.text,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {row.points}
                {row.livePoints > 0 ? (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>
                    +{row.livePoints}
                  </span>
                ) : null}
                <ChevronRight size={15} color={colors.textMuted} />
              </span>
            </div>
          ))}
        </div>
      </FloatCard>
    </div>
  );
};
