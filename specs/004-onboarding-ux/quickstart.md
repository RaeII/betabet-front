# Quickstart: Onboarding UX & Grupos

**Feature branch**: `004-onboarding-ux`

---

## Pré-requisitos

- Bun ≥ 1.1 (`bun --version`)
- Backend rodando em `http://localhost:3000`
- Variável `VITE_API_URL=http://localhost:3000` em `.env.local`

---

## Rodar o app

```bash
bun install      # instalar dependências
bun run dev      # iniciar Vite dev server em http://localhost:5173
```

---

## Testar o fluxo de onboarding

### Cenário 1 — Novo usuário (0 grupos)

1. Crie uma conta nova em `/auth/register`
2. Após login, deve redirecionar automaticamente para `/onboarding`
3. Veja a tela de boas-vindas com as duas opções

### Cenário 2 — Entrar em grupo via código

1. Em `/onboarding`, clique em "Entrar em um grupo"
2. Cole um link de convite (ex.: `http://localhost:5173/invite/ABC123`) ou apenas o código (`ABC123`)
3. O preview do grupo aparece automaticamente
4. Clique "Entrar no grupo" — você é redirecionado para `/groups/:id`

### Cenário 3 — Criar grupo (wizard)

1. Em `/onboarding`, clique em "Criar um grupo"
2. **Step 1**: Digite o nome, selecione um emoji ou faça upload de imagem → pré-visualização ao vivo
3. **Step 2**: Ajuste os pontos por vencedor e por placar exato → veja o exemplo Brasil x França atualizar em tempo real
4. Clique "Criar grupo" — você é redirecionado para `/groups/:id` como administrador

---

## Rodar os testes

```bash
bun run test                         # todos os testes
bun run test OnboardingGuard         # guard de onboarding
bun run test OnboardingPage          # tela de boas-vindas
bun run test JoinGroupPage           # entrada via código
bun run test CreateGroupPage         # wizard de criação
bun run test ScoringExample          # componente de exemplo ao vivo
bun run test:coverage                # relatório de cobertura
```

---

## Arquivos-chave desta feature

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/router/guards/OnboardingGuard.tsx` | Detecta 0 grupos → redirect /onboarding |
| `src/pages/onboarding/OnboardingPage.tsx` | Tela de boas-vindas |
| `src/pages/onboarding/JoinGroupPage.tsx` | Entrada por código/link |
| `src/pages/groups/CreateGroupPage.tsx` | Wizard 2 passos (overhaul) |
| `src/components/scoring/ScoringExample.tsx` | Simulação Brasil x França ao vivo |
| `src/types/group.types.ts` | Tipos (delta: campo `emoji`) |
| `src/lib/schemas/index.ts` | Zod (delta: `emoji` em `GroupCreateSchema`) |
| `src/hooks/useGroups.ts` | Hooks (delta: `useJoinByCode`) |

---

## Notas para o backend

O campo `emoji` é novo no `POST /api/groups`. Verifique se o backend já aceita e persiste
esse campo — caso contrário, consulte `specs/004-onboarding-ux/contracts/api.md` para o
contrato da alteração necessária.
