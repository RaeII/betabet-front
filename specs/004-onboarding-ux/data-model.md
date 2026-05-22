# Data Model: Onboarding UX & Grupos

**Feature**: `004-onboarding-ux` | **Date**: 2026-05-22

---

## Entidades afetadas

### BettingGroup (atualização)

Campo novo adicionado ao tipo existente em `src/types/group.types.ts`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `emoji` | `string \| null` | Emoji escolhido como identidade do grupo. `null` quando não definido ou quando `coverUrl` é uma imagem. |

**Regra de exibição**: Se `emoji` estiver definido, renderizá-lo como identidade visual. Se `coverUrl` estiver definido (URL de imagem), renderizar como `<img>`. Se ambos `null`, usar inicial do nome.

---

### CreateGroupData (atualização)

Campo novo adicionado ao tipo existente em `src/types/group.types.ts`:

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| `emoji` | `string` | não | `undefined` | Emoji selecionado na etapa de identidade do grupo |

---

### GroupCreateSchema (atualização)

Schema Zod em `src/lib/schemas/index.ts`:

```ts
emoji: z.string().emoji('Emoji inválido').optional(),
```

Regra: `emoji` e `coverUrl` são mutuamente exclusivos na UX, mas ambos opcionais no schema.

---

## Estado local (wizard)

O wizard de criação de grupo não persiste estado entre sessões — é local ao componente.
Estado gerenciado via `useState` dentro de `CreateGroupPage`:

| Campo | Tipo | Step |
|-------|------|------|
| `step` | `1 \| 2` | controla qual step exibir |
| `name` | `string` | Step 1 |
| `emoji` | `string \| null` | Step 1 |
| `coverFile` | `File \| null` | Step 1 (upload) |
| `coverUrl` | `string \| null` | Step 1 (preview URL local via `URL.createObjectURL`) |
| `resultPoints` | `number` | Step 2 (default: 1) |
| `exactScorePoints` | `number` | Step 2 (default: 3) |

---

## Fluxo de entrada via código

### JoinGroupPage — estado local

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `rawInput` | `string` | O que o usuário digitou (URL ou código puro) |
| `resolvedCode` | `string \| null` | Código extraído do input (após normalização) |

**Normalização de input**:
- Se contém `invite/` → extrai o segmento após `invite/` como código
- Caso contrário → usa o valor direto como código

**Query TanStack** (enabled: `!!resolvedCode`):
```ts
queryKey: ['invite', resolvedCode]
queryFn: () => resolveInviteCode(resolvedCode!)
```

---

## Regras de navegação

| Condição | Comportamento |
|----------|---------------|
| Usuário autenticado, 0 grupos | `OnboardingGuard` → redirect `/onboarding` |
| Usuário autenticado, ≥ 1 grupo | `OnboardingGuard` → passa para `AppShell` normalmente |
| Usuário em `/onboarding`, já tem grupo | `OnboardingGuard` ainda redireciona de rotas protegidas, mas `/onboarding` em si não tem guard — usuário pode acessar manualmente se quiser |
| Criação de grupo concluída | navigate(`/groups/:newGroupId`) |
| Entrada em grupo concluída | navigate(`/groups/:joinedGroupId`) |
