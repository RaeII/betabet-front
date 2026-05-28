import { MapPin, Users, UserCheck } from 'lucide-react'
import type { PreviewVenue } from '@/services/matchPreview.service'

interface PreMatchVenueProps {
  venue: PreviewVenue | null
  referee: string | null
  fallbackStadiumName: string | null
  fallbackStadiumCity: string | null
}

function formatCapacity(n: number | null): string | null {
  if (!n || n <= 0) return null
  return new Intl.NumberFormat('pt-BR').format(n)
}

export function PreMatchVenue({
  venue,
  referee,
  fallbackStadiumName,
  fallbackStadiumCity,
}: PreMatchVenueProps) {
  const name = venue?.name ?? fallbackStadiumName
  const city = venue?.city ?? fallbackStadiumCity
  const image = venue?.image ?? null
  const capacity = formatCapacity(venue?.capacity ?? null)

  if (!name && !image && !referee && !capacity) return null

  return (
    <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]">
      {image ? (
        <div className="relative aspect-[16/9] w-full bg-[var(--surface-soft)] sm:aspect-[21/9]">
          <img
            src={image}
            alt={name ?? 'Estádio'}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, transparent 35%, color-mix(in srgb, var(--surface) 80%, transparent) 100%)',
            }}
          />
        </div>
      ) : null}

      <div className="space-y-3 p-4 sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Estádio
        </p>
        {name ? (
          <h3 className="text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">
            {name}
          </h3>
        ) : null}

        <div className="grid gap-2 text-xs text-[var(--text-muted)] sm:grid-cols-2">
          {city ? (
            <div className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span className="truncate">{city}</span>
            </div>
          ) : null}
          {capacity ? (
            <div className="flex items-center gap-2">
              <Users aria-hidden="true" className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span className="truncate">{capacity} lugares</span>
            </div>
          ) : null}
          {referee ? (
            <div className="flex items-center gap-2 sm:col-span-2">
              <UserCheck aria-hidden="true" className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span className="truncate">
                <span className="font-semibold text-[var(--text)]">Árbitro:</span> {referee}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
