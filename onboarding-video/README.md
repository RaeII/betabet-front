# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

crie uma nova cena agora interagindo com as apostas e vendo um partida e o ranking ao vivo
Estilo:
- Fundo totalmente branco
- Componentes isolados, flutuando no espaço
- Sem capturas de tela em tela cheia
- Foco apenas em componentes individuais
- Manter os estilos dos componentes do app
- proporção do vídeo 1:1

- Quero que a cena apareça com o nome e a logo da aplicação "Bolão CLT" @betabet-front/onboarding-video/public/bolao_clt_logo.png , o nome surge com animação de Fade Up , Blur Reveal
Texto começa desfocado e fica nítido.
Opacity Fade
Apenas aparece suavemente.
Soft Scale In
Surge com escala 95% → 100%.

- Depois aparece o card de palpite: @betabet-front/src/pages/home/components/InlineBetCard.tsx 
Onde vai ter um jogo entre Brazil x Argentina 
A logo das seleções estão em  @betabet-front/onboarding-video/public/05_Argentina_AR.svg @betabet-front/onboarding-video/public/10_Brazil_BR.svg 
- O card aparece com uma animação:
Flip Transition
Rotação 3D tipo cartão. 
- Quero que no card de palpite aparece a animação do cursor clicando e colocando 4 x 0 para o brasil
- O usuário clica para ver a detalhes da partida e abre os componentes @betabet-front/src/pages/match-detail/MatchDetailPage.tsx Mostrando placar ao vivo do jogo e pontos ao vivo @betabet-front/src/pages/match-detail/components/LiveScoreboard.tsx  @betabet-front/src/pages/match-detail/components/MatchPointsCard.tsx 
- Mostre o placar se alterando e ficando na mesma aposta do jogador e assim ele ganhando mais pontos
Nessa cena utilize:
-> UI Camera Pan
A câmera desliza horizontalmente ou verticalmente pela interface.
-> Cinematic Camera Move
Movimento suave de câmera com easing.
-> Dolly Zoom
Zoom enquanto a câmera se move para frente.
Muito usado para destacar um componente importante.
-> Push In
Aproximação lenta em um elemento específico.
-> Pull Out
Afasta a câmera para revelar mais contexto.
-> Ken Burns Effect
Pan + zoom suave simultaneamente.
-> Focus Shift
Troca de foco entre componentes diferentes.

- Na proxima cena, mostre um ranking ao vivo trocando de posição com os pontos do usuário de alterando, faça com 5 usuários onde o segundo lugar vai para primeiro e o ultimo sobe para terceiro assim por ordem com um animação de transição.
Utilize o componente @betabet-front/src/pages/group-detail/components/GroupRanking.tsx 

Se quiser utilizar cursor para clique use @betabet-front/onboarding-video/public/cursor.png 

Analise e veja as melhores animações para encaixar na cena
Animation:
- Camera pan between components
- Push in zoom on important elements
- Shared element transitions
- Progressive reveal
- Mask reveal
- Staggered animations
- Spring physics
- Smooth crossfade
- Focus shift
- Parallax depth
- Subtle motion blur

Composition:
- One component appears
- Camera zooms into a specific section
- Transition morphs into the next component
- Continuous cinematic movement
- Elegant easing curves

Renderize com Remotion usando animações gráficas cinematográficas e coreografia de câmera suave. 