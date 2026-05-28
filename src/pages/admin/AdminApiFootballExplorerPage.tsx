import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Loader2, Globe, CalendarClock, MapPin, Radio, Plus, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  listLeagues,
  listFixtures,
  registerFriendlyMatch,
  type ApiFootballLeague,
  type ApiFootballFixture,
} from '@/services/apiFootballExplorer.service'
import { ApiRequestError } from '@/services/api'

type Tab = 'leagues' | 'team'

export function AdminApiFootballExplorerPage() {
  const [tab, setTab] = useState<Tab>('leagues')

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--text)]">API-Football Explorer</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Pesquise ligas e jogos diretamente na API-Football. Os IDs mostrados aqui são os mesmos usados nas rotas
          do backend (cache de até 24h).
        </p>
      </header>

      <div className="inline-flex rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-1">
        <TabButton active={tab === 'leagues'} onClick={() => setTab('leagues')}>
          Ligas → Jogos
        </TabButton>
        <TabButton active={tab === 'team'} onClick={() => setTab('team')}>
          Buscar por Time
        </TabButton>
      </div>

      {tab === 'leagues' ? <LeagueExplorer /> : <TeamSearch />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-[var(--radius)] px-4 py-2 text-sm font-semibold transition-colors',
        active
          ? 'bg-[var(--brand)] text-[var(--brand-text)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text)]',
      )}
    >
      {children}
    </button>
  )
}

// ─── Leagues explorer ─────────────────────────────────────────────────

function LeagueExplorer() {
  const [search, setSearch] = useState('')
  const [currentOnly, setCurrentOnly] = useState(true)
  const [selectedLeague, setSelectedLeague] = useState<ApiFootballLeague | null>(null)

  const leaguesQuery = useQuery({
    queryKey: ['admin', 'api-football', 'leagues', { currentOnly }],
    queryFn: () => listLeagues({ ...(currentOnly ? { current: true } : {}) }),
    staleTime: 5 * 60_000,
  })

  const filtered = useMemo(() => {
    const list = leaguesQuery.data?.data ?? []
    const term = search.trim().toLowerCase()
    if (!term) return list
    return list.filter(
      (l) =>
        l.league.name.toLowerCase().includes(term) ||
        l.country.name.toLowerCase().includes(term),
    )
  }, [leaguesQuery.data, search])

  const displayMeta = useMemo(() => {
    if (!leaguesQuery.data?.meta) return undefined
    return { ...leaguesQuery.data.meta, results: filtered.length }
  }, [leaguesQuery.data?.meta, filtered.length])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Coluna ligas */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar ligas…"
              className="pl-9"
            />
          </div>
          <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={currentOnly}
              onChange={(e) => setCurrentOnly(e.target.checked)}
              className="accent-[var(--brand)]"
            />
            Apenas atuais
          </label>
        </div>

        <QueryStatus
          isLoading={leaguesQuery.isLoading}
          isFetching={leaguesQuery.isFetching}
          isError={leaguesQuery.isError}
          error={leaguesQuery.error}
          isEmpty={filtered.length === 0}
          meta={displayMeta}
        />

        <ul className="space-y-2">
          {filtered.map((l) => (
            <li key={`${l.league.id}-${l.country.name}`}>
              <button
                onClick={() => setSelectedLeague(l)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[var(--radius-lg)] border bg-[var(--surface)] p-3 text-left transition-colors',
                  selectedLeague?.league.id === l.league.id
                    ? 'border-[var(--brand)] shadow-[0_0_0_1px_var(--brand)]'
                    : 'border-[var(--border)] hover:border-[var(--brand)]/40',
                )}
              >
                <img
                  src={l.league.logo}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded bg-white object-contain p-0.5"
                  loading="lazy"
                  onError={(e) => ((e.currentTarget.style.visibility = 'hidden'))}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">{l.league.name}</p>
                    <IdBadge label="ID" value={l.league.id} />
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[var(--text-muted)]">
                    <Globe size={11} /> {l.country.name} · {l.league.type}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Coluna fixtures da liga selecionada */}
      <section>
        {selectedLeague ? (
          <LeagueFixtures league={selectedLeague} />
        ) : (
          <EmptyState
            title="Selecione uma liga"
            description="Clique em qualquer liga à esquerda para listar os jogos."
          />
        )}
      </section>
    </div>
  )
}

function LeagueFixtures({ league }: { league: ApiFootballLeague }) {
  const seasonOptions = useMemo(() => {
    const seasons = [...league.seasons].sort((a, b) => b.year - a.year)
    return seasons.length > 0 ? seasons : [{ year: new Date().getFullYear(), current: false, start: '', end: '' }]
  }, [league])

  const defaultSeason = seasonOptions.find((s) => s.current)?.year ?? seasonOptions[0]!.year
  const [season, setSeason] = useState<number>(defaultSeason)
  const [scope, setScope] = useState<'next' | 'last' | 'live'>('next')

  useEffect(() => {
    setSeason(defaultSeason)
    setScope('next')
  }, [league.league.id, defaultSeason])

  const fixturesQuery = useQuery({
    queryKey: ['admin', 'api-football', 'fixtures', 'league', league.league.id, season, scope],
    queryFn: () => {
      if (scope === 'live') return listFixtures({ league: league.league.id, season, live: 'all' })
      if (scope === 'last') return listFixtures({ league: league.league.id, season, last: 20 })
      return listFixtures({ league: league.league.id, season, next: 20 })
    },
    staleTime: 60_000,
  })

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center gap-3">
          <img src={league.league.logo} alt="" className="h-10 w-10 rounded bg-white object-contain p-1" />
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">{league.league.name}</h2>
            <p className="text-xs text-[var(--text-muted)]">
              {league.country.name} · {league.league.type}
            </p>
          </div>
          <IdBadge label="Liga" value={league.league.id} />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] focus:border-[var(--brand)] focus:outline-none"
          >
            {seasonOptions.map((s) => (
              <option key={s.year} value={s.year}>
                {s.year} {s.current ? '(atual)' : ''}
              </option>
            ))}
          </select>
          <ScopeButton active={scope === 'next'} onClick={() => setScope('next')}>
            <CalendarClock size={13} /> Próximos
          </ScopeButton>
          <ScopeButton active={scope === 'last'} onClick={() => setScope('last')}>
            Últimos
          </ScopeButton>
          <ScopeButton active={scope === 'live'} onClick={() => setScope('live')}>
            <Radio size={13} /> Ao vivo
          </ScopeButton>
        </div>
      </header>

      <QueryStatus
        isLoading={fixturesQuery.isLoading}
        isFetching={fixturesQuery.isFetching}
        isError={fixturesQuery.isError}
        error={fixturesQuery.error}
        isEmpty={(fixturesQuery.data?.data.length ?? 0) === 0}
        meta={fixturesQuery.data?.meta}
      />

      <FixturesList fixtures={fixturesQuery.data?.data ?? []} />
    </div>
  )
}

function ScopeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-[var(--radius)] border px-3 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
          : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]',
      )}
    >
      {children}
    </button>
  )
}

// ─── Team search ──────────────────────────────────────────────────────

function TeamSearch() {
  const [teamIdInput, setTeamIdInput] = useState('')
  const [submitted, setSubmitted] = useState<number | null>(null)
  const [direction, setDirection] = useState<'next' | 'last'>('next')
  const [count, setCount] = useState(10)

  const fixturesQuery = useQuery({
    queryKey: ['admin', 'api-football', 'fixtures', 'team', submitted, direction, count],
    queryFn: () =>
      listFixtures(
        direction === 'next'
          ? { team: submitted!, next: count }
          : { team: submitted!, last: count },
      ),
    enabled: submitted !== null,
    staleTime: 60_000,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id = Number(teamIdInput.trim())
    if (!Number.isInteger(id) || id <= 0) return
    setSubmitted(id)
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
      >
        <div className="min-w-[200px] flex-1">
          <Input
            value={teamIdInput}
            onChange={(e) => setTeamIdInput(e.target.value)}
            label="ID do time"
            placeholder="Ex.: 6 (Seleção Brasileira), 33 (Manchester United)…"
            inputMode="numeric"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'next' | 'last')}
            className="h-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus:border-[var(--brand)] focus:outline-none"
          >
            <option value="next">Próximos</option>
            <option value="last">Últimos</option>
          </select>

          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="h-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus:border-[var(--brand)] focus:outline-none"
          >
            {[5, 10, 20, 30].map((n) => (
              <option key={n} value={n}>
                {n} jogos
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={!teamIdInput.trim()}>
          Buscar
        </Button>
      </form>

      {submitted === null ? (
        <EmptyState
          title="Informe o ID de um time"
          description="Use o explorador de ligas para descobrir IDs. Funciona para clubes e seleções."
        />
      ) : (
        <>
          <QueryStatus
            isLoading={fixturesQuery.isLoading}
            isFetching={fixturesQuery.isFetching}
            isError={fixturesQuery.isError}
            error={fixturesQuery.error}
            isEmpty={(fixturesQuery.data?.data.length ?? 0) === 0}
            meta={fixturesQuery.data?.meta}
          />
          <FixturesList fixtures={fixturesQuery.data?.data ?? []} showLeague />
        </>
      )}
    </div>
  )
}

// ─── Shared pieces ────────────────────────────────────────────────────

function FixturesList({
  fixtures,
  showLeague = false,
}: {
  fixtures: ApiFootballFixture[]
  showLeague?: boolean
}) {
  if (fixtures.length === 0) return null
  return (
    <ul className="space-y-2">
      {fixtures.map((f) => (
        <FixtureRow key={f.fixture.id} fixture={f} showLeague={showLeague} />
      ))}
    </ul>
  )
}

function FixtureRow({ fixture, showLeague }: { fixture: ApiFootballFixture; showLeague: boolean }) {
  const { fixture: fx, league, teams, goals } = fixture
  const date = new Date(fx.date)
  const formattedDate = date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  const status = fx.status.short
  const isLive = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(status)
  const isFinished = ['FT', 'AET', 'PEN'].includes(status)

  type RegState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'done'; matchId: string }
    | { status: 'error'; message: string }
  const [reg, setReg] = useState<RegState>({ status: 'idle' })
  const alreadyRegistered = reg.status === 'done'

  async function handleRegister() {
    setReg({ status: 'loading' })
    try {
      const out = await registerFriendlyMatch(fx.id)
      setReg({ status: 'done', matchId: out.match.id })
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.status === 409
            ? 'Já cadastrada'
            : err.message
          : 'Falha ao cadastrar'
      setReg({ status: 'error', message: msg })
    }
  }

  return (
    <li className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>{formattedDate}</span>
            <IdBadge label="Fixture" value={fx.fixture?.id ?? fixture.fixture.id} />
            {showLeague && (
              <>
                <span>·</span>
                <span className="truncate">
                  {league.name} · {league.country}
                </span>
                <IdBadge label="Liga" value={league.id} />
                <span className="text-[var(--text-muted)]">{league.round}</span>
              </>
            )}
            {fx.venue.name && (
              <span className="ml-auto flex items-center gap-1">
                <MapPin size={11} /> {fx.venue.name}
                {fx.venue.city ? `, ${fx.venue.city}` : ''}
              </span>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamCell team={teams.home} align="right" />
            <div className="min-w-[80px] text-center">
              {isLive || isFinished ? (
                <p className="text-lg font-extrabold text-[var(--text)]">
                  {goals.home ?? 0} <span className="text-[var(--text-muted)]">×</span> {goals.away ?? 0}
                </p>
              ) : (
                <p className="text-sm font-semibold text-[var(--text-muted)]">vs</p>
              )}
              <StatusPill status={status} elapsed={fx.status.elapsed} />
            </div>
            <TeamCell team={teams.away} align="left" />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <Button
            type="button"
            variant={alreadyRegistered ? 'secondary' : 'primary'}
            size="sm"
            disabled={reg.status === 'loading' || alreadyRegistered}
            onClick={handleRegister}
          >
            {reg.status === 'loading' && <Loader2 size={13} className="animate-spin" />}
            {alreadyRegistered && <Check size={13} />}
            {reg.status === 'idle' && <Plus size={13} />}
            {reg.status === 'error' && <Plus size={13} />}
            <span className="ml-1">
              {alreadyRegistered ? 'Cadastrada' : reg.status === 'loading' ? 'Cadastrando…' : 'Cadastrar'}
            </span>
          </Button>
          {reg.status === 'error' && (
            <p className="max-w-[180px] text-right text-[10px] text-red-600">{reg.message}</p>
          )}
          {reg.status === 'done' && (
            <p className="text-[10px] text-[var(--text-muted)]">
              Match ID <span className="font-mono">{reg.matchId}</span>
            </p>
          )}
        </div>
      </div>
    </li>
  )
}

function TeamCell({
  team,
  align,
}: {
  team: { id: number; name: string; logo: string }
  align: 'left' | 'right'
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2',
        align === 'right' ? 'flex-row-reverse text-right' : 'flex-row text-left',
      )}
    >
      <img
        src={team.logo}
        alt=""
        className="h-7 w-7 shrink-0 rounded bg-white object-contain p-0.5"
        loading="lazy"
        onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--text)]">{team.name}</p>
        <p className="text-[10px] font-mono text-[var(--text-muted)]">ID {team.id}</p>
      </div>
    </div>
  )
}

function StatusPill({ status, elapsed }: { status: string; elapsed: number | null }) {
  const isLive = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(status)
  const isFinished = ['FT', 'AET', 'PEN'].includes(status)
  return (
    <span
      className={cn(
        'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        isLive && 'bg-red-500/15 text-red-600',
        isFinished && 'bg-[var(--surface-soft)] text-[var(--text-muted)]',
        !isLive && !isFinished && 'bg-[var(--brand)]/10 text-[var(--brand)]',
      )}
    >
      {isLive && elapsed !== null ? `${status} · ${elapsed}'` : status}
    </span>
  )
}

function IdBadge({ label, value }: { label: string; value: number }) {
  return (
    <Badge className="border-[var(--brand)]/20 bg-[var(--brand)]/5 px-2 py-0 font-mono text-[10px] text-[var(--brand)]">
      {label} {value}
    </Badge>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
    </div>
  )
}

function QueryStatus({
  isLoading,
  isFetching,
  isError,
  error,
  isEmpty,
  emptyHint,
  meta,
}: {
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  isEmpty: boolean
  emptyHint?: string | null
  meta?: { results: number; cachedAt: string; staleAt: string }
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Loader2 size={14} className="animate-spin" /> Carregando…
      </div>
    )
  }
  if (isError) {
    const msg = error instanceof ApiRequestError ? error.message : 'Falha ao consultar a API-Football'
    return (
      <div className="rounded-[var(--radius)] border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-600">
        {msg}
      </div>
    )
  }
  if (emptyHint) {
    return <p className="text-xs text-[var(--text-muted)]">{emptyHint}</p>
  }
  if (isEmpty) {
    return <p className="text-xs text-[var(--text-muted)]">Nenhum resultado.</p>
  }
  if (meta) {
    const cached = new Date(meta.cachedAt).toLocaleTimeString('pt-BR')
    return (
      <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
        <span>{meta.results} resultado{meta.results === 1 ? '' : 's'}</span>
        <span>·</span>
        <span>cache {cached}</span>
        {isFetching && <Loader2 size={11} className="animate-spin" />}
      </div>
    )
  }
  return null
}
