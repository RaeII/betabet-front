import { colors, radius } from "../theme";
import { ArrowLeft, PrimaryButton, SecondaryButton } from "../ui";

// Stepper field with −/+ controls and floating label (read-only visual).
const StepGlyph: React.FC<{ kind: "minus" | "plus" }> = ({ kind }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14" stroke={colors.text} strokeWidth={2} strokeLinecap="round" />
    {kind === "plus" && (
      <path d="M12 5v14" stroke={colors.text} strokeWidth={2} strokeLinecap="round" />
    )}
  </svg>
);

const NumberField: React.FC<{
  label: string;
  value: number;
  focused?: boolean;
  caretOn?: boolean;
}> = ({ label, value, focused = false, caretOn = false }) => (
  <div style={{ position: "relative", width: "100%" }}>
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        minHeight: 48,
        borderRadius: radius.md,
        overflow: "hidden",
        border: `1px solid ${focused ? colors.brand : colors.border}`,
        background: colors.surface,
        boxShadow: focused
          ? `0 0 0 2px color-mix(in srgb, ${colors.brand} 10%, transparent)`
          : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 48,
          flexShrink: 0,
          borderRight: `1px solid ${colors.border}`,
        }}
      >
        <StepGlyph kind="minus" />
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 700,
          color: colors.text,
        }}
      >
        {value}
        {focused && (
          <span
            style={{
              display: "inline-block",
              width: 1.5,
              height: 20,
              marginLeft: 1,
              background: colors.brand,
              opacity: caretOn ? 1 : 0,
            }}
          />
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 48,
          flexShrink: 0,
          borderLeft: `1px solid ${colors.border}`,
        }}
      >
        <StepGlyph kind="plus" />
      </div>
    </div>
    <label
      style={{
        position: "absolute",
        left: 12,
        top: 0,
        transform: "translateY(-50%)",
        padding: "0 4px",
        background: colors.surface,
        fontSize: 12,
        fontWeight: 500,
        color: focused ? colors.brand : colors.textMuted,
      }}
    >
      {label}
    </label>
  </div>
);

const ScenarioRow: React.FC<{
  label: string;
  bet: string;
  points: number;
  correct: boolean;
}> = ({ label, bet, points, correct }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      borderRadius: radius.md,
      background: colors.surfaceSoft,
      padding: "12px 16px",
    }}
  >
    <div style={{ minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: colors.text }}>
        {label}
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 12, color: colors.textMuted }}>
        Aposta: {bet}
      </p>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: correct ? colors.brand : colors.textMuted,
        }}
      >
        {points} pontos
      </span>
      <span>{correct ? "✅" : "❌"}</span>
    </div>
  </div>
);

const Crown: React.FC = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
    <path
      d="M2 7l4 4 6-7 6 7 4-4v11H2V7z"
      stroke={colors.brand}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </svg>
);

const Spinner: React.FC<{ rotation: number }> = ({ rotation }) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <path
      d="M21 12a9 9 0 11-6.219-8.56"
      stroke={colors.brandText}
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </svg>
);

interface ScoringScreenProps {
  reveal: number;
  resultPoints?: number;
  resultFocused?: boolean;
  caretOn?: boolean;
  createPress?: number;
  loading?: boolean;
  spinnerRotation?: number;
}

export const ScoringScreen: React.FC<ScoringScreenProps> = ({
  reveal,
  resultPoints = 1,
  resultFocused = false,
  caretOn = false,
  createPress = 0,
  loading = false,
  spinnerRotation = 0,
}) => {
  return (
    <div
      style={{
        opacity: reveal,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingTop: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: colors.textMuted,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <ArrowLeft size={14} />
          Voltar
        </span>
        <span>Passo 2 de 2</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
          Quanto vale cada aposta?
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: colors.textMuted }}>
          Configure os pontos e veja o impacto no exemplo abaixo.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <NumberField label="Acertar o placar" value={10} />
        <NumberField
          label="Acertar o vencedor"
          value={resultPoints}
          focused={resultFocused}
          caretOn={caretOn}
        />
      </div>

      {/* Scoring example */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          borderRadius: radius.xl,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          padding: 16,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: colors.textMuted,
            }}
          >
            Exemplo
          </p>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontSize: 18,
              fontWeight: 700,
              color: colors.text,
            }}
          >
            <span>🇧🇷 Brasil</span>
            <span
              style={{
                borderRadius: radius.md,
                background: colors.surfaceSoft,
                padding: "4px 12px",
                fontFamily: "monospace",
                fontSize: 20,
              }}
            >
              2 × 1
            </span>
            <span>França 🇫🇷</span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: colors.textMuted }}>
            Resultado real da partida
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ScenarioRow label="Acertou o placar exato" bet="2 × 1" points={10} correct />
          <ScenarioRow label="Acertou o vencedor" bet="1 × 0 (Brasil vence)" points={resultPoints} correct />
          <ScenarioRow label="Errou" bet="1 × 1 (empate)" points={0} correct={false} />
        </div>
      </div>

      {/* Champion fields */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          borderRadius: radius.xl,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Crown />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: colors.text }}>
                Aposta de campeão
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: colors.textMuted }}>
                Cada membro escolhe dois times para vencer a Copa.
              </p>
            </div>
          </div>
          {/* Toggle (on) */}
          <div
            style={{
              position: "relative",
              height: 24,
              width: 44,
              flexShrink: 0,
              borderRadius: 999,
              background: colors.brand,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 4,
                left: 22,
                height: 16,
                width: 16,
                borderRadius: 999,
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <NumberField label="Acertar o 1º palpite" value={25} />
          <NumberField label="Acertar o 2º palpite" value={15} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <SecondaryButton style={{ flex: 1 }}>
          <ArrowLeft size={16} color={colors.text} />
          Voltar
        </SecondaryButton>
        <PrimaryButton press={createPress} style={{ flex: 1 }}>
          {loading ? <Spinner rotation={spinnerRotation} /> : "Criar bolão"}
        </PrimaryButton>
      </div>
    </div>
  );
};
