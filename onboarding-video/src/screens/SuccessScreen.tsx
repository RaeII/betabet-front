import { colors, radius } from "../theme";

interface SuccessScreenProps {
  reveal: number; // 0..1 entrance
  checkScale: number; // spring-driven check pop
  name: string;
  emoji: string;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  reveal,
  checkScale,
  name,
  emoji,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: "0 40px",
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 16}px)`,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          height: 120,
          width: 120,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          background: colors.brand,
          transform: `scale(${checkScale})`,
        }}
      >
        <svg width={56} height={56} viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke={colors.brandText}
            strokeWidth={2.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: colors.text,
          }}
        >
          Bolão criado! 🎉
        </h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: colors.textMuted }}>
          Seu bolão está pronto. Convide a galera e bora palpitar na Copa.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderRadius: radius.xl,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          padding: "14px 20px",
        }}
      >
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
          {emoji}
        </div>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: colors.text }}>
          {name}
        </p>
      </div>
    </div>
  );
};
