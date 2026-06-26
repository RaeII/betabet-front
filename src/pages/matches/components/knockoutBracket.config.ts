// Estrutura oficial do mata-mata da Copa 2026 (jogos 73–104).
// Fonte: regulamento FIFA / chaveamento oficial (Round of 32 → Final).
// A atribuição exata dos melhores 3ºs aos slots depende do Anexo C (495
// combinações) e só é definida pela FIFA ao fim da fase de grupos — por isso
// os slots de 3º guardam apenas o conjunto de grupos elegíveis.

export type SlotRef =
  | { kind: 'winner'; group: string } // 1º colocado do grupo
  | { kind: 'runnerUp'; group: string } // 2º colocado do grupo
  | { kind: 'third'; groups: string[] } // melhor 3º dentre os grupos
  | { kind: 'matchWinner'; match: number } // vencedor de outro jogo

export type BracketPhase = 'r32' | 'r16' | 'qf' | 'sf' | 'final'

export interface BracketMatch {
  no: number
  phase: BracketPhase
  /** Metade do chaveamento; 'final' fica no centro. */
  half: 'top' | 'bottom' | 'final'
  home: SlotRef
  away: SlotRef
}

export const PHASE_LABELS: Record<BracketPhase, string> = {
  r32: '16-avos',
  r16: 'Oitavas',
  qf: 'Quartas',
  sf: 'Semifinal',
  final: 'Final',
}

// Kickoff oficial de cada jogo do mata-mata (UTC, ISO 8601). O calendário FIFA
// 2026 fixa data/horário/sede por NÚMERO de jogo desde o sorteio — valem mesmo
// antes de os confrontos serem definidos, então o chaveamento projetado já
// consegue mostrar quando cada jogo acontece. Renderizado em horário local pelo
// navegador (público no Brasil → UTC−3). Fonte: calendário oficial FIFA /
// Wikipédia (knockout stage). O jogo 103 (disputa de 3º lugar) não integra este
// chaveamento, por isso fica de fora.
export const MATCH_KICKOFF_UTC: Record<number, string> = {
  73: '2026-06-28T19:00:00Z',
  74: '2026-06-29T20:30:00Z',
  75: '2026-06-30T01:00:00Z',
  76: '2026-06-29T17:00:00Z',
  77: '2026-06-30T21:00:00Z',
  78: '2026-06-30T17:00:00Z',
  79: '2026-07-01T01:00:00Z',
  80: '2026-07-01T16:00:00Z',
  81: '2026-07-02T00:00:00Z',
  82: '2026-07-01T20:00:00Z',
  83: '2026-07-02T23:00:00Z',
  84: '2026-07-02T19:00:00Z',
  85: '2026-07-03T03:00:00Z',
  86: '2026-07-03T22:00:00Z',
  87: '2026-07-04T01:30:00Z',
  88: '2026-07-03T18:00:00Z',
  89: '2026-07-04T21:00:00Z',
  90: '2026-07-04T17:00:00Z',
  91: '2026-07-05T20:00:00Z',
  92: '2026-07-06T00:00:00Z',
  93: '2026-07-06T19:00:00Z',
  94: '2026-07-07T00:00:00Z',
  95: '2026-07-07T16:00:00Z',
  96: '2026-07-07T20:00:00Z',
  97: '2026-07-09T20:00:00Z',
  98: '2026-07-10T19:00:00Z',
  99: '2026-07-11T21:00:00Z',
  100: '2026-07-12T01:00:00Z',
  101: '2026-07-14T19:00:00Z',
  102: '2026-07-15T19:00:00Z',
  104: '2026-07-19T19:00:00Z',
}

/** Data+hora compactas do kickoff ("28/06 · 16:00", horário local). `null`
 *  quando o jogo não tem horário catalogado. */
export function formatBracketKickoff(matchNo: number): string | null {
  const iso = MATCH_KICKOFF_UTC[matchNo]
  if (!iso) return null
  return new Date(iso)
    .toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(', ', ' · ')
}

// Metade do topo afunila no jogo 101 (semifinal); a de baixo no 102.
export const BRACKET: BracketMatch[] = [
  // ── Round of 32 — metade do topo ──────────────────────────────
  { no: 73, phase: 'r32', half: 'top', home: { kind: 'runnerUp', group: 'A' }, away: { kind: 'runnerUp', group: 'B' } },
  { no: 74, phase: 'r32', half: 'top', home: { kind: 'winner', group: 'E' }, away: { kind: 'third', groups: ['A', 'B', 'C', 'D', 'F'] } },
  { no: 75, phase: 'r32', half: 'top', home: { kind: 'winner', group: 'F' }, away: { kind: 'runnerUp', group: 'C' } },
  { no: 77, phase: 'r32', half: 'top', home: { kind: 'winner', group: 'I' }, away: { kind: 'third', groups: ['C', 'D', 'F', 'G', 'H'] } },
  { no: 81, phase: 'r32', half: 'top', home: { kind: 'winner', group: 'D' }, away: { kind: 'third', groups: ['B', 'E', 'F', 'I', 'J'] } },
  { no: 82, phase: 'r32', half: 'top', home: { kind: 'winner', group: 'G' }, away: { kind: 'third', groups: ['A', 'E', 'H', 'I', 'J'] } },
  { no: 83, phase: 'r32', half: 'top', home: { kind: 'runnerUp', group: 'K' }, away: { kind: 'runnerUp', group: 'L' } },
  { no: 84, phase: 'r32', half: 'top', home: { kind: 'winner', group: 'H' }, away: { kind: 'runnerUp', group: 'J' } },
  // ── Round of 32 — metade de baixo ─────────────────────────────
  { no: 76, phase: 'r32', half: 'bottom', home: { kind: 'winner', group: 'C' }, away: { kind: 'runnerUp', group: 'F' } },
  { no: 78, phase: 'r32', half: 'bottom', home: { kind: 'runnerUp', group: 'E' }, away: { kind: 'runnerUp', group: 'I' } },
  { no: 79, phase: 'r32', half: 'bottom', home: { kind: 'winner', group: 'A' }, away: { kind: 'third', groups: ['C', 'E', 'F', 'H', 'I'] } },
  { no: 80, phase: 'r32', half: 'bottom', home: { kind: 'winner', group: 'L' }, away: { kind: 'third', groups: ['E', 'H', 'I', 'J', 'K'] } },
  { no: 85, phase: 'r32', half: 'bottom', home: { kind: 'winner', group: 'B' }, away: { kind: 'third', groups: ['E', 'F', 'G', 'I', 'J'] } },
  { no: 86, phase: 'r32', half: 'bottom', home: { kind: 'winner', group: 'J' }, away: { kind: 'runnerUp', group: 'H' } },
  { no: 87, phase: 'r32', half: 'bottom', home: { kind: 'winner', group: 'K' }, away: { kind: 'third', groups: ['D', 'E', 'I', 'J', 'L'] } },
  { no: 88, phase: 'r32', half: 'bottom', home: { kind: 'runnerUp', group: 'D' }, away: { kind: 'runnerUp', group: 'G' } },
  // ── Round of 16 ───────────────────────────────────────────────
  { no: 89, phase: 'r16', half: 'top', home: { kind: 'matchWinner', match: 74 }, away: { kind: 'matchWinner', match: 77 } },
  { no: 90, phase: 'r16', half: 'top', home: { kind: 'matchWinner', match: 73 }, away: { kind: 'matchWinner', match: 75 } },
  { no: 93, phase: 'r16', half: 'top', home: { kind: 'matchWinner', match: 83 }, away: { kind: 'matchWinner', match: 84 } },
  { no: 94, phase: 'r16', half: 'top', home: { kind: 'matchWinner', match: 81 }, away: { kind: 'matchWinner', match: 82 } },
  { no: 91, phase: 'r16', half: 'bottom', home: { kind: 'matchWinner', match: 76 }, away: { kind: 'matchWinner', match: 78 } },
  { no: 92, phase: 'r16', half: 'bottom', home: { kind: 'matchWinner', match: 79 }, away: { kind: 'matchWinner', match: 80 } },
  { no: 95, phase: 'r16', half: 'bottom', home: { kind: 'matchWinner', match: 86 }, away: { kind: 'matchWinner', match: 88 } },
  { no: 96, phase: 'r16', half: 'bottom', home: { kind: 'matchWinner', match: 85 }, away: { kind: 'matchWinner', match: 87 } },
  // ── Quartas ───────────────────────────────────────────────────
  { no: 97, phase: 'qf', half: 'top', home: { kind: 'matchWinner', match: 89 }, away: { kind: 'matchWinner', match: 90 } },
  { no: 98, phase: 'qf', half: 'top', home: { kind: 'matchWinner', match: 93 }, away: { kind: 'matchWinner', match: 94 } },
  { no: 99, phase: 'qf', half: 'bottom', home: { kind: 'matchWinner', match: 91 }, away: { kind: 'matchWinner', match: 92 } },
  { no: 100, phase: 'qf', half: 'bottom', home: { kind: 'matchWinner', match: 95 }, away: { kind: 'matchWinner', match: 96 } },
  // ── Semifinais ────────────────────────────────────────────────
  { no: 101, phase: 'sf', half: 'top', home: { kind: 'matchWinner', match: 97 }, away: { kind: 'matchWinner', match: 98 } },
  { no: 102, phase: 'sf', half: 'bottom', home: { kind: 'matchWinner', match: 99 }, away: { kind: 'matchWinner', match: 100 } },
  // ── Final ─────────────────────────────────────────────────────
  { no: 104, phase: 'final', half: 'final', home: { kind: 'matchWinner', match: 101 }, away: { kind: 'matchWinner', match: 102 } },
]

/**
 * Ordem de renderização do funil vertical (mobile): topo afunila para baixo
 * até a final no centro, depois a metade de baixo se abre novamente.
 */
export const BRACKET_RENDER_ORDER: { phase: BracketPhase; half: BracketMatch['half'] }[] = [
  { phase: 'r32', half: 'top' },
  { phase: 'r16', half: 'top' },
  { phase: 'qf', half: 'top' },
  { phase: 'sf', half: 'top' },
  { phase: 'final', half: 'final' },
  { phase: 'sf', half: 'bottom' },
  { phase: 'qf', half: 'bottom' },
  { phase: 'r16', half: 'bottom' },
  { phase: 'r32', half: 'bottom' },
]
