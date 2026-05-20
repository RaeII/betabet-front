import { motion } from 'framer-motion'
import { useAllMatches } from '@/hooks/useMatches'
import { UpcomingMatches } from './components/UpcomingMatches'
import { UnbettedMatches } from './components/UnbettedMatches'
import { RankingPreview } from './components/RankingPreview'
import type { MatchWithUserBet } from '@/types/match.types'

const easeBrasil = [0.2, 0.8, 0.2, 1] as const

function FadeSlide({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeBrasil, delay }}
    >
      {children}
    </motion.div>
  )
}

export function HomePage() {
  const { data: matches, isLoading } = useAllMatches()

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">
        Carregando…
      </div>
    )
  }

  const allMatches = matches ?? []
  // Until individual match endpoints return userBet, cast as MatchWithUserBet[]
  const matchesWithBet = allMatches.map(m => ({ ...m, userBet: null })) as MatchWithUserBet[]

  return (
    <div className="space-y-8">
      <FadeSlide>
        <UpcomingMatches matches={allMatches} />
      </FadeSlide>

      <FadeSlide delay={0.08}>
        <UnbettedMatches matches={matchesWithBet} />
      </FadeSlide>

      <FadeSlide delay={0.16}>
        <RankingPreview />
      </FadeSlide>
    </div>
  )
}
