# 015 — Admin · Armazenamento do servidor

Página de admin **Armazenamento** (`/admin/storage`) que mostra o uso de disco
do servidor: ocupação atual (ao vivo) e o histórico das amostras gravadas a cada
6h pelo backend. Permite comparar **usado vs. total** sem acesso aos logs do host.

## Visão geral

- Cartão de **uso atual**: percentual grande, barra usado/total, GB usados de GB
  totais e GB livres. Cor por faixa: brand `< 75%`, âmbar `< 90%`, vermelho `≥ 90%`.
- **Histórico (% usado)**: gráfico de área em SVG puro (sem lib de chart —
  CLAUDE.md proíbe adicionar dependências sem aprovação), com gridlines 0/25/50/75/100
  e datas da primeira/última amostra.
- **Tabela** das ~16 amostras mais recentes (data, usado, %, variação vs. anterior).
- Botão **Atualizar** (refetch manual).

## Arquivos

| Item | Arquivo |
| --- | --- |
| Página | [`src/pages/admin/AdminServerStoragePage.tsx`](../src/pages/admin/AdminServerStoragePage.tsx) |
| Service | [`src/services/admin.service.ts`](../src/services/admin.service.ts) — `getServerDiskUsage(limit?)`, tipos `DiskUsage`/`DiskSample`/`DiskReport` |
| Rota | [`src/router/index.tsx`](../src/router/index.tsx) — `path: 'storage'` (lazy) |
| Sidebar | [`src/pages/admin/AdminShell.tsx`](../src/pages/admin/AdminShell.tsx) — item "Armazenamento" (ícone `HardDrive`) |

## Dados

```ts
getServerDiskUsage(180) // GET /api/admin/system/disk?limit=180
// → { current: DiskUsage, samples: DiskSample[] }  (samples em ordem cronológica)
```

React Query key `['admin', 'server-disk']`, `refetchOnWindowFocus: false`.
`current` é leitura ao vivo do backend; `samples` é o log persistido.

## Pontos de atenção

- Sessão de **admin do sistema** obrigatória (rota sob `AdminGuard` + guard no
  backend).
- `formatBytes` converte para GB/TB (1 casa); valores chegam em bytes.
- `useMemo` do `recent` fica **antes** do early return de loading (regra dos hooks).
- Backend: [`../../betabet/Doc/019-server-disk-usage.md`](../../betabet/Doc/019-server-disk-usage.md).

## Pontos de alteração futura

- Plotar GB usados (eixo secundário) além do %.
- Tooltip interativo por amostra; seletor de janela (7/30/90 dias).
- Exibir RAM quando o backend passar a coletar.
