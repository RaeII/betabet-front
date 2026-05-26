import { motion } from 'framer-motion'
import { OnboardingCard } from './components/OnboardingCard'
import { OnboardingShell } from './components/OnboardingShell'
import { useMyJoinRequests } from '@/hooks/useGroups'
import type { MyJoinRequest } from '@/types/group.types'

const easeBrasil = [0.2, 0.8, 0.2, 1] as const

export function OnboardingPage() {
  const { data } = useMyJoinRequests()
  const requests = data?.requests ?? []

  return (
    <OnboardingShell showLogout>
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeBrasil }}
        className="space-y-10 pt-6"
      >
        {requests.length > 0 && (
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <span className="h-1.5 w-6 rounded-full bg-[var(--brand)]" />
              Aguardando aprovação
            </span>
            <div className="space-y-2">
              {requests.map((request) => (
                <PendingRequestCard key={request.id} request={request} />
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Assim que o admin aprovar, o grupo aparece automaticamente na sua lista. Enquanto isso, você pode entrar em outro grupo ou criar o seu.
            </p>
          </div>
        )}

        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <span className="h-1.5 w-6 rounded-full bg-[var(--support)]" />
            Bem-vindo
          </span>

          <div className="space-y-3">
            <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.045em] text-[var(--text)]">
              {requests.length > 0 ? 'Enquanto espera, vamos começar.' : 'Comece seu bolão da Copa.'}
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

function PendingRequestCard({ request }: { request: MyJoinRequest }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-soft)] text-xl">
        {request.groupEmoji ?? '🏆'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[var(--text)]">{request.groupName}</p>
        <p className="text-xs text-[var(--text-muted)]">Aguardando aprovação do admin</p>
      </div>
    </div>
  )
}
