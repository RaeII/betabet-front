---
name: betabet-ui-implementation
description: Regras locais para implementar, ajustar ou revisar UI no projeto betabet-front. Use quando Codex trabalhar em componentes React/Tailwind, paginas, formularios, inputs, autocomplete/autofill, estados de foco, mensagens de erro, layout responsivo, tokens de design, motion ou qualquer tela do Betabet que deva seguir doc/ui.md e as decisoes atuais do projeto.
---

# Betabet UI Implementation

## Fonte Local

Antes de alterar UI, leia somente as partes relevantes de `doc/ui.md`. Use esse documento como base de layout, tokens, tipografia, spacing, radius, sombras, motion e acessibilidade.

Esta skill sobrescreve as regras antigas de foco amarelo presentes em `doc/ui.md`: nao implementar `:focus-visible` global, nao usar amarelo (`--support`) em foco de input e nao criar borda/ring amarelo em campos.

## Workflow

1. Localize o componente ou pagina existente e siga o padrao local antes de criar uma abstracao nova.
2. Use tokens CSS existentes (`--bg`, `--surface`, `--surface-soft`, `--text`, `--text-muted`, `--border`, `--brand`, `--brand-text`, `--support`) em vez de cores soltas.
3. Mantenha a UI minimalista: bordas discretas, sombras raras, radius do sistema, hierarquia clara e sem efeitos decorativos extras.
4. Preserve responsividade com dimensoes estaveis, `max-w-7xl`, `px-6 lg:px-8`, grid simples e spacing baseado em 8px.
5. Verifique no final com `rtk rg` para regras proibidas e rode a checagem mais estreita disponivel (`rtk npm run typecheck`, lint ou teste focado). Se usar classes arbitrarias complexas do Tailwind, especialmente seletores de autofill, rode tambem `rtk npm run build` para confirmar a geracao de CSS.

## Inputs E Foco

Implementar inputs com foco minimalista, sem amarelo:

```tsx
'focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand)_10%,transparent)]'
```

Regras:

- Nao adicionar `:focus-visible` em CSS global ou local.
- Nao adicionar `focus-visible:*` em classes Tailwind.
- Nao usar `focus:border-[var(--support)]`, ring amarelo ou shadow amarelo em inputs.
- Usar `--brand` para o foco do input e um halo pequeno/translucido quando necessario.
- Manter `border border-[var(--border)]`, `bg-[var(--surface)]`, texto `--text`, caret `--text`, placeholder `--text-muted`, `min-h-12`, padding horizontal e radius do sistema.

## Labels Flutuantes

O `Input` compartilhado (`src/components/ui/input.tsx`) deve suportar label flutuante no estilo Material UI.

Regras:

- Preferir `label="..."` ou `label={...}` na prop do `Input` em vez de renderizar `<label>` separado acima do campo.
- A label começa dentro do input quando o campo esta vazio e sem foco.
- A label sobe para a linha da borda quando o input recebe foco ou tem valor preenchido.
- A label flutuante deve usar `bg-[var(--surface)]` para abrir respiro visual sobre a borda, `text-[var(--text-muted)]` no estado normal e `text-[var(--brand)]` no foco.
- O input com label deve usar `peer` e placeholder sentinela (`placeholder={placeholder ?? ' '}`) para controlar `peer-placeholder-shown`; quando houver placeholder real, ele deve ficar transparente sem foco e aparecer no foco.
- Manter compatibilidade: se `label` nao for informado, o `Input` continua renderizando apenas o `<input>` com o estilo base.
- Em inputs compactos de placar ou grids estreitos, ainda usar a prop `label`; ajuste largura/alinhamento pelo `className` do `Input`, nao criando label externa.

Exemplo recomendado:

```tsx
<Input
  id="email"
  label="E-mail"
  type="email"
  autoComplete="email"
  value={values.email}
  onChange={handleChange('email')}
  aria-invalid={!!errors.email}
  aria-describedby="email-error"
/>
```

## Autofill E Sugestoes

Quando o navegador preencher um input por sugestao/autocomplete/autofill, o campo deve continuar com a superficie do tema ativo. Nunca deixar o browser impor fundo branco, amarelo ou preto enquanto o input esta preenchido ou focado.

Padrao recomendado para `Input` compartilhado:

```tsx
'[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_var(--surface)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--text)] [&:-webkit-autofill:focus]:[-webkit-box-shadow:0_0_0_1000px_var(--surface)_inset,0_0_0_2px_color-mix(in_srgb,var(--brand)_10%,transparent)]'
```

Regras:

- Usar `--surface` no preenchimento de autofill para respeitar tema claro/escuro.
- Usar `--text` em `-webkit-text-fill-color` e `caret-[var(--text)]` para texto e cursor consistentes.
- No estado `:-webkit-autofill:focus`, preservar o preenchimento com `--surface` e manter o halo minimalista de foco com `--brand`.
- Preferir `[-webkit-box-shadow:...]` para pintar autofill, em vez de `shadow-[...]`, quando houver combinacao com `focus:shadow-*`. Isso evita que o foco sobrescreva o preenchimento e deixe o campo preto/branco indevido.
- Depois de alterar seletores de autofill, rodar `rtk npm run build` para garantir que o Tailwind gerou CSS valido.

## Mensagens E Erros

Informacoes que aparecem depois da interacao, como erro de input, validacao, ajuda contextual ou status de envio, nao devem deslocar outros componentes quando entram ou saem.

Use um destes padroes:

- Em formularios de auth ou formularios densos com `Input` empilhado, preferir um wrapper reutilizavel como `AuthField`: o input fica no fluxo normal e a mensagem fica em camada absoluta logo abaixo dele, dentro de um slot compacto reservado pelo wrapper (`pb-4`, `top-full`, `h-4`). Isso evita salto de layout sem criar espacos grandes entre os campos.
- Em formularios comuns ou menos densos, reserve espaco fixo para cada mensagem desde o render inicial, normalmente com um slot `min-h-4` ou `min-h-5` logo abaixo do input, conforme o ritmo visual da tela.
- Para mensagens temporarias, use camada absoluta/overlay dentro de um container `relative`, sem afetar o fluxo.
- Anime entrada e saida de forma suave com opacidade e pequeno deslocamento (`transition duration-150` ou `duration-200`); evite mudar altura do layout durante a transicao.
- Preserve acessibilidade com `aria-invalid`, `aria-describedby`, `aria-live="polite"` e `aria-atomic="true"` quando fizer sentido.
- Em formularios com botao principal, nao deixar mensagens globais/status criarem distancia excessiva entre o ultimo input e o botao. Agrupe mensagem global e botao no mesmo bloco (`flex flex-col gap-2`) e evite `mt-*` extra no botao.
- O botao de envio deve ficar visualmente conectado aos inputs: use o gap do formulario como ritmo principal e remova margem adicional no botao, salvo quando houver um motivo claro de layout.
- Evite renderizar erro somente com `{error && <span ...>}` entre inputs empilhados; isso deixa os campos proximos demais quando nao ha erro e pode causar salto visual quando a mensagem aparece.
- Evite aumentar o `gap` do formulario para compensar mensagens de erro. O espaco da mensagem pertence ao campo, nao ao ritmo global do formulario.

Exemplo recomendado para auth denso:

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthFieldProps {
  children: ReactNode
  error?: string
  errorId: string
  className?: string
}

export function AuthField({ children, error, errorId, className }: AuthFieldProps) {
  const hasError = Boolean(error)

  return (
    <div className={cn('pb-4', className)}>
      <div className="relative">
        {children}
        <div
          id={errorId}
          className="pointer-events-none absolute inset-x-0 top-full mt-0.5 h-4 overflow-hidden"
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            className={cn(
              'block truncate text-xs font-medium leading-4 text-[var(--danger)] transition duration-150',
              hasError ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
            )}
          >
            {error}
          </span>
        </div>
      </div>
    </div>
  )
}
```

Exemplo de uso em auth:

```tsx
<form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
  <AuthField errorId="email-error" error={errors.email}>
    <Input
      id="email"
      label="E-mail"
      type="email"
      autoComplete="email"
      value={values.email}
      onChange={handleChange('email')}
      aria-invalid={!!errors.email}
      aria-describedby="email-error"
    />
  </AuthField>
</form>
```

Exemplo de slot estavel para formularios menos densos:

```tsx
<div className="flex flex-col gap-1">
  <Input
    id="password"
    label="Senha"
    type="password"
    value={values.password}
    onChange={handleChange('password')}
    aria-invalid={!!errors.password}
    aria-describedby="password-error"
  />
  <div id="password-error" className="min-h-4 overflow-hidden" aria-live="polite" aria-atomic="true">
    <span
      className={`block text-xs font-medium leading-4 text-[var(--danger)] transition duration-150 ${
        errors.password ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
      }`}
    >
      {errors.password}
    </span>
  </div>
</div>
```

Exemplo de mensagem global proxima do botao:

```tsx
<div className="flex flex-col gap-2">
  <div className="min-h-4 overflow-hidden" aria-live="polite" aria-atomic="true">
    <p
      className={`text-xs font-medium leading-4 text-[var(--danger)] transition duration-150 ${
        serverError ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
      }`}
    >
      {serverError}
    </p>
  </div>

  <Button type="submit" className="w-full">
    Entrar
  </Button>
</div>
```

Se `--danger` nao existir nos tokens atuais, confirme o token antes de usar ou adicione-o de forma consistente no sistema.

## Layout E Componentes

Seguir `doc/ui.md` com estas prioridades:

- Neutros dominam a tela; verde e amarelo sao pontuais. Amarelo e detalhe de suporte, nao cor de foco/formulario.
- Plus Jakarta Sans, pesos 400-700 na maior parte da UI, line-height confortavel e tracking normal fora de titulos grandes.
- Em formularios de auth, usar `flex flex-col gap-2` no form e um wrapper de campo compacto como `AuthField` para reservar a area da mensagem com `pb-4`. Nao usar `gap-3` ou `min-h-5` em todos os campos como compensacao para erro, pois isso deixa a tela artificialmente espacada.
- Em formularios empilhados fora de auth, ajustar o ritmo conforme densidade da tela: `gap-2` ou `gap-3` no form e slot estavel `min-h-4` ou `min-h-5` por campo. Nao compensar espacamento com labels externas.
- Cards usam `border: 1px solid var(--border)`, superficie solida e sombra discreta apenas quando houver motivo.
- Nao colocar card dentro de card nem transformar secoes inteiras em cards flutuantes.
- Evitar gradientes, botoes azuis, card amarelo solido, varias cores fortes competindo e texto amarelo pequeno em fundo claro.
- Motion deve ser discreto: hover curto, entrada com opacidade/deslocamento pequeno e respeito a `prefers-reduced-motion`.

## Checklist

Antes de finalizar uma alteracao de UI:

- `rtk rg -n -e ":focus-visible|focus-visible|focus:.*support|216,169,0|216, 169, 0" src`
- Confirmar que erros/status nao empurram layout ao aparecer.
- Confirmar que inputs empilhados nao ficam proximos demais quando nao ha erro; cada campo deve reservar o slot da mensagem quando o formulario puder validar o campo, mas em auth esse slot deve ser compacto (`AuthField`, `pb-4`, `h-4`).
- Confirmar que o espaco entre inputs nao foi inflado artificialmente para acomodar erros; o erro deve pertencer ao campo.
- Confirmar que mensagens globais/status nao afastam demais o botao principal dos inputs.
- Confirmar que inputs com label usam a prop `label` do `Input` e mantem label flutuante dentro do campo, no estilo Material UI.
- Confirmar que foco de input esta visivel, minimalista e sem amarelo.
- Confirmar que autofill/autocomplete mantem fundo `--surface` e texto `--text` no tema claro e escuro, inclusive com foco.
- Rodar `rtk npm run typecheck` ou a verificacao mais estreita aplicavel.
- Rodar `rtk npm run build` quando usar classes arbitrarias complexas do Tailwind, como `:-webkit-autofill` ou propriedades `-webkit-*`.
