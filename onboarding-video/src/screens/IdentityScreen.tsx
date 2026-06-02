import { colors, radius } from "../theme";
import { ArrowLeft, PrimaryButton, ChevronRight } from "../ui";

const EMOJI_OPTIONS = ["⚽", "🏆", "🎯", "🔥", "🏅", "🥇", "🎲", "👑"];

const Upload: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <path
      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
      stroke={colors.brand}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Floating-label input mirroring src/components/ui/input.tsx.
const NameInput: React.FC<{
  value: string;
  focused: boolean;
  caretOn: boolean;
}> = ({ value, focused, caretOn }) => {
  const floated = focused || value.length > 0;
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          minHeight: 48,
          width: "100%",
          borderRadius: radius.md,
          border: `1px solid ${focused ? colors.brand : colors.border}`,
          background: colors.surface,
          padding: "0 16px",
          fontSize: 14,
          color: colors.text,
          boxShadow: focused
            ? `0 0 0 2px color-mix(in srgb, ${colors.brand} 10%, transparent)`
            : "none",
        }}
      >
        <span>{value}</span>
        {focused && (
          <span
            style={{
              display: "inline-block",
              width: 1.5,
              height: 18,
              marginLeft: 1,
              background: colors.text,
              opacity: caretOn ? 1 : 0,
            }}
          />
        )}
      </div>
      <label
        style={{
          position: "absolute",
          left: 12,
          top: floated ? 0 : "50%",
          transform: "translateY(-50%)",
          padding: "0 4px",
          background: colors.surface,
          fontSize: floated ? 12 : 14,
          fontWeight: 500,
          color: focused ? colors.brand : colors.textMuted,
        }}
      >
        Nome do bolão
      </label>
    </div>
  );
};

interface IdentityScreenProps {
  name: string;
  inputFocused: boolean;
  caretOn: boolean;
  selectedEmoji: string | null;
  nextPress?: number;
}

export const IdentityScreen: React.FC<IdentityScreenProps> = ({
  name,
  inputFocused,
  caretOn,
  selectedEmoji,
  nextPress = 0,
}) => {
  const displayName = name.trim() || "Meu Bolão";
  const displayEmoji = selectedEmoji ?? "⚽";
  const nextEnabled = name.trim().length >= 3;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingTop: 18 }}>
      {/* Modal top row: Voltar | Passo 1 de 2 */}
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
        <span>Passo 1 de 2</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
          Como vai chamar o bolão?
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: colors.textMuted }}>
          Escolha um nome e uma identidade visual.
        </p>
      </div>

      <NameInput value={name} focused={inputFocused} caretOn={caretOn} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: colors.text }}>
          Emoji ou imagem
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 10,
          }}
        >
          {EMOJI_OPTIONS.map((e) => {
            const active = selectedEmoji === e;
            return (
              <div
                key={e}
                style={{
                  display: "flex",
                  height: 46,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: radius.md,
                  fontSize: 22,
                  background: active ? colors.brand : colors.surfaceSoft,
                }}
              >
                {e}
              </div>
            );
          })}
        </div>
        <div style={{ paddingTop: 12 }}>
          <div
            style={{
              display: "inline-flex",
              minHeight: 48,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: radius.pill,
              border: `1px solid ${colors.brand}`,
              background: colors.surface,
              color: colors.brand,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <Upload />
            Escolher imagem do bolão
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        style={{
          borderRadius: radius.xl,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          padding: 16,
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: colors.textMuted,
          }}
        >
          Prévia
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              height: 48,
              width: 48,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: radius.lg,
              background: colors.surfaceSoft,
              fontSize: 24,
            }}
          >
            {displayEmoji}
          </div>
          <p style={{ margin: 0, fontWeight: 600, color: colors.text }}>
            {displayName}
          </p>
        </div>
      </div>

      <PrimaryButton press={nextPress} style={{ opacity: nextEnabled ? 1 : 0.5 }}>
        Próximo <ChevronRight size={16} color={colors.brandText} />
      </PrimaryButton>

      <div style={{ height: 32 }} />
    </div>
  );
};
