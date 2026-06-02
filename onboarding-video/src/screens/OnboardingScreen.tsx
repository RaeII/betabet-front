import { colors, radius } from "../theme";
import { Chip, ChevronRight } from "../ui";

const Card: React.FC<{
  icon: string;
  title: string;
  description: string;
  active?: boolean;
  press?: number;
}> = ({ icon, title, description, active = false, press = 0 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      borderRadius: radius.xl,
      border: `1px solid ${colors.border}`,
      background: active ? colors.surfaceSoft : colors.surface,
      padding: 20,
      transform: `scale(${1 - press * 0.025})`,
      transition: "none",
      boxShadow: active ? "0 8px 24px rgba(21,23,19,0.08)" : "none",
    }}
  >
    <span
      style={{
        display: "flex",
        height: 56,
        width: 56,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.lg,
        background: colors.surfaceSoft,
        fontSize: 30,
      }}
    >
      {icon}
    </span>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p style={{ margin: 0, fontWeight: 600, color: colors.text }}>{title}</p>
      <p style={{ margin: "2px 0 0", fontSize: 14, color: colors.textMuted }}>
        {description}
      </p>
    </div>
    <ChevronRight size={20} />
  </div>
);

interface OnboardingScreenProps {
  // 0..1 reveal animation (mimics the framer-motion section fade/slide).
  reveal: number;
  highlightCreate?: boolean;
  createPress?: number;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  reveal,
  highlightCreate = false,
  createPress = 0,
}) => {
  return (
    <div
      style={{
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 18}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 40,
        paddingTop: 24,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Chip dotColor={colors.support}>Bem-vindo</Chip>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.045em",
              color: colors.text,
            }}
          >
            Comece seu bolão da Copa.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 320,
              fontSize: 16,
              lineHeight: 1.6,
              color: colors.textMuted,
            }}
          >
            Crie um Bolão com amigos ou entre em um com o código de convite. Sem
            app extra, sem cadastro complicado.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card
          icon="🎟️"
          title="Entrar em um Bolão"
          description="Tenho um código ou link de convite"
        />
        <Card
          icon="⚽"
          title="Criar um bolão"
          description="Quero montar o meu próprio bolão"
          active={highlightCreate}
          press={createPress}
        />
      </div>

      <p
        style={{
          margin: 0,
          textAlign: "center",
          fontSize: 12,
          color: colors.textMuted,
        }}
      >
        Você pode trocar de Bolão a qualquer momento depois.
      </p>
    </div>
  );
};
