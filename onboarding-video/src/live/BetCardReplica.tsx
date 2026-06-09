import { colors, radius } from "../theme";
import { CheckCircle, ChevronRight, Minus, Plus } from "./icons";
import { FLAG, FloatCard, TeamIdentity } from "./parts";

const ScoreBox: React.FC<{ value: string; focused?: boolean }> = ({
  value,
  focused = false,
}) => (
  <div
    style={{
      display: "flex",
      height: 52,
      width: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      border: `1px solid ${focused ? colors.brand : colors.border}`,
      background: colors.surface,
      fontSize: 20,
      fontWeight: 700,
      fontVariantNumeric: "tabular-nums",
      color: value === "" ? colors.textMuted : colors.text,
      boxShadow: focused
        ? `0 0 0 2px color-mix(in srgb, ${colors.brand} 14%, transparent)`
        : "none",
    }}
  >
    {value === "" ? "–" : value}
  </div>
);

const Stepper: React.FC<{ kind: "minus" | "plus"; press?: number }> = ({
  kind,
  press = 0,
}) => (
  <div
    style={{
      display: "flex",
      height: 34,
      width: 34,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      border: `1px solid ${press > 0 ? colors.brand : colors.border}`,
      background: press > 0 ? colors.surface : colors.surfaceSoft,
      color: press > 0 ? colors.brand : colors.textMuted,
      transform: `scale(${1 - press * 0.08})`,
    }}
  >
    {kind === "plus" ? (
      <Plus size={16} color={press > 0 ? colors.brand : colors.textMuted} />
    ) : (
      <Minus size={16} color={colors.textMuted} />
    )}
  </div>
);

interface BetCardReplicaProps {
  home: string;
  away: string;
  homePlusPress?: number;
  showSave?: boolean;
  savePress?: number;
  showSaved?: boolean;
  width?: number;
}

// Faithful recreation of src/pages/home/components/InlineBetCard.tsx, styled
// with the shared design tokens. Brazil (home) × Argentina (away).
export const BetCardReplica: React.FC<BetCardReplicaProps> = ({
  home,
  away,
  homePlusPress = 0,
  showSave = false,
  savePress = 0,
  showSaved = false,
  width = 600,
}) => {
  return (
    <FloatCard pad={28} style={{ width }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13,
            fontWeight: 600,
            color: colors.brand,
          }}
        >
          <span style={{ fontVariantNumeric: "tabular-nums" }}>Hoje, 21:30</span>
          <span style={{ color: colors.textMuted, fontWeight: 500 }}>
            Maracanã
          </span>
        </div>

        {/* teams + score */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: 18,
          }}
        >
          <TeamIdentity name="Brasil" flag={FLAG.brazil} />

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Stepper kind="minus" />
              <ScoreBox value={home} focused={homePlusPress > 0} />
              <Stepper kind="plus" press={homePlusPress} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: colors.textMuted }}>
              ×
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Stepper kind="minus" />
              <ScoreBox value={away} />
              <Stepper kind="plus" />
            </div>
          </div>

          <TeamIdentity name="Argentina" flag={FLAG.argentina} />
        </div>

        {/* footer */}
        <div
          style={{
            position: "relative",
            display: "flex",
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* replicate toggle (left) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                position: "relative",
                height: 20,
                width: 36,
                borderRadius: 999,
                background: colors.brand,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: 18,
                  height: 14,
                  width: 14,
                  borderRadius: 999,
                  background: "#fff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              />
            </div>
            <span
              style={{
                maxWidth: 128,
                fontSize: 10,
                lineHeight: 1.2,
                color: colors.textMuted,
              }}
            >
              Replicando para todos os bolões
            </span>
          </div>

          {/* center action */}
          <div
            style={{
              position: "relative",
              display: "flex",
              minHeight: 40,
              width: 168,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                position: "absolute",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                fontWeight: 600,
                color: colors.brand,
                opacity: showSave || showSaved ? 0 : 1,
              }}
            >
              Fique por dentro
              <ChevronRight size={15} color={colors.brand} />
            </span>

            <span
              style={{
                position: "absolute",
                color: "#16a34a",
                transform: `translateY(${showSaved ? 0 : 4}px)`,
                opacity: showSaved ? 1 : 0,
              }}
            >
              <CheckCircle size={22} color="#16a34a" />
            </span>

            <div
              style={{
                display: "inline-flex",
                minHeight: 44,
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radius.pill,
                fontSize: 14,
                fontWeight: 700,
                background: colors.brand,
                color: colors.brandText,
                transform: `translateY(${showSave ? 0 : 4}px) scale(${1 - savePress * 0.04})`,
                opacity: showSave ? 1 : 0,
                boxShadow:
                  savePress > 0 ? "0 4px 14px rgba(18,61,42,0.35)" : "none",
              }}
            >
              Salvar palpite
            </div>
          </div>

          {/* palpites button (right) */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              display: "inline-flex",
              minHeight: 32,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: `1px solid ${colors.border}`,
              padding: "0 14px",
              fontSize: 12,
              fontWeight: 600,
              color: colors.textMuted,
            }}
          >
            palpites
          </div>
        </div>
      </div>
    </FloatCard>
  );
};
