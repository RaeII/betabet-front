# Bola de futebol 3D nas telas de login e cadastro

Documenta a cena 3D auto-contida que coloca uma bola de futebol (`trionda.glb`)
sobreposta às telas de **login** (`/`) e **cadastro** (`/auth/register`), com
física realista, colisão com os cards/formulário e arrasto por mouse e toque.

A cena foi construída em **three.js puro** (sem react-three-fiber e sem lib de
física externa) e mora numa pasta isolada, sem alterar o layout existente.

## Objetivo e requisitos atendidos

- Bola 3D apenas nas telas de login e cadastro — **nenhuma outra rota** baixa o
  three.js nem o asset `.glb`.
- Física realista: a bola cai do topo ao carregar a página e quica nos cards e
  no formulário; textos sem borda não colidem (a bola passa por cima).
- Arrasto com mouse e com toque, com "arremesso" ao soltar.
- Layout intocado: a cena é um overlay `position: fixed` com
  `pointer-events: none`, então o formulário continua totalmente clicável.

## Arquivos

Pasta própria: `src/components/3d/football/`

| Arquivo | Papel |
|---------|-------|
| `trionda.glb` | Modelo 3D da bola (export Blender glTF 2.0, ~5,2 MB, sem Draco/meshopt). |
| `FootballScene.ts` | Engine: setup do three.js, física 2D em espaço de tela, colisão com o DOM e entrada de ponteiro. Agnóstica de framework. |
| `FootballOverlay.tsx` | Componente React do `<canvas>` em tela cheia; cria/destrói a engine no ciclo de vida. **Default export.** |
| `index.tsx` | Exporta `FootballField`, a fronteira de `lazy()` que isola o chunk. |

Pontos de montagem (única mudança nas páginas):

- `src/pages/auth/LoginPage.tsx` — renderiza `<FootballField />`.
- `src/pages/auth/RegisterPage.tsx` — renderiza `<FootballField />`.

Marcação dos colliders (atributo invisível, **zero** mudança visual):

- `src/pages/auth/components/AuthForm.tsx` — `data-football-collider` no card do formulário.
- `src/pages/auth/components/LoginLandingLayout.tsx` — `data-football-collider` no card do formulário e em cada card de feature (`<li>`).

## Carregamento isolado (code-splitting)

`FootballField` (em `index.tsx`) usa
`React.lazy(() => import('./FootballOverlay'))` dentro de um `<Suspense>`. Como o
import do overlay (e, por transitividade, do three.js + `GLTFLoader` + `trionda.glb`)
é dinâmico, o bundler emite um **chunk separado** carregado só quando o overlay é
montado.

Verificado no build de produção:

- chunk `FootballOverlay-*.js` (~603 kB / ~155 kB gzip) contém o `WebGLRenderer`;
- o bundle principal `index-*.js` **não** contém `WebGLRenderer`/`GLTFLoader`;
- `trionda-*.glb` é emitido como asset separado, referenciado apenas pelo chunk do overlay.

Isso vale mesmo a `RegisterPage` sendo importada de forma eager no
`router/index.tsx` — o `lazy()` adia o código pesado independentemente disso.

## Mapeamento de coordenadas

A engine usa uma `OrthographicCamera` mapeada 1:1 com os pixels da viewport, de
forma que a bola fique exatamente sobre o layout HTML.

- **Mundo = pixels da tela, com Y invertido** (Y para cima): `worldX = screenX`, `worldY = -screenY`.
- Câmera: `left = 0`, `right = innerWidth`, `top = 0`, `bottom = -innerHeight`.
- Retângulos dos colliders (`getBoundingClientRect`, Y para baixo) são convertidos
  para mundo: `xmin = left`, `xmax = right`, `ymin = -bottom`, `ymax = -top`.

`devicePixelRatio` limitado a 2; `renderer` com `alpha: true` e clear color
transparente.

## Física

Simulação 2D em espaço de tela (não usa engine de física 3D — isso permite casar
exatamente com os retângulos do DOM e mantém a stack em three.js puro).

- **Passo fixo** de `1/120 s` com acumulador; `dt` de frame limitado a `0.05 s`
  para evitar "espiral da morte" ao voltar de abas inativas.
- **Gravidade** `2600 px/s²` (eixo `-Y`), com amortecimento do ar.
- **Colisão círculo × AABB**: para cada collider, calcula o ponto mais próximo do
  retângulo ao centro da bola; se houver penetração, corrige a posição e reflete a
  velocidade pela normal com restituição `0,62` e atrito tangencial `0,82`.
  Quando o centro entra no retângulo, empurra pelo eixo de menor penetração.
- **Paredes**: esquerda, direita, **teto** e chão da viewport. A bola quica em
  todas com a mesma restituição. O **teto** (borda superior da tela) impede que a
  bola suba para fora pelo topo, mas só passa a valer **depois** que a bola entra
  na tela pela primeira vez (`enteredField`) — assim a animação inicial de cair
  de fora pelo topo é preservada. O arrasto também é travado no topo (não dá para
  puxar a bola acima da borda superior).
- **Anti-jitter / repouso**: zera micro-velocidades quando a bola está
  praticamente parada sobre **qualquer superfície de apoio** — chão ou card
  (contato com normal apontando para cima), não só o chão.
- **Rotação (giro) como estado físico**: a engine mantém uma velocidade angular
  `omega` (rad/s, eixos de mundo) integrada a cada frame, em vez de derivar o
  spin direto da velocidade. O giro é um **tombamento 3D**: o eixo fica no
  **plano da tela** (X/Y), perpendicular ao movimento (`ω = (vy/R, -vx/R, 0)`),
  então a esfera rola revelando seu volume — não fica achatada girando em torno
  de Z (que dá aparência 2D). Para não exagerar no quique, o alvo usa **só a
  componente tangencial** à superfície de contato: a componente **normal** (o
  impacto vertical do pique) **não** gera giro, então um quique reto não tomba a
  bola, mas qualquer movimento lateral a faz rolar. A intensidade é regulada por
  `SPIN_SCALE` (giro leve). Comportamento:
  - **Em contato**: tomba conforme a velocidade tangencial à superfície.
  - **Sendo arrastada**: tomba seguindo o movimento da mão.
  - **Em voo**: conserva o giro com leve amortecimento do ar, então um arremesso
    continua girando enquanto está no ar.
  - **Em repouso**: o giro é freado rapidamente, então a **bola parada não gira**.
  - **Arrasto parado**: se o ponteiro não se move por um instante, a velocidade
    estimada é zerada — a bola segurada não gira nem é arremessada à toa.

Os colliders são relidos do DOM (`querySelectorAll('[data-football-collider]')`)
**a cada frame**, então a física acompanha automaticamente scroll, resize e a
troca de etapa do formulário (e-mail → código), que altera a altura do card.

## Entrada (mouse e toque)

- Listeners de `pointerdown/move/up/cancel` são registrados na **window** (o
  canvas tem `pointer-events: none`). No `pointerdown`, faz hit-test contra o raio
  da bola; se acertar, inicia o arrasto.
- Durante o arrasto, a bola segue o ponteiro e a velocidade é estimada pela
  variação de posição/tempo; ao soltar, essa velocidade é aplicada (arremesso),
  limitada a `4000 px/s`.
- No toque, um listener de `touchmove` com `{ passive: false }` chama
  `preventDefault()` **apenas enquanto arrasta**, impedindo o scroll da página sem
  atrapalhar gestos normais.

## Ciclo de vida e robustez

- `FootballOverlay` instancia a engine no `useEffect` e chama `dispose()` na
  desmontagem (cancela o `requestAnimationFrame`, remove todos os listeners,
  faz `dispose` de geometrias/materiais e do renderer).
- `visibilitychange` reinicia o relógio ao voltar para a aba, evitando um salto
  grande de simulação.
- **WebGL ausente**: o `new FootballScene(...)` é envolvido em `try/catch`; sem
  WebGL, a bola simplesmente não aparece.
- **Acessibilidade**: respeita `prefers-reduced-motion: reduce` — para quem optou
  por menos movimento, a bola não é montada. O canvas é `aria-hidden`.

## Z-index e sobreposição

O canvas é `position: fixed; inset: 0; z-index: 30`, acima do conteúdo das telas
de auth (que usa `z-10`). A bola é desenhada por cima dos cards/textos, mas só
**colide** com os elementos marcados como collider — textos sem borda não são
marcados, então a bola passa por cima deles.

## Pontos de atenção

- O `.glb` (~5,2 MB) não está no `globPatterns` do Workbox (não é pré-cacheado
  offline); carrega pela rede ao abrir login/cadastro. Não foi alterada a config
  de PWA.
- Os colliders são definidos por `[data-football-collider]`. Para adicionar/remover
  superfícies de colisão, basta marcar/desmarcar elementos com esse atributo — não
  é preciso tocar na engine.
- Reler `getBoundingClientRect` a cada frame é barato para o punhado de cards das
  telas de auth; em telas com muitos colliders, valeria cachear/observar em vez de
  reler por frame.

## Pontos de alteração futura

- Comprimir o `.glb` (Draco/meshopt) para reduzir o chunk.
- Múltiplas bolas ou colisão bola × bola.
- Som/haptics no impacto; efeito de sombra projetada nos cards.
