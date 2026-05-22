import { motion } from 'framer-motion'
import { OnboardingCard } from './components/OnboardingCard'
import { OnboardingShell } from './components/OnboardingShell'

const easeBrasil = [0.2, 0.8, 0.2, 1] as const

export function OnboardingPage() {
  return (
    <OnboardingShell showLogout>
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeBrasil }}
        className="space-y-10 pt-6"
      >
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <span className="h-1.5 w-6 rounded-full bg-[var(--support)]" />
            Bem-vindo
          </span>

          <div className="space-y-3">
            <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.045em] text-[var(--text)]">
              Comece seu bolão da Copa.
            </h1>
            <p className="max-w-sm text-base leading-relaxed text-[var(--text-muted)]">
              Crie um grupo com amigos ou entre em um com o código de convite.
              Sem app extra, sem cadastro complicado.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <OnboardingCard
            icon="🎟️"
            title="Entrar em um grupo"
            description="Tenho um código ou link de convite"
            to="/onboarding/join"
          />
          <OnboardingCard
            icon="✨"
            title="Criar um grupo"
            description="Quero montar o meu próprio bolão"
            to="/groups/new"
          />
        </div>

        <p className="text-center text-xs text-[var(--text-muted)]">
          Você pode trocar de grupo a qualquer momento depois.
        </p>
      </motion.section>
    </OnboardingShell>
  )
}
