# Feature Specification: Onboarding UX & Criação/Entrada em Grupos

**Feature Branch**: `004-onboarding-ux`

**Created**: 2026-05-22

**Status**: Draft

**Input**: Melhorar o frontend com UI/UX mais profissional. Fluxo de onboarding para novos usuários com opções de entrar em grupo ou criar grupo, configuração de pontuação com exemplo visual Brasil x França.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tela de Boas-Vindas no Primeiro Login (Priority: P1)

Um usuário que acabou de criar sua conta vê uma tela de boas-vindas limpa e focada, com uma breve descrição do que é o aplicativo e exatamente duas opções de ação: **Entrar em um Grupo** ou **Criar um Grupo**. Nenhuma outra navegação ou conteúdo é exibido até que ele escolha uma dessas opções.

**Why this priority**: É o ponto de entrada de todos os novos usuários. Sem essa tela, o usuário fica perdido ao fazer login pela primeira vez.

**Independent Test**: Pode ser testado criando uma conta nova, fazendo login e verificando se apenas a tela de boas-vindas com as duas opções é exibida.

**Acceptance Scenarios**:

1. **Given** um usuário que nunca entrou no app após criar a conta, **When** ele faz login, **Then** ele vê uma tela de boas-vindas com descrição do app e apenas as opções "Entrar em um Grupo" e "Criar um Grupo".
2. **Given** a tela de boas-vindas está exibida, **When** o usuário clica fora das opções ou pressiona voltar, **Then** ele permanece na tela de boas-vindas sem conseguir acessar o conteúdo principal do app.
3. **Given** um usuário que já pertence a pelo menos um grupo, **When** ele faz login, **Then** ele vai direto para a tela principal do app (sem ver a tela de boas-vindas).

---

### User Story 2 - Entrar em um Grupo via Link ou Código (Priority: P1)

O usuário escolhe "Entrar em um Grupo" e é levado a uma tela simples onde pode colar um link de convite ou digitar um código de grupo. Ao confirmar, é automaticamente redirecionado para dentro do grupo.

**Why this priority**: Crescimento do app depende de convites. Deve ser o fluxo mais simples possível para não perder usuários no meio do caminho.

**Independent Test**: Pode ser testado gerando um código/link de um grupo existente, usando em uma conta nova e verificando o redirecionamento automático.

**Acceptance Scenarios**:

1. **Given** o usuário está na tela "Entrar em Grupo", **When** ele insere um código válido e confirma, **Then** ele é redirecionado automaticamente para a tela do grupo sem etapas intermediárias.
2. **Given** o usuário está na tela "Entrar em Grupo", **When** ele insere um link de convite válido e confirma, **Then** ele entra no grupo e é redirecionado automaticamente.
3. **Given** o usuário está na tela "Entrar em Grupo", **When** ele insere um código inválido ou expirado, **Then** uma mensagem de erro clara é exibida e ele pode tentar novamente.
4. **Given** o usuário já é membro do grupo cujo código foi inserido, **When** ele tenta entrar, **Then** o sistema informa que ele já é membro e o redireciona para o grupo.

---

### User Story 3 - Criar um Novo Grupo (Priority: P2)

O usuário escolhe "Criar um Grupo" e passa por um fluxo simples de 2 etapas: (1) escolher nome e identidade visual do grupo (imagem ou emoji), (2) configurar as regras de pontuação com um exemplo visual interativo usando Brasil x França.

**Why this priority**: Criação de grupo é a base para toda a dinâmica do app, mas é secundária à entrada via convite.

**Independent Test**: Pode ser testado criando um grupo do início ao fim e verificando se ele aparece na lista de grupos do criador com as configurações corretas.

**Acceptance Scenarios**:

1. **Given** o usuário está no fluxo de criação, **When** ele insere nome do grupo e escolhe um emoji ou faz upload de imagem, **Then** uma prévia visual do grupo é exibida em tempo real.
2. **Given** o usuário está na etapa de configuração de pontuação, **When** ele ajusta as opções de pontos (ex.: acerto de placar exato, acerto de vencedor), **Then** um exemplo ao vivo com "Brasil x França" atualiza automaticamente mostrando quantos pontos cada cenário valeria.
3. **Given** o usuário completa todas as etapas, **When** ele confirma a criação, **Then** o grupo é criado e ele é redirecionado automaticamente para dentro do novo grupo como administrador.
4. **Given** o usuário tenta criar um grupo com nome já usado por ele, **When** ele confirma, **Then** o sistema permite (nomes de grupo não são únicos globalmente) e cria normalmente.

---

### User Story 4 - Exemplo Visual de Pontuação com Brasil x França (Priority: P2)

Durante a configuração de pontuação, o usuário vê um painel interativo estilo "simulador" com uma partida fictícia Brasil x França. Conforme ele ajusta os valores de pontos para cada tipo de acerto, os exemplos numéricos mudam em tempo real para que ele entenda o impacto das configurações.

**Why this priority**: Sem o exemplo visual, o usuário pode configurar pontuações sem entender as implicações, gerando frustração depois.

**Independent Test**: Pode ser testado ajustando cada opção de pontuação e verificando se os números do exemplo Brasil x França mudam corretamente.

**Acceptance Scenarios**:

1. **Given** o usuário está na tela de configuração de pontos, **When** a tela carrega, **Then** ele vê uma partida fictícia "Brasil 2 x 1 França" com pontuação calculada automaticamente conforme as configurações padrão.
2. **Given** o usuário altera o valor de pontos para "acerto de placar exato", **When** o valor é alterado, **Then** o exemplo da partida Brasil x França atualiza imediatamente mostrando a nova pontuação.
3. **Given** o usuário altera o valor de pontos para "acerto apenas do vencedor", **When** o valor é alterado, **Then** o exemplo mostra o cenário correspondente com os pontos corretos.

---

### Edge Cases

- O que acontece se o usuário fechar o app no meio do fluxo de criação de grupo (sem completar)?
- Como o sistema lida se o link de convite apontar para um grupo que foi deletado?
- E se o grupo atingir o limite máximo de membros e outro usuário tentar entrar via link?
- O que acontece se o usuário não inserir nome para o grupo?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE identificar se um usuário está acessando o app pela primeira vez (sem grupos) e exibir a tela de boas-vindas com as opções de onboarding.
- **FR-002**: A tela de boas-vindas DEVE exibir apenas duas opções de ação: "Entrar em um Grupo" e "Criar um Grupo", sem acesso ao restante do app.
- **FR-003**: O usuário DEVE poder entrar em um grupo fornecendo um código alfanumérico ou colando um link de convite.
- **FR-004**: Ao entrar em um grupo com código ou link válido, o sistema DEVE redirecionar o usuário automaticamente para a tela do grupo sem etapas adicionais.
- **FR-005**: O fluxo de criação de grupo DEVE permitir que o usuário defina um nome para o grupo.
- **FR-006**: O fluxo de criação de grupo DEVE permitir que o usuário escolha um emoji ou faça upload de uma imagem como identidade visual do grupo.
- **FR-007**: O fluxo de criação DEVE incluir uma etapa de configuração de pontuação com as opções de pontos para cada tipo de acerto (placar exato, vencedor, empate, etc.).
- **FR-008**: A tela de configuração de pontuação DEVE exibir um exemplo visual ao vivo com a partida fictícia "Brasil x França" que atualiza em tempo real conforme o usuário altera os valores.
- **FR-009**: Ao concluir a criação, o sistema DEVE redirecionar o usuário automaticamente para dentro do novo grupo como administrador.
- **FR-010**: O sistema DEVE exibir mensagens de erro claras e orientativas quando um código/link for inválido ou expirado.
- **FR-011**: Usuários com grupos existentes NÃO DEVEM ver a tela de boas-vindas ao fazer login.

### Key Entities

- **Grupo**: Unidade principal de interação. Possui nome, identidade visual (emoji ou imagem), configurações de pontuação, membros e administrador.
- **Convite**: Código alfanumérico ou link gerado para um grupo específico. Pode ter validade ou limite de usos.
- **Configuração de Pontuação**: Conjunto de regras definidas pelo criador do grupo que determinam quantos pontos cada tipo de acerto vale.
- **Usuário**: Pessoa autenticada. Pode ser membro ou administrador de múltiplos grupos.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Novos usuários completam o onboarding (entrar ou criar grupo) em menos de 2 minutos.
- **SC-002**: 90% dos novos usuários conseguem entrar ou criar um grupo sem precisar de ajuda externa na primeira tentativa.
- **SC-003**: O tempo de redirecionamento automático após entrar em grupo não é percebido pelo usuário (transição fluida, sem tela de carregamento prolongada).
- **SC-004**: 100% dos usuários que completam o fluxo de criação conseguem ajustar ao menos uma opção de pontuação corretamente com base no exemplo visual.
- **SC-005**: A taxa de abandono do fluxo de criação de grupo cai para menos de 15%.

---

## Assumptions

- Considera-se "primeiro login" qualquer sessão em que o usuário não pertença a nenhum grupo ainda.
- O upload de imagem para identidade do grupo suporta os formatos JPEG e PNG com tamanho máximo razoável (5MB).
- A seleção de emoji usa o conjunto de emojis padrão do sistema operacional ou uma biblioteca de emojis populares.
- A partida de exemplo Brasil x França usa um placar fixo (ex.: 2x1) apenas como ilustração, sem valor real.
- As opções de pontuação configuráveis incluem pelo menos: acerto de placar exato, acerto de vencedor, acerto de empate.
- Links de convite expiram após 7 dias ou após o uso padrão, a menos que o administrador configure diferente.
- O sistema já possui autenticação funcional e a lógica de grupos existe no backend.
