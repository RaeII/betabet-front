# Research: Onboarding UX & Grupos

**Feature**: `004-onboarding-ux` | **Date**: 2026-05-22

---

## 1. Detecção de "primeiro uso" — OnboardingGuard

**Decisão**: Usar `useUserGroups()` dentro de um guard React Router (`OnboardingGuard`) que
envolve as rotas protegidas pelo `AppShell`. Se `groups.length === 0` após o fetch, redirecionar
para `/onboarding`.

**Rationale**: O hook `useUserGroups` já existe e é chamado em `GroupsPage` — o TanStack Query
reutiliza o cache (`groupKeys.lists()`). Adicionar o guard na árvore do router evita poluir o
`AuthGuard` com lógica de negócio e mantém separação de responsabilidades.

**Alternativas consideradas**:
- Flag `hasOnboarded` no perfil do usuário (backend) → requer mudança de contrato; overkill para
  a definição de "sem grupos".
- Verificação em `AppShell` → acopla lógica de onboarding ao shell principal; dificulta teste.
- Verificação em `AuthGuard` → `AuthGuard` não deve conhecer lógica de grupos.

---

## 2. Entrada via código ou link — normalização

**Decisão**: Campo de texto único que aceita ambos. Normalização client-side:
```ts
function extractCode(input: string): string {
  const url = input.trim()
  const match = url.match(/invite\/([A-Za-z0-9]+)/)
  return match ? match[1] : url.trim()
}
```

**Rationale**: O `inviteCode` já existe em `BettingGroup` e o backend já expõe
`GET /api/groups/invite/:code`. Não é necessário novo endpoint. A UX de campo único reduz
fricção vs. dois campos separados (URL e código).

**Alternativas consideradas**:
- Dois inputs separados (link / código) → mais campos = mais fricção; regex resolve ambos.
- QR code scan → fora do escopo v1.

---

## 3. Emoji vs. upload de imagem — armazenamento

**Decisão**: Adicionar campo `emoji?: string` à entidade `BettingGroup` e ao `CreateGroupData`.
Na UX, o usuário escolhe **ou** emoji **ou** imagem — nunca ambos ao mesmo tempo. O frontend
envia `emoji` no payload ou `coverUrl` (URL após upload), não os dois.

**Rationale**: `coverUrl: string | null` já existe mas é semântico para URLs de imagem. Misturar
emojis em `coverUrl` (ex.: com prefixo `emoji:🏆`) seria um hack frágil. Campo separado é mais
limpo, tipado e fácil de renderizar condicionalmente.

**Alternativas consideradas**:
- Usar `coverUrl` com convenção `"emoji:🏆"` → hack; requer parsing extra em todo lugar que
  renderiza o avatar do grupo.
- Apenas emoji, sem upload → limita personalização; `coverUrl` já existe no modelo.

---

## 4. Upload de imagem — estratégia

**Decisão**: Para v1, o upload de imagem é **opcional e diferido**: o frontend aceita um `File`
local, gera um `objectURL` para preview, mas o envio ao backend de `coverUrl` real (URL de
armazenamento) depende de um endpoint de upload separado que pode não existir ainda. Se o
backend não suportar upload de imagem no momento, o campo `emoji` é suficiente para lançamento.

**Rationale**: Evitar bloqueio de implementação por dependência de backend não confirmada.
O wizard funciona 100% com emoji desde o dia 1; o upload pode ser ativado quando o backend
estiver pronto.

**Alternativas consideradas**:
- Base64 no payload → penaliza tamanho do request; não escalável.
- Bloquear feature de upload até backend pronto → onboarding fica limitado a emoji, o que é
  aceitável para v1.

---

## 5. Wizard de 2 passos — gerenciamento de estado

**Decisão**: Estado local com `useState` dentro de `CreateGroupPage`. Sem Context, sem reducer,
sem persistência entre sessões.

**Rationale**: O wizard tem exatamente 2 steps, 5 campos e uma única mutação no final. Um reducer
seria over-engineering para esse escopo. Se o usuário sair no meio, reinicia do zero — aceitável
dado que criar um grupo leva < 60 segundos.

---

## 6. Animação de transição entre steps

**Decisão**: Usar `framer-motion` (`AnimatePresence` + `motion.div`) para animar a entrada/saída
de cada step com slide horizontal. O pacote já está no projeto.

**Rationale**: Framer Motion já é uma dependência existente (usada em `PageTransition`). Sem
custo adicional de bundle. Transição suave reforça o sentido de "progresso" no wizard.
