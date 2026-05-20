import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export const RegisterSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
    referralCode: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Senhas não conferem' })
    }
  })

export const BetFormSchema = z.object({
  homeScore: z.number().int().min(0).max(20),
  awayScore: z.number().int().min(0).max(20),
  replicateToAllGroups: z.boolean(),
})

export const GroupCreateSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(50, 'Máximo 50 caracteres'),
  resultPoints: z.number().int().min(1).max(10).default(1),
  exactScorePoints: z.number().int().min(1).max(20).default(3),
  showBetsBeforeKickoff: z.boolean().default(false),
  joinMode: z.enum(['invite', 'request']).default('request'),
})

export const MatchFormSchema = z.object({
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  stadiumId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  phase: z.enum(['group', 'r16', 'qf', 'sf', 'final']),
  groupName: z.string().optional(),
  matchday: z.number().int().min(1).max(3).optional(),
})

export const ResultFormSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type BetFormInput = z.infer<typeof BetFormSchema>
export type GroupCreateInput = z.infer<typeof GroupCreateSchema>
export type MatchFormInput = z.infer<typeof MatchFormSchema>
export type ResultFormInput = z.infer<typeof ResultFormSchema>
