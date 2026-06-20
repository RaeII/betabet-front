# 014 — Admin: zerar pontos do bolão

Documenta a página de admin **Zerar pontos** (`/admin/reset-points`), que permite
ao admin do sistema zerar os pontos de todos os membros de **um único bolão**.

## Visão geral

- Item "Zerar pontos" (ícone `RotateCcw`) no sidebar do `AdminShell`, entre
  "Campeão" e "API-Football Explorer";
- página `AdminResetPointsPage` espelhando o layout de `AdminChampionPage`:
  busca local por nome + grade de bolões clicáveis (nome + nº de membros) +
  botão destrutivo + `ConfirmDialog`;
- lista os bolões via `listAdminGroups` (`GET /api/admin/groups`, já existente);
- ação via `resetGroupPoints(groupId)` → `POST /api/admin/groups/:groupId/reset-points`
  em `admin.service.ts` (tipo `ResetGroupPointsResult`).

## Comportamento

- Seleção de **um** bolão de cada vez; botão desabilitado sem seleção.
- `ConfirmDialog` destrutivo deixa claro que todos perdem os pontos do ranking
  daquele bolão (partidas + campeão), que os palpites são mantidos e que nenhum
  outro bolão é afetado.
- Toast de sucesso com a contagem (`betsReset`, `championBetsReset`) e o nome do bolão.
- Erro mapeado de `ApiRequestError`.
- `onSuccess` invalida `['admin','groups-analytics']` e `['admin','observer']`
  para o dashboard e a vista de observador refletirem o ranking zerado.

## Pontos de atenção

- Ação restrita ao admin do sistema (sessão `admin_token`); idempotente no backend.
- A página não re-liquida partidas encerradas — ver backend
  [`018-admin-reset-group-points.md`](../../betabet/Doc/018-admin-reset-group-points.md).
- Pontos de alteração futura: confirmação por digitar o nome do bolão, auditoria.
