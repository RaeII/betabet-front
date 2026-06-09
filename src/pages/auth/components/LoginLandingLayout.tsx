import { useEffect, type ReactNode } from 'react'
import { Crown, Gift, Radio, Trophy, Users, type LucideIcon } from 'lucide-react'
import { PatternBackground } from '@/components/layout/PatternBackground'
import { useTheme } from '@/hooks/useTheme'

interface LoginLandingLayoutProps {
  title: string
  subtitle?: string
  logoSrc?: string
  children: ReactNode
}

interface FeatureItem {
  title: string
  description: string
  icon: LucideIcon
}

const features: FeatureItem[] = [
  {
    title: 'Totalmente gratuito',
    description: 'Crie, participe e dispute seus bolões sem mensalidade, taxa ou cobrança escondida.',
    icon: Gift,
  },
  {
    title: 'Placar, pontos e ranking em tempo real',
    description: 'Acompanhe placar ao vivo, pontuação calculada e ranking atualizado durante os jogos.',
    icon: Radio,
  },
  {
    title: 'Participantes ilimitados',
    description: 'Monte bolões para poucos amigos ou para toda a empresa, sem limite de pessoas por grupo.',
    icon: Users,
  },
  {
    title: 'Aposte no campeão do mundo',
    description: 'Além dos palpites por jogo, escolha o campeão da Copa e dispute pontos extras no bolão.',
    icon: Crown,
  },
]

const highlights = [
  'bolão totalmente gratuito',
  'placar ao vivo e ranking em tempo real',
  'participantes ilimitados por bolão',
  'aposta no campeão do mundo',
]

const SEO_TITLE = 'Bolão da Copa 2026 | Bolão CLT'
const SEO_DESCRIPTION =
  'Bolão CLT é um bolão da Copa 2026 totalmente gratuito, com placar ao vivo, pontos e ranking em tempo real, participantes ilimitados e aposta no campeão do mundo.'

export function LoginLandingLayout({
  title,
  subtitle,
  logoSrc,
  children,
}: LoginLandingLayoutProps) {
  const { theme } = useTheme()

  useEffect(() => {
    const previousTitle = document.title
    const descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = descriptionTag?.content

    document.title = SEO_TITLE
    if (descriptionTag) descriptionTag.content = SEO_DESCRIPTION

    return () => {
      document.title = previousTitle
      if (descriptionTag && previousDescription) descriptionTag.content = previousDescription
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <PatternBackground theme={theme} />
      <main className="relative z-10 lg:flex lg:min-h-screen lg:items-center">
        <div className="mx-auto w-full max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(24rem,27rem)] lg:items-center lg:gap-16 lg:px-8 xl:gap-24">
          <section
            className="flex min-h-screen items-start justify-center px-4 pb-10 pt-8 sm:pt-12 lg:order-2 lg:min-h-0 lg:w-full lg:items-center lg:justify-self-end lg:p-0"
            aria-labelledby="login-title"
          >
            <div className="w-full max-w-sm">
              <div className="mb-6 text-center lg:hidden">
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  <span className="h-1.5 w-6 rounded-[var(--radius-pill)] bg-[var(--support)]" />
                  100% gratuito
                </span>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[var(--text-muted)]">
                  Bolão da Copa 2026 com placar ao vivo, ranking em tempo real
                  e participantes ilimitados.
                </p>
              </div>
              <div className="mb-8 text-center">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt=""
                    className="mx-auto h-20 w-auto object-contain"
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand)] text-[var(--brand-text)]"
                    aria-hidden="true"
                  >
                    <Trophy size={28} />
                  </span>
                )}
                <h1 id="login-title" className="mt-3 text-2xl font-bold text-[var(--text)]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
                )}
              </div>
              <div
                data-football-collider
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg"
              >
                {children}
              </div>
            </div>
          </section>

          <section
            className="px-6 pb-16 pt-2 lg:order-1 lg:px-0 lg:py-0"
            aria-labelledby="login-about-title"
          >
            <div className="mx-auto max-w-2xl space-y-8 lg:mx-0">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  <span className="h-1.5 w-6 rounded-[var(--radius-pill)] bg-[var(--support)]" />
                  Bolão da Copa 2026
                </span>
                <h2
                  id="login-about-title"
                  className="max-w-xl text-[2rem] font-semibold leading-tight text-[var(--text)] sm:text-[2.5rem] lg:text-[3rem]"
                >
                  O bolão mais clássico que existe, gratuito e atualização em tempo real.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-[var(--text-muted)] sm:text-lg sm:leading-8">
                  O Bolão CLT leva o formato tradicional dos palpites da Copa do Mundo
                  2026 para uma experiência simples: grupos por convite, placar ao vivo,
                  pontos automáticos, ranking atualizado e disputa pelo campeão do mundo.
                </p>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2">
                {features.map(({ title: featureTitle, description, icon: Icon }) => (
                  <li
                    key={featureTitle}
                    data-football-collider
                    className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-soft)] text-[var(--brand)]">
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--text)]">
                          {featureTitle}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                          {description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2" aria-label="Assuntos principais">
                {highlights.map(highlight => (
                  <span
                    key={highlight}
                    className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
