# 003 - Replicação de palpites entre grupos

## Objetivo

Este documento descreve como o frontend expõe o **toggle de replicação** em cada
card de partida e como o estado dele (ligado/desligado) controla se um palpite é
replicado para os demais grupos do usuário. O comportamento e a regra de negócio
no servidor estão em `Doc/003-bet-replication.md` no repositório do backend.

---

## Comportamento

Cada card de partida tem um toggle minimalista no **canto inferior esquerdo**,
com uma descrição curta logo abaixo:

- **ligado** → "Replicando para todos os grupos"
- **desligado** → "Somente este grupo"

Regras:

- O toggle é **por card de grupo** e seu estado vem do palpite salvo
  (`userBet.replicate`); quando ainda não há palpite, começa **ligado**.
- Salvar com o toggle **ligado** → o backend grava neste grupo e replica para os
  demais grupos do usuário que não estejam em opt-out.
- Salvar com o toggle **desligado** → grava **somente** neste grupo e marca este
  grupo como opt-out (`replicate = false`); ele deixa de receber replicações de
  outros grupos.
- Ao trocar de grupo ou partida, o toggle é reinicializado com o estado salvo
  daquele card (o card remonta porque sua `key` inclui o id do grupo).

A exclusão de grupos em opt-out é feita **no backend** — o frontend só carrega o
grupo ativo, então ele apenas envia o estado do toggle; quem sabe quais grupos
estão de fora é o servidor.

---

## Fluxo de salvar

Em `InlineBetCard`:

- **Palpite novo** (sem `userBet`) → `usePlaceBet` (`POST /api/bets`) com
  `replicateToAllGroups = <estado do toggle>`.
- **Edição** (já existe `userBet`) → `useEditBet` (`PUT /api/bets/:betId`) com
  `replicate = <estado do toggle>`.

Em ambos os casos, quando o toggle está ligado, é o backend que propaga o placar
para os demais grupos elegíveis.

---

## Estado e tipo

O `Bet` (`src/types/bet.types.ts`) inclui o campo persistido:

```ts
interface Bet {
  // ...
  replicate: boolean // estado do toggle deste palpite no grupo
}
```

`InlineBetCard` inicializa e reseta o toggle a partir desse valor:

```ts
const savedReplicate = match.userBet ? match.userBet.replicate : true
const [replicate, setReplicate] = useState(savedReplicate)
// useEffect reseta home/away/replicate quando muda groupId, match.id ou os valores salvos
```

A atualização otimista (`buildOptimisticBet` em `useBets`) também grava o
`replicate` enviado, para o toggle não "piscar" enquanto a mutation resolve.

> Observação: após uma replicação (toggle ligado), o cache de `matches` de
> todos os grupos é invalidado (`['groups', 'matches']`), pois o backend não
> retorna os grupos afetados na resposta. Sem isso, o `staleTime` padrão (30s)
> mostraria placar antigo ao navegar para outro grupo logo após salvar.

---

## Arquivos relevantes no frontend

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/pages/home/components/InlineBetCard.tsx` | Toggle no card, estado por grupo e decisão `placeBet`/`editBet` |
| `src/types/bet.types.ts` | Campo `replicate` em `Bet`; `PlaceBetRequest.replicateToAllGroups` |
| `src/services/bets.service.ts` | `placeBet` (POST) e `editBet` (PUT) enviando o flag |
| `src/hooks/useBets.ts` | `usePlaceBet`, `useEditBet` e a aposta otimista com `replicate` |
| `tests/unit/components/InlineBetCard.test.tsx` | Cobre default ligado, opt-out, edição com/sem replicação |

---

## Pontos de atenção

- O toggle reflete o que está salvo no servidor; ele não é uma preferência local
  do navegador. Mudar de dispositivo mostra o mesmo estado, pois vem do `userBet`.
- "Replicando para todos os grupos" é a leitura **a partir deste card**: grupos
  que o usuário colocou em opt-out (toggle desligado e salvo) continuam de fora.
- Para tirar um grupo da replicação é preciso **salvar** naquele card com o
  toggle desligado — só desligar visualmente sem salvar não persiste o opt-out.
