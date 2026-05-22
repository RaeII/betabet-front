# Feature Specification: Admin Import API Football

**Feature Branch**: `003-admin-import-api-football`

**Created**: 2026-05-21

**Status**: Draft

**Input**: Módulo frontend na área admin para importar e persistir dados da API Football (seleções e partidas) com fluxo lazy de preview → ação de salvar.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Importar Seleções via Admin (Priority: P1)

Um administrador acessa o menu "Importar → Seleções" no painel admin. A página exibe uma descrição do que será carregado e um botão para buscar dados. Ao clicar, o sistema consulta o backend que por sua vez consulta a API Football — sem persistir nada. A lista de seleções retorna com badge "Já existe" para times já cadastrados no banco. O admin pode salvar todas as novas seleções de uma vez ou salvar seleções individuais.

**Why this priority**: Seleções são pré-requisito para importar partidas. Sem times no banco, nenhuma partida pode ser criada. É o primeiro passo obrigatório do fluxo de importação.

**Independent Test**: Acessar `/admin/import/teams`, clicar em "Buscar Seleções", verificar lista com flags de existência, salvar um time individual, confirmar toast de sucesso e badge "Já existe" naquele item.

**Acceptance Scenarios**:

1. **Given** um admin autenticado na página de importação de seleções e nenhum dado carregado, **When** visualiza a página, **Then** vê descrição do conteúdo e botão "Buscar Seleções da API" — sem tabela ou lista visível.

2. **Given** um admin autenticado, **When** clica em "Buscar Seleções da API", **Then** a lista completa das seleções da Copa é exibida, cada uma com nome, bandeira, país, grupo e badge "Já existe" (verde) ou "Nova" (neutro).

3. **Given** a lista carregada com algumas seleções já existentes no banco, **When** admin clica em "Salvar" numa seleção marcada como "Nova", **Then** a seleção é persistida, o badge muda para "Já existe" e um toast de sucesso é exibido.

4. **Given** a lista carregada, **When** admin clica em "Salvar Todas", **Then** apenas as seleções marcadas como "Nova" são persistidas; as já existentes são ignoradas; um toast resume quantas foram criadas e quantas ignoradas.

5. **Given** um admin tenta salvar uma seleção que já existe no banco, **When** a ação é disparada (ex.: via race condition ou double-click), **Then** o sistema exibe uma notificação informando que o time já está cadastrado e nenhuma duplicata é criada.

---

### User Story 2 - Importar Partidas via Admin (Priority: P2)

Um administrador acessa o menu "Importar → Partidas" no painel admin. Vê descrição do que será carregado com aviso de que seleções devem ser importadas primeiro. Ao buscar, a lista de partidas retorna com flags de existência e de times disponíveis no banco. O admin pode salvar partidas individualmente ou todas de uma vez.

**Why this priority**: Partidas são a entidade central para apostas. Dependem de seleções (US1). Só pode ser executado após as seleções estarem cadastradas.

**Independent Test**: Com seleções já importadas (US1), acessar `/admin/import/matches`, buscar partidas, verificar flags `exists` e `teamsImported`, salvar uma partida individual, confirmar criação no banco.

**Acceptance Scenarios**:

1. **Given** um admin na página de importação de partidas sem dados carregados, **When** visualiza a página, **Then** vê descrição, aviso de dependência em seleções e botão "Buscar Partidas da API".

2. **Given** um admin, **When** clica em "Buscar Partidas da API", **Then** a lista de partidas é exibida com: times envolvidos, data/hora, badge "Já existe" se já no banco, badge "Times ausentes" se algum time não foi importado.

3. **Given** uma partida com times já importados e não existente no banco, **When** admin clica em "Salvar" nessa partida, **Then** ela é persistida com sucesso e seu badge muda para "Já existe".

4. **Given** uma partida cujos times ainda não foram importados, **When** admin tenta clicar em "Salvar" nessa partida, **Then** o botão está desabilitado com tooltip explicando quais times precisam ser importados primeiro.

5. **Given** a lista de partidas carregada, **When** admin clica em "Salvar Todas", **Then** apenas partidas com times disponíveis e não existentes no banco são criadas; partidas com times ausentes são listadas no aviso de resultado; um toast resume criadas, ignoradas e puladas.

---

### User Story 3 - Status de Importação (Priority: P3)

Um administrador visualiza no topo das páginas de importação um painel de status mostrando quantos times e partidas já estão no banco comparado ao total disponível na API — para decidir se precisa importar dados faltantes sem ter que carregar a lista completa.

**Why this priority**: Melhora a experiência iterativa sem bloquear as histórias P1/P2. Permite ao admin saber o estado de importação com uma única chamada leve.

**Independent Test**: Após importar 10 times, acessar `/admin/import/teams`, verificar painel de status exibindo "10 / ~48 seleções importadas" sem precisar clicar em "Buscar".

**Acceptance Scenarios**:

1. **Given** um admin autenticado em qualquer página de importação, **When** a página carrega, **Then** um painel de status é exibido automaticamente mostrando: seleções no banco / total da API e partidas no banco / total da API.

2. **Given** banco vazio, **When** admin abre a página de importação, **Then** o painel exibe "0 seleções importadas" e "0 partidas importadas" com os totais de referência da API.

---

### Edge Cases

- O que acontece se a API Football estiver indisponível quando o admin clicar em "Buscar"? → Exibir mensagem de erro clara ("Serviço externo indisponível, tente novamente") sem estado quebrado na UI.
- O que acontece se o admin clicar em "Buscar" múltiplas vezes enquanto a requisição está em andamento? → Botão fica desabilitado/em loading durante a requisição; segundas chamadas são ignoradas.
- O que acontece se "Salvar Todas" for clicado e nenhuma seleção nova existir? → Toast informativo "Nenhuma seleção nova para importar — todas já estão cadastradas."
- O que acontece se uma seleção individual falhar ao salvar (erro 500)? → Toast de erro específico para aquela seleção; as demais permanecem disponíveis para ação.
- O que acontece ao tentar salvar uma partida antes de carregar a lista? → Não é possível — botões de ação só aparecem após o preview ser carregado.
- O que acontece se o admin perde a sessão durante a operação de importação em lote? → Próxima ação retorna tela de login admin; dados já persistidos permanecem salvos.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel admin DEVE ter duas novas entradas de menu na seção "Importar": "Seleções" (rota `/admin/import/teams`) e "Partidas" (rota `/admin/import/matches`).

- **FR-002**: Cada página de importação DEVE exibir inicialmente apenas uma descrição do conteúdo e um botão de busca — sem lista de dados — para evitar chamadas automáticas à API Football.

- **FR-003**: Ao clicar no botão de busca, o sistema DEVE carregar o preview via endpoint de backend correspondente e exibir a lista completa com flag de existência para cada item.

- **FR-004**: Cada item da lista DEVE exibir um badge visual distinguindo "Já existe no banco" de "Novo / disponível para importar".

- **FR-005**: Itens marcados como "Já existe" DEVEM ter o botão "Salvar" desabilitado ou oculto — não é possível sobrescrever dados existentes por este módulo.

- **FR-006**: O admin DEVE poder salvar um item individual clicando no botão "Salvar" daquele item — apenas para itens novos.

- **FR-007**: O admin DEVE poder salvar todos os itens novos de uma vez via botão "Salvar Todas" — itens já existentes são automaticamente ignorados pela operação em lote.

- **FR-008**: Partidas cujos times (home ou away) não estejam importados no banco DEVEM ter o botão "Salvar" desabilitado com indicação visual dos times ausentes.

- **FR-009**: O sistema DEVE exibir um painel de status com as contagens atuais (banco vs. total da API) que carrega automaticamente ao abrir qualquer página de importação.

- **FR-010**: Todas as operações de salvar DEVEM exibir feedback visual (toast/notificação) indicando sucesso, conflito (já existe) ou erro.

- **FR-011**: O botão de busca DEVE mostrar estado de carregamento (loading) durante a requisição e ser desabilitado para evitar chamadas duplicadas.

- **FR-012**: As rotas de importação DEVEM ser protegidas pela mesma guarda de autenticação admin já existente — inacessíveis sem sessão admin válida.

- **FR-013**: A camada de serviço DEVE implementar as 7 chamadas de API correspondentes ao módulo backend: preview de times, importar todos os times, importar time individual, preview de partidas, importar todas as partidas, importar partida individual, status de importação.

### Key Entities

- **TeamPreview**: Seleção retornada pela API Football com flag de existência. Atributos: `apiTeamId` (id externo), `name`, `flagUrl`, `country`, `groupLetter`, `exists` (boolean — indica se já está no banco local).

- **MatchPreview**: Partida retornada pela API Football com flags de estado. Atributos: `apiFixtureId` (id externo), `homeTeam` (TeamPreview), `awayTeam` (TeamPreview), `scheduledAt`, `status`, `phase`, `groupName`, `matchday`, `exists` (boolean), `teamsImported` (boolean — indica se ambos os times já estão no banco).

- **ImportResult**: Resultado de operação de importação em lote. Atributos: `created` (int), `skipped` (int), `total` (int), `errors` (lista de itens que falharam com mensagem).

- **ImportStatus**: Estado atual de importação. Atributos: `teamsInApi` (int), `teamsInDb` (int), `matchesInApi` (int), `matchesInDb` (int).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um admin consegue visualizar o preview completo de seleções e importar todas as novas em uma única ação, com resposta visível em menos de 5 segundos.

- **SC-002**: Um admin consegue visualizar o preview de partidas e importar todas as elegíveis em uma única ação, com resposta visível em menos de 15 segundos.

- **SC-003**: Nenhuma tentativa de importar um item já cadastrado resulta em duplicata no banco — 100% de idempotência em todas as operações de salvar.

- **SC-004**: O painel de status exibe contagens corretas sem necessidade de carregar a lista completa de preview.

- **SC-005**: O admin consegue distinguir visualmente itens novos de itens já importados sem precisar cruzar informações manualmente.

- **SC-006**: Todas as páginas de importação são inacessíveis sem sessão admin válida — 100% das requisições sem sessão redirecionam para login.

- **SC-007**: Qualquer falha de rede ou indisponibilidade da API Football resulta em mensagem de erro clara sem quebrar a interface — o admin pode tentar novamente sem recarregar a página.

---

## Assumptions

- O backend já implementa (ou implementará em paralelo via spec 003-admin-import-api-football) os 7 endpoints de import: `GET /admin/import/status`, `GET /admin/import/teams/preview`, `POST /admin/import/teams`, `POST /admin/import/teams/:apiTeamId`, `GET /admin/import/matches/preview`, `POST /admin/import/matches`, `POST /admin/import/matches/:apiFixtureId`.

- A autenticação admin usa o mesmo mecanismo de sessão via cookie já implementado no projeto — nenhuma mudança de auth é necessária.

- Não há edição ou deleção de dados importados neste módulo — apenas criação. Operações de update serão tratadas em features separadas.

- A paginação da lista de preview não é necessária para v1: o número de seleções (~48) e partidas (~104) é pequeno o suficiente para exibição completa em uma única resposta.

- Estádios são criados automaticamente pelo backend durante a importação de partidas — não há página ou ação separada para estádios no frontend.

- O sistema de notificações (toasts) já existente no projeto é reutilizado para feedback das operações de importação.

- A lista de preview deve ser recarregável pelo admin (botão de refresh) sem recarregar a página inteira, para refletir mudanças feitas entre sessões.
