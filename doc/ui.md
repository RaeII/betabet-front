# Diretrizes de UI — Brasil Essencial

> Documentação de identidade visual e regras de interface para uma página web minimalista brasileira, com tema claro/escuro, fonte Plus Jakarta Sans e background em pattern geométrico inspirado na imagem enviada.

---

## 1. Visão geral

A UI **Brasil Essencial** é uma direção visual para uma aplicação web moderna, minimalista e profissional, com presença brasileira sem cair em excesso visual. A interface combina uma base neutra, tipografia geométrica, componentes limpos, tema claro/escuro e um pattern de fundo inspirado em formas angulares, esportivas e brasileiras.

A estética deve transmitir:

- clareza;
- confiança;
- brasilidade contemporânea;
- energia esportiva controlada;
- sofisticação de produto digital;
- sensação premium, mas acessível.

A interface não deve parecer uma arte temática solta. Ela precisa funcionar como **produto web real**, com boa leitura, hierarquia, acessibilidade e consistência entre componentes.

---

## 2. Objetivo da UI

O objetivo da UI é criar uma experiência digital com identidade brasileira, mas mantendo um padrão profissional de produto.

A página deve servir como base para:

- landing page;
- produto SaaS;
- aplicação de apostas/bolão;
- dashboard simples;
- página institucional;
- experiência editorial esportiva;
- plataforma com temática Brasil/Copa.

A interface precisa priorizar:

1. **legibilidade**: texto sempre claro e com contraste adequado;
2. **foco**: poucos elementos competindo pela atenção;
3. **ritmo visual**: espaços amplos, seções bem separadas e composição equilibrada;
4. **identidade**: brasilidade por cor, pattern e geometria, não por clichês;
5. **adaptabilidade**: suporte nativo para tema claro e escuro;
6. **componentização**: regras fáceis de transformar em componentes React reutilizáveis.

---

## 3. Inspirações visuais

### 3.1 Design brasileiro contemporâneo

A inspiração principal vem de uma ideia de brasilidade limpa e estruturada. O visual não usa bandeira literal como elemento central, mas parte de referências brasileiras reconhecíveis: verde, amarelo, azul, branco, geometria, movimento e composição angular.

### 3.2 Athos Bulcão e azulejaria modular

A lógica de pattern, repetição e composição modular se inspira na obra de Athos Bulcão, especialmente nos painéis de azulejos de Brasília. A referência não deve ser copiada literalmente. O que deve ser absorvido é a ideia de:

- módulos repetidos;
- geometria simples;
- sensação de ordem com variação;
- integração entre arte, arquitetura e espaço.

Referência: Archtrends descreve os painéis de Athos Bulcão como composições com formas geométricas que alternam ordem e aleatoriedade, reforçando identidade visual urbana.

### 3.3 Design systems profissionais

A documentação também se inspira em design systems reais. O GOV.BR Design System, por exemplo, reforça que componentes reutilizáveis ajudam a criar consistência visual e funcional entre produtos digitais.

A UI deve seguir esse mesmo pensamento: não é apenas uma composição bonita, mas um sistema com tokens, componentes e regras.

### 3.4 Tema escuro profissional

O tema escuro segue a ideia de superfícies escuras com contraste suficiente. O Material Design recomenda que cores em dark theme mantenham contraste adequado, especialmente em superfícies elevadas. A interface deve evitar preto absoluto em excesso quando isso prejudicar profundidade e leitura.

### 3.5 Acessibilidade WCAG

A UI deve seguir contraste mínimo recomendado pela WCAG: pelo menos **4.5:1** para texto normal e **3:1** para textos grandes ou elementos gráficos importantes.

### 3.6 Fonte Plus Jakarta Sans

A fonte principal é **Plus Jakarta Sans**, uma sans geométrica moderna, adequada para interfaces digitais. A fonte tem personalidade suficiente para marcar a identidade, mas continua limpa e funcional para leitura em produto.

---

## 4. Princípios de design

### 4.1 Minimalismo com presença

A interface deve ser minimalista, mas não vazia. O pattern no fundo adiciona personalidade, enquanto os componentes continuam claros e simples.

**Regra:** o conteúdo sempre tem prioridade sobre a decoração.

### 4.2 Brasilidade sem clichê

Usar referências brasileiras de forma abstrata:

- cores nacionais reinterpretadas;
- formas geométricas;
- pattern esportivo;
- ritmo visual energético;
- curvas e ângulos;
- composição com alto contraste.

Evitar:

- bandeira literal em destaque;
- carnaval genérico;
- praia, coqueiro ou folhagem tropical como decoração padrão;
- excesso de verde/amarelo saturado nos componentes;
- ícones temáticos desnecessários.

### 4.3 Interface primeiro, arte depois

O background pode ser expressivo, mas precisa ficar atrás da hierarquia de interface. Se o usuário notar mais o fundo do que o conteúdo, a aplicação está errada.

### 4.4 Consistência entre temas

Tema claro e escuro devem parecer a mesma marca. Não criar uma UI diferente para cada modo. Apenas adaptar contraste, superfície e opacidade do pattern.

---

## 5. Paleta de cores

A UI trabalha com uma paleta base curta. O sistema de componentes usa essencialmente:

1. neutro;
2. verde;
3. amarelo de suporte.

O pattern de fundo pode conter azul e branco por ser um **asset decorativo inspirado na imagem enviada**, mas essas cores não devem virar cores principais de botões, cards, links ou estados de interface.

### 5.1 Tema claro

| Token            |                    Valor | Uso                            |
| ---------------- | -----------------------: | ------------------------------ |
| `--bg`           |                `#F7F4EC` | fundo principal                |
| `--surface`      |                `#FFFFFF` | cards, header, blocos elevados |
| `--surface-soft` |                `#EFEADF` | áreas secundárias              |
| `--text`         |                `#151713` | texto principal                |
| `--text-muted`   | `rgba(21, 23, 19, 0.66)` | texto auxiliar                 |
| `--border`       | `rgba(21, 23, 19, 0.13)` | bordas discretas               |
| `--brand`        |                `#123D2A` | botão principal, links, marca  |
| `--brand-text`   |                `#F7F4EC` | texto sobre verde              |
| `--support`      |                `#D8A900` | detalhe, foco, marcador        |

### 5.2 Tema escuro

| Token            |                       Valor | Uso                            |
| ---------------- | --------------------------: | ------------------------------ |
| `--bg`           |                   `#0F1110` | fundo principal                |
| `--surface`      |                   `#151713` | cards, header, blocos elevados |
| `--surface-soft` |                   `#1B1E1A` | áreas secundárias              |
| `--text`         |                   `#F7F4EC` | texto principal                |
| `--text-muted`   | `rgba(247, 244, 236, 0.68)` | texto auxiliar                 |
| `--border`       | `rgba(247, 244, 236, 0.12)` | bordas discretas               |
| `--brand`        |                   `#7FBF9A` | botão principal, links, marca  |
| `--brand-text`   |                   `#0F1110` | texto sobre verde claro        |
| `--support`      |                   `#D8A900` | detalhe, foco, marcador        |

### 5.3 Regra de proporção

Usar a paleta na seguinte proporção:

| Cor                    | Proporção aproximada | Função                     |
| ---------------------- | -------------------: | -------------------------- |
| Neutros                |               75–85% | base, leitura, respiro     |
| Verde                  |               10–20% | identidade e ação          |
| Amarelo                |                 3–6% | suporte e destaque pontual |
| Azul/branco do pattern |    apenas decorativo | fundo em baixa opacidade   |

### 5.4 Proibições de cor

Não usar:

- gradiente;
- botão azul;
- card amarelo sólido como padrão;
- texto pequeno amarelo sobre fundo claro;
- mais de uma cor forte competindo na mesma área;
- azul como cor semântica de link se o verde já estiver definido como cor de ação.

---

## 6. Tipografia

### 6.1 Fonte principal

Usar **Plus Jakarta Sans** em toda a interface.

Importação recomendada:

```css
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
```

Fallback:

```css
font-family:
  "Plus Jakarta Sans",
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

### 6.2 Pesos

| Peso | Uso                                 |
| ---: | ----------------------------------- |
|  400 | body text, descrições               |
|  500 | labels, navegação, subtítulos       |
|  600 | títulos, cards, seções              |
|  700 | botões, CTAs, destaque              |
|  800 | uso raro em hero ou números grandes |

### 6.3 Escala tipográfica

| Elemento   | Desktop | Mobile | Peso | Line-height |   Tracking |
| ---------- | ------: | -----: | ---: | ----------: | ---------: |
| Hero title |    72px |   48px |  600 |        1.02 | `-0.055em` |
| H1         |    56px |   40px |  600 |        1.08 | `-0.045em` |
| H2         |    44px |   32px |  600 |        1.12 | `-0.045em` |
| H3         |    24px |   21px |  600 |        1.25 |  `-0.03em` |
| Body large |    20px |   18px |  400 |         1.6 |   `normal` |
| Body       |    16px |   16px |  400 |         1.7 |   `normal` |
| Small      |    14px |   14px |  500 |         1.5 |   `normal` |
| Caption    |    12px |   12px |  600 |         1.4 |   `0.12em` |

### 6.4 Regras tipográficas

- Títulos devem ser curtos e fortes.
- Evitar títulos com muitas quebras de linha artificiais.
- Usar tracking negativo apenas em títulos grandes.
- Texto corrido deve ter line-height confortável.
- Não usar caixa alta em parágrafos.
- Caixa alta é permitida apenas em labels curtas, com letter-spacing alto.

---

## 7. Grid, margem e espaçamento

### 7.1 Grid

| Contexto              | Regra                   |
| --------------------- | ----------------------- |
| Desktop               | grid de 12 colunas      |
| Tablet                | grid de 6 a 8 colunas   |
| Mobile                | grid de 1 coluna        |
| Container máximo      | `1280px`                |
| Container recomendado | `max-w-7xl` no Tailwind |
| Alinhamento           | centralizado            |

### 7.2 Padding lateral

| Breakpoint | Padding lateral |
| ---------- | --------------: |
| Mobile     |          `24px` |
| Tablet     |          `32px` |
| Desktop    | `32px` a `48px` |

Tailwind recomendado:

```tsx
<div className="mx-auto max-w-7xl px-6 lg:px-8" />
```

### 7.3 Padding vertical de seções

| Seção        | Mobile | Desktop |
| ------------ | -----: | ------: |
| Header       |   16px |    16px |
| Hero         |   80px |   112px |
| Seção padrão |   64px |    80px |
| CTA final    |   80px |    96px |

### 7.4 Escala de espaçamento

Usar escala baseada em 8px:

| Token       |  Valor |
| ----------- | -----: |
| `--space-1` |  `4px` |
| `--space-2` |  `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `24px` |
| `--space-6` | `32px` |
| `--space-7` | `48px` |
| `--space-8` | `64px` |
| `--space-9` | `96px` |

---

## 8. Bordas, radius e sombras

### 8.1 Border radius

| Token           |   Valor | Uso                     |
| --------------- | ------: | ----------------------- |
| `--radius-sm`   |  `10px` | inputs pequenos, chips  |
| `--radius-md`   |  `16px` | inputs, blocos internos |
| `--radius-lg`   |  `20px` | cards padrão            |
| `--radius-xl`   |  `24px` | cards grandes           |
| `--radius-2xl`  |  `32px` | containers hero e CTA   |
| `--radius-pill` | `999px` | botões e badges         |

### 8.2 Bordas

Bordas devem ser discretas:

```css
border: 1px solid var(--border);
```

Não usar borda grossa em componentes padrão.

### 8.3 Sombras

A sombra deve ser suave e rara. Preferir elevação por cor de superfície e borda.

Tema escuro:

```css
box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
```

Tema claro:

```css
box-shadow: 0 24px 80px rgba(21, 23, 19, 0.08);
```

---

## 9. Background pattern

### 9.1 Conceito

O fundo usa a imagem enviada como pattern repetido. O resultado deve lembrar uma arte angular brasileira, esportiva e energética, mas com aplicação sutil para não prejudicar a leitura.

### 9.2 Regras do pattern

- Usar a imagem como `background-image`.
- Repetir em `repeat`.
- Tamanho recomendado: `220px 220px`.
- Aplicar baixa opacidade.
- Adicionar camada de overlay neutro por cima.
- No tema escuro, inverter a imagem se ela for originalmente escura/preta.
- O pattern nunca deve ficar acima do conteúdo.
- O pattern deve ter `pointer-events: none`.
- A camada deve estar em `z-index: 0`, com conteúdo em `z-index: 10`.

### 9.3 Configuração recomendada

Tema escuro:

```css
.pattern {
  opacity: 0.12;
  filter: invert(1);
}

.pattern-overlay {
  background-color: rgba(15, 17, 16, 0.58);
}
```

Tema claro:

```css
.pattern {
  opacity: 0.09;
  filter: none;
}

.pattern-overlay {
  background-color: rgba(247, 244, 236, 0.72);
}
```

### 9.4 Quando reduzir o pattern

Reduzir ainda mais a opacidade se:

- o texto perder contraste;
- cards parecerem poluídos;
- a composição ficar esportiva demais;
- houver muitos componentes em tela;
- o usuário precisar preencher formulários.

### 9.5 Quando remover o pattern

Remover ou ocultar em:

- telas de login com formulário denso;
- páginas de checkout;
- tabelas grandes;
- modais críticos;
- páginas com dados financeiros;
- telas de erro ou confirmação importante.

---

## 10. Componentes

### 10.1 Header

O header deve ser fixo ou sticky, com blur sutil e borda inferior.

Regras:

- altura aproximada: `72px`;
- padding vertical: `16px`;
- usar logo simples;
- navegação com links discretos;
- botão de alternância de tema visível;
- evitar header muito alto.

Tema escuro:

```css
background-color: rgba(15, 17, 16, 0.86);
border-bottom: 1px solid rgba(247, 244, 236, 0.12);
backdrop-filter: blur(16px);
```

Tema claro:

```css
background-color: rgba(247, 244, 236, 0.86);
border-bottom: 1px solid rgba(21, 23, 19, 0.13);
backdrop-filter: blur(16px);
```

### 10.2 Botão primário

O botão primário usa a cor de marca.

```css
.button-primary {
  min-height: 48px;
  padding: 0 24px;
  border-radius: 999px;
  background: var(--brand);
  color: var(--brand-text);
  font-weight: 700;
}
```

Regras:

- apenas um botão primário por seção;
- não usar gradiente;
- não usar sombra forte;
- hover pode usar `scale(1.02)` ou leve alteração de opacidade.

### 10.3 Botão secundário

```css
.button-secondary {
  min-height: 48px;
  padding: 0 24px;
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  font-weight: 700;
}
```

### 10.4 Cards

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 28px;
}
```

Regras:

- cards devem ter respiro interno;
- ícones devem ser lineares;
- máximo de 3 cards por linha em desktop;
- não preencher cards com amarelo;
- usar amarelo apenas em pequenos detalhes.

### 10.5 Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
}
```

### 10.6 Inputs

```css
.input {
  min-height: 48px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  padding: 0 16px;
}

.input:focus {
  outline: none;
  border-color: var(--support);
  box-shadow: 0 0 0 4px rgba(216, 169, 0, 0.18);
}
```

---

## 11. Layout da página

### 11.1 Estrutura recomendada

1. Header
2. Hero
3. Seção de conceito
4. Seção de sistema/componentes
5. Seção de paleta
6. CTA final

### 11.2 Hero

Regras:

- título grande;
- subtítulo curto;
- dois CTAs no máximo;
- um mockup/card visual à direita;
- pattern no fundo, nunca dentro do card principal;
- largura máxima do texto: `720px`.

### 11.3 Seções de conteúdo

Regras:

- cada seção deve ter label pequena, título e descrição;
- evitar muitos cards;
- sempre deixar espaço vertical generoso;
- alternar composições para evitar monotonia.

### 11.4 CTA final

Regras:

- fundo com a cor de marca;
- texto centralizado;
- radius grande;
- um botão ou chamada simples;
- não adicionar pattern forte dentro do CTA.

---

## 12. Motion design

A interface usa animações discretas com Framer Motion.

### 12.1 Princípios

- animações devem reforçar hierarquia;
- não animar tudo ao mesmo tempo;
- usar deslocamento vertical pequeno;
- evitar bounce exagerado;
- respeitar `prefers-reduced-motion`.

### 12.2 Timing

| Tipo              | Duração |
| ----------------- | ------: |
| hover             | `160ms` |
| entrada de card   | `450ms` |
| entrada de hero   | `550ms` |
| transição de tema | `300ms` |

Easing recomendado:

```ts
const easeBrasil = [0.2, 0.8, 0.2, 1] as const;
```

### 12.3 Entrada padrão

```tsx
<motion.div
  initial={{ opacity: 0, y: 18 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.55 }}
/>
```

---

## 13. Acessibilidade

### 13.1 Contraste

- Texto normal deve buscar contraste mínimo de `4.5:1`.
- Texto grande deve buscar contraste mínimo de `3:1`.
- Não colocar texto diretamente sobre pattern sem camada de superfície ou overlay.
- Cards devem ter fundo sólido suficiente para leitura.

### 13.2 Foco

Todos os elementos interativos precisam de estado de foco visível.

```css
:focus-visible {
  outline: 2px solid var(--support);
  outline-offset: 3px;
}
```

### 13.3 Semântica

- Usar `<header>`, `<main>`, `<section>`, `<nav>` e `<button>` corretamente.
- Botão de tema deve ter `aria-label`.
- Pattern decorativo deve ter `aria-hidden="true"`.
- Ícones decorativos devem ser ocultos de leitores de tela quando não adicionam informação.

---

## 14. Regras obrigatórias

### Fazer

- Usar Plus Jakarta Sans.
- Manter tema claro e escuro.
- Usar pattern como camada de fundo.
- Manter conteúdo acima do background.
- Usar verde como cor principal de ação.
- Usar amarelo apenas como suporte.
- Garantir contraste antes de publicar.
- Criar componentes reutilizáveis.
- Manter espaçamento generoso.
- Usar bordas finas e radius alto.

### Não fazer

- Não usar gradiente.
- Não usar excesso de cores nos componentes.
- Não usar background competindo com texto.
- Não usar azul como cor principal da UI.
- Não usar amarelo em grandes áreas de texto.
- Não criar cards muito carregados.
- Não usar sombras pesadas.
- Não misturar outras fontes decorativas.
- Não usar ícones de carnaval, praia ou bandeira como solução visual principal.
- Não deixar elementos interativos sem foco visível.

---

## 15. Tokens CSS recomendados

```css
:root {
  --bg: #f7f4ec;
  --surface: #ffffff;
  --surface-soft: #efeadf;
  --text: #151713;
  --text-muted: rgba(21, 23, 19, 0.66);
  --border: rgba(21, 23, 19, 0.13);
  --brand: #123d2a;
  --brand-text: #f7f4ec;
  --support: #d8a900;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
}

[data-theme="dark"] {
  --bg: #0f1110;
  --surface: #151713;
  --surface-soft: #1b1e1a;
  --text: #f7f4ec;
  --text-muted: rgba(247, 244, 236, 0.68);
  --border: rgba(247, 244, 236, 0.12);
  --brand: #7fbf9a;
  --brand-text: #0f1110;
  --support: #d8a900;
}
```

---

## 16. Exemplo de código em React com TypeScript

### 16.1 Estrutura de arquivos

```txt
src/
  assets/
    world-cup-pattern.png
  components/
    PatternBackground.tsx
    ThemeToggle.tsx
    Button.tsx
  pages/
    LandingPage.tsx
  styles/
    tokens.css
```

---

### 16.2 `styles/tokens.css`

```css
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

:root {
  --bg: #f7f4ec;
  --surface: #ffffff;
  --surface-soft: #efeadf;
  --text: #151713;
  --text-muted: rgba(21, 23, 19, 0.66);
  --border: rgba(21, 23, 19, 0.13);
  --brand: #123d2a;
  --brand-text: #f7f4ec;
  --support: #d8a900;
}

[data-theme="dark"] {
  --bg: #0f1110;
  --surface: #151713;
  --surface-soft: #1b1e1a;
  --text: #f7f4ec;
  --text-muted: rgba(247, 244, 236, 0.68);
  --border: rgba(247, 244, 236, 0.12);
  --brand: #7fbf9a;
  --brand-text: #0f1110;
  --support: #d8a900;
}

* {
  box-sizing: border-box;
}

html {
  font-family:
    "Plus Jakarta Sans",
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  background: var(--bg);
  color: var(--text);
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
}

::selection {
  background: var(--support);
  color: #151713;
}

:focus-visible {
  outline: 2px solid var(--support);
  outline-offset: 3px;
}
```

---

### 16.3 `components/PatternBackground.tsx`

```tsx
import patternUrl from "../assets/world-cup-pattern.png";

type PatternBackgroundProps = {
  theme: "light" | "dark";
};

export function PatternBackground({ theme }: PatternBackgroundProps) {
  const isDark = theme === "dark";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${patternUrl})`,
          backgroundRepeat: "repeat",
          backgroundSize: "220px 220px",
          backgroundPosition: "top left",
          opacity: isDark ? 0.12 : 0.09,
          filter: isDark ? "invert(1)" : "none",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundColor: isDark
            ? "rgba(15, 17, 16, 0.58)"
            : "rgba(247, 244, 236, 0.72)",
        }}
      />
    </div>
  );
}
```

---

### 16.4 `components/Button.tsx`

```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition duration-200 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[var(--brand)] text-[var(--brand-text)]",
    secondary:
      "border border-[var(--border)] bg-transparent text-[var(--text)]",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

---

### 16.5 `components/ThemeToggle.tsx`

```tsx
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

type ThemeToggleProps = {
  theme: Theme;
  onChange: (theme: Theme) => void;
};

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={() => onChange(isDark ? "light" : "dark")}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] transition hover:scale-[1.02]"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span>{isDark ? "Claro" : "Escuro"}</span>
    </button>
  );
}
```

---

### 16.6 `pages/LandingPage.tsx`

```tsx
import { useEffect, useState } from "react";
import { ArrowRight, Grid3X3, Layers, CircleDot } from "lucide-react";
import { motion } from "framer-motion";
import { PatternBackground } from "../components/PatternBackground";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "../components/Button";
import "../styles/tokens.css";

type Theme = "light" | "dark";

const cards = [
  {
    title: "Sistema visual enxuto",
    description:
      "Componentes claros, espaçamento consistente e uma paleta controlada para produtos digitais profissionais.",
    icon: Layers,
  },
  {
    title: "Brasil por estrutura",
    description:
      "A identidade aparece em ritmo, geometria e pattern, sem depender de símbolos literais.",
    icon: Grid3X3,
  },
  {
    title: "Tema claro e escuro",
    description:
      "A experiência preserva contraste, leitura e personalidade nos dois modos.",
    icon: CircleDot,
  },
];

export function LandingPage() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <PatternBackground theme={theme} />

      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a
            href="#"
            className="flex items-center gap-3"
            aria-label="Brasil Essencial"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--support)]" />
            </span>
            <span className="text-sm font-bold tracking-tight">
              Brasil Essencial
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--text-muted)] md:flex">
            <a href="#conceito">Conceito</a>
            <a href="#sistema">Sistema</a>
            <a href="#contato">Contato</a>
          </nav>

          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>
      </header>

      <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold">
              <span className="h-1.5 w-8 rounded-full bg-[var(--support)]" />
              Minimalismo brasileiro para web
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] md:text-7xl">
              Design digital com essência brasileira.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--text-muted)] md:text-xl">
              Uma interface minimalista, profissional e memorável, construída
              com poucas cores, alta legibilidade e brasilidade expressa por
              ritmo, forma e precisão.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button>
                Ver conceito
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="secondary">Explorar sistema</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl"
          >
            <div className="mb-4 border-b border-[var(--border)] pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Painel de identidade
              </p>
              <p className="mt-1 text-lg font-semibold">Brasil Essencial</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                <div className="mb-8 h-1 w-12 rounded-full bg-[var(--support)]" />
                <p className="text-3xl font-semibold tracking-[-0.04em]">80%</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  base neutra para leitura, contraste e clareza.
                </p>
              </div>

              <div className="rounded-[1.4rem] bg-[var(--brand)] p-5 text-[var(--brand-text)]">
                <div className="mb-8 h-1 w-12 rounded-full bg-[var(--support)]" />
                <p className="text-3xl font-semibold tracking-[-0.04em]">15%</p>
                <p className="mt-2 text-sm leading-6 opacity-80">
                  verde para marca, navegação e chamadas principais.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="sistema" className="relative z-10 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--brand)]">
            Sistema
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] md:text-5xl">
            Componentes essenciais.
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-7"
                >
                  <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-text)]">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-xl font-semibold tracking-[-0.03em]">
                    {card.title}
                  </h3>
                  <p className="mt-4 leading-7 text-[var(--text-muted)]">
                    {card.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
```

---

## 17. Exemplo de configuração Tailwind

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1.5rem",
        section: "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 18. Checklist de qualidade

Antes de considerar a UI pronta, verificar:

- [ ] A página funciona em tema claro e escuro.
- [ ] A fonte Plus Jakarta Sans está carregando corretamente.
- [ ] O pattern está atrás do conteúdo.
- [ ] O pattern não prejudica a leitura.
- [ ] Não há gradientes.
- [ ] Botões primários usam apenas verde.
- [ ] Amarelo aparece apenas como suporte.
- [ ] Cards têm fundo sólido e borda sutil.
- [ ] O contraste do texto principal é adequado.
- [ ] Elementos interativos têm foco visível.
- [ ] O layout mantém respiro no mobile.
- [ ] O header não cobre conteúdo importante.
- [ ] Ícones são consistentes e lineares.
- [ ] A página não parece carnavalesca ou genérica.
- [ ] A brasilidade aparece por composição, cor e pattern.

---

## 19. Referências

- Plus Jakarta Sans — Google Fonts: https://fonts.google.com/specimen/Plus+Jakarta+Sans
- GOV.BR Design System: https://www.gov.br/ds
- Material Design — Dark Theme: https://m2.material.io/design/color/dark-theme.html
- WCAG — Contrast Minimum: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- Athos Bulcão e azulejaria: https://blog.archtrends.com/athos-bulcao/

---

## 20. Resumo executivo

A UI **Brasil Essencial** é uma interface web minimalista com identidade brasileira sutil. Ela usa Plus Jakarta Sans, tema claro/escuro, paleta controlada, cards limpos, botões arredondados, espaçamento amplo e um pattern geométrico inspirado na imagem enviada. O sistema deve sempre priorizar legibilidade, acessibilidade e consistência de produto. A brasilidade deve aparecer como assinatura visual, não como excesso decorativo.
