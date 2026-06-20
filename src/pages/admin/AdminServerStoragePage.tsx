import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HardDrive, RefreshCw } from 'lucide-react'
import { getServerDiskUsage, type DiskReport, type DiskSample } from '@/services/admin.service'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Bytes → string humana (GB/TB com 1 casa). */
function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 GB'
  const gb = bytes / 1024 ** 3
  if (gb >= 1024) return `${(gb / 1024).toFixed(2)} TB`
  if (gb >= 10) return `${gb.toFixed(0)} GB`
  return `${gb.toFixed(1)} GB`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Cor por faixa de ocupação: brand < 75% ≤ amber < 90% ≤ red. */
function severityColor(percent: number): string {
  if (percent >= 90) return 'var(--danger, #ef4444)'
  if (percent >= 75) return '#f59e0b'
  return 'var(--brand)'
}

/** Área SVG do histórico de % usado ao longo do tempo (sem libs de chart). */
function HistoryChart({ samples }: { samples: DiskSample[] }) {
  const W = 720
  const H = 200
  const PAD = { top: 12, right: 12, bottom: 24, left: 32 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const points = useMemo(() => {
    if (samples.length === 0) return []
    const n = samples.length
    return samples.map((s, i) => {
      const x = PAD.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
      const y = PAD.top + innerH - (Math.min(100, Math.max(0, s.usedPercent)) / 100) * innerH
      return { x, y, s }
    })
  }, [samples, innerW, innerH, PAD.left, PAD.top])

  if (points.length === 0) return null

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath =
    `M${points[0].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} ` +
    points.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
    ` L${points[points.length - 1].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`

  const last = points[points.length - 1]
  const lineColor = severityColor(last.s.usedPercent)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Histórico de uso de disco">
      <defs>
        <linearGradient id="diskArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.28" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gridlines + labels do eixo Y (0/25/50/75/100%) */}
      {[0, 25, 50, 75, 100].map(pct => {
        const y = PAD.top + innerH - (pct / 100) * innerH
        return (
          <g key={pct}>
            <line
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray={pct === 0 ? undefined : '3 4'}
            />
            <text x={PAD.left - 6} y={y + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">
              {pct}
            </text>
          </g>
        )
      })}

      <path d={areaPath} fill="url(#diskArea)" />
      <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Ponto mais recente destacado */}
      <circle cx={last.x} cy={last.y} r="3.5" fill={lineColor} stroke="var(--surface)" strokeWidth="1.5" />

      {/* Datas: primeira e última amostra */}
      <text x={PAD.left} y={H - 6} textAnchor="start" fontSize="9" fill="var(--text-muted)">
        {formatDateTime(samples[0].sampledAt)}
      </text>
      {samples.length > 1 && (
        <text x={W - PAD.right} y={H - 6} textAnchor="end" fontSize="9" fill="var(--text-muted)">
          {formatDateTime(samples[samples.length - 1].sampledAt)}
        </text>
      )}
    </svg>
  )
}

export function AdminServerStoragePage() {
  const { data, isLoading, isFetching, refetch } = useQuery<DiskReport>({
    queryKey: ['admin', 'server-disk'],
    queryFn: () => getServerDiskUsage(180),
    refetchOnWindowFocus: false,
  })

  const current = data?.current
  const samples = data?.samples ?? []
  const color = current ? severityColor(current.usedPercent) : 'var(--brand)'

  // Tabela: amostras mais recentes primeiro, com delta vs. a anterior.
  // (useMemo antes de qualquer early return — regra dos hooks.)
  const recent = useMemo(() => {
    return [...samples].reverse().slice(0, 16).map((s, idx, arr) => {
      const prev = arr[idx + 1]
      const delta = prev ? s.usedBytes - prev.usedBytes : null
      return { s, delta }
    })
  }, [samples])

  if (isLoading) {
    return <div className="text-[var(--text-muted)]">Carregando…</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text)]">
            <HardDrive size={22} className="text-[var(--brand)]" />
            Armazenamento do servidor
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Uso de disco da partição <strong>{current?.mountPath ?? '/'}</strong>. O valor atual é lido
            ao vivo; o histórico é gravado automaticamente <strong>a cada 6h</strong> — útil para
            acompanhar o crescimento sem acessar os logs do host.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={cn(isFetching && 'animate-spin')} />
          Atualizar
        </Button>
      </div>

      {/* Cartão do uso atual */}
      {current && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Uso atual
              </p>
              <p className="mt-1 text-3xl font-bold" style={{ color }}>
                {current.usedPercent.toFixed(1)}%
              </p>
            </div>
            <div className="text-right text-sm text-[var(--text-muted)]">
              <p>
                <span className="font-semibold text-[var(--text)]">{formatBytes(current.usedBytes)}</span> usados
                de <span className="font-semibold text-[var(--text)]">{formatBytes(current.totalBytes)}</span>
              </p>
              <p>{formatBytes(current.freeBytes)} livres</p>
            </div>
          </div>

          {/* Barra usado vs. total */}
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, current.usedPercent)}%`, backgroundColor: color }}
            />
          </div>
          {current.usedPercent >= 75 && (
            <p className="mt-2 text-xs" style={{ color }}>
              {current.usedPercent >= 90
                ? 'Disco quase cheio — libere espaço o quanto antes.'
                : 'Disco acima de 75% — fique de olho no crescimento.'}
            </p>
          )}
        </div>
      )}

      {/* Histórico */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text)]">Histórico (% usado)</h2>
        {samples.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Ainda não há amostras gravadas. A primeira é registrada no próximo ciclo de 6h
            (ou logo após o próximo deploy/reinício).
          </p>
        ) : (
          <>
            <div className="mt-3">
              <HistoryChart samples={samples} />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-2 pr-4 font-semibold">Data</th>
                    <th className="py-2 pr-4 font-semibold">Usado</th>
                    <th className="py-2 pr-4 font-semibold">%</th>
                    <th className="py-2 font-semibold">Variação</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(({ s, delta }) => (
                    <tr key={s.id} className="border-t border-[var(--border)]">
                      <td className="py-2 pr-4 text-[var(--text)]">{formatDateTime(s.sampledAt)}</td>
                      <td className="py-2 pr-4 text-[var(--text-muted)]">{formatBytes(s.usedBytes)}</td>
                      <td className="py-2 pr-4 font-medium" style={{ color: severityColor(s.usedPercent) }}>
                        {s.usedPercent.toFixed(1)}%
                      </td>
                      <td className="py-2 text-[var(--text-muted)]">
                        {delta === null
                          ? '—'
                          : `${delta >= 0 ? '+' : '−'}${formatBytes(Math.abs(delta))}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
