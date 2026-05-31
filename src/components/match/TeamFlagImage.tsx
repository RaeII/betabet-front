import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

type TeamId = string | number | null | undefined

const WHITE_BACKGROUND_TEAM_IDS = new Set(['1598', '1593'])

export const PLACEHOLDER_FLAG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 3'%3E%3Crect width='5' height='3' fill='%23e5e7eb'/%3E%3C/svg%3E"

export function hasWhiteFlagBackground(teamId: TeamId): boolean {
  return teamId !== null && teamId !== undefined && WHITE_BACKGROUND_TEAM_IDS.has(String(teamId))
}

interface TeamFlagImageProps extends Omit<ComponentPropsWithoutRef<'img'>, 'src'> {
  src?: string | null
  teamId?: TeamId
}

export function TeamFlagImage({
  src,
  teamId,
  className,
  loading = 'lazy',
  ...props
}: TeamFlagImageProps) {
  return (
    <img
      src={src || PLACEHOLDER_FLAG}
      className={cn(className, hasWhiteFlagBackground(teamId) && 'bg-white')}
      loading={loading}
      {...props}
    />
  )
}
