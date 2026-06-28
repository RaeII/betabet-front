import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useReducedMotion } from './useReducedMotion'

interface ZoomPanOptions {
  /** Escala mínima (afastar). */
  min?: number
  /** Escala máxima (aproximar). */
  max?: number
  /** Fator de cada clique nos botões +/−. */
  zoomStep?: number
  /** Sensibilidade do wheel/trackpad (quanto maior, mais rápido). */
  wheelSensitivity?: number
  /** Teto do zoom-to-fit; 1 evita upscale-blur quando já cabe na tela. */
  fitMaxScale?: number
  /** Escala inicial no mount. 1 = tamanho legível (transborda → arraste explora). */
  initialScale?: number
  /** Vista (scale/tx/ty) a restaurar no mount, no lugar do enquadramento inicial.
   *  Usada ao voltar do detalhe de uma partida para a mesma posição do chaveamento. */
  restoreView?: { scale: number; tx: number; ty: number } | null
  /** Toque limpo (clique sem arraste) dentro do viewport. Recebe o evento para
   *  hit-test (`elementFromPoint`). O click chega no viewport — não nos filhos —
   *  porque o gesto usa `setPointerCapture`, então a detecção do alvo é aqui. */
  onTap?: (e: ReactMouseEvent<HTMLDivElement>) => void
}

interface Transform {
  scale: number
  tx: number
  ty: number
}

const DRAG_THRESHOLD = 6

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

/**
 * Zoom + pan para conteúdo dentro de um viewport de tamanho fixo.
 *
 * - Desktop: botões (`zoomIn`/`zoomOut`/`reset`), ctrl/cmd+wheel e pinça de
 *   trackpad fazem zoom-to-cursor; arrastar com o mouse faz pan.
 * - Mobile: 1 dedo faz pan; 2 dedos fazem pinça com zoom no ponto médio.
 *
 * O conteúdo é transformado com `translate(tx,ty) scale(scale)` e
 * `transform-origin: 0 0`, então `(tx,ty)` é um deslocamento em pixels de tela
 * aplicado *depois* da escala — o que mantém a matemática de foco/clamp simples.
 *
 * Estado commitado (`scale/tx/ty`) vive em React state; o estado efêmero do
 * gesto vive em refs para não re-renderizar a cada frame de ponteiro.
 */
export function useZoomPan(opts: ZoomPanOptions = {}) {
  const {
    min = 0.4,
    max = 2.5,
    zoomStep = 1.2,
    wheelSensitivity = 0.0015,
    fitMaxScale = 1,
    initialScale = 1,
    restoreView = null,
    onTap,
  } = opts

  // onTap pode mudar de identidade a cada render; ref mantém o onClickCapture estável.
  const onTapRef = useRef(onTap)
  onTapRef.current = onTap

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()

  const [t, setT] = useState<Transform>({ scale: 1, tx: 0, ty: 0 })
  const tRef = useRef(t)
  tRef.current = t

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pan = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const pinch = useRef<{ dist: number; midX: number; midY: number } | null>(null)
  const moved = useRef(false)
  const suppressClick = useRef(false)
  const [gesturing, setGesturing] = useState(false)

  const local = (e: { clientX: number; clientY: number }) => {
    const r = viewportRef.current?.getBoundingClientRect()
    return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0) }
  }

  /** Impede que o conteúdo escalado seja arrastado totalmente para fora da tela. */
  const clampTranslate = useCallback((scale: number, tx: number, ty: number) => {
    const vp = viewportRef.current
    const ct = contentRef.current
    if (!vp || !ct) return { tx, ty }
    const vw = vp.clientWidth
    const vh = vp.clientHeight
    const sw = ct.offsetWidth * scale
    const sh = ct.offsetHeight * scale
    const minTx = Math.min(0, vw - sw)
    const maxTx = Math.max(0, vw - sw)
    const minTy = Math.min(0, vh - sh)
    const maxTy = Math.max(0, vh - sh)
    return { tx: clamp(tx, minTx, maxTx), ty: clamp(ty, minTy, maxTy) }
  }, [])

  /** Aplica zoom mantendo o ponto focal (em coords do viewport) fixo na tela. */
  const zoomTo = useCallback(
    (nextScaleRaw: number, fx: number, fy: number) => {
      setT(prev => {
        const nextScale = clamp(nextScaleRaw, min, max)
        const k = nextScale / prev.scale
        const tx = fx - k * (fx - prev.tx)
        const ty = fy - k * (fy - prev.ty)
        const c = clampTranslate(nextScale, tx, ty)
        return { scale: nextScale, tx: c.tx, ty: c.ty }
      })
    },
    [min, max, clampTranslate],
  )

  /** Zoom-to-fit: encaixa o conteúdo inteiro no viewport e centraliza (visão geral). */
  const reset = useCallback(() => {
    const vp = viewportRef.current
    const ct = contentRef.current
    if (!vp || !ct) return
    const vw = vp.clientWidth
    const vh = vp.clientHeight
    const cw = ct.offsetWidth
    const ch = ct.offsetHeight
    if (!cw || !ch) return
    const fit = clamp(Math.min(vw / cw, vh / ch, fitMaxScale), min, max)
    setT({ scale: fit, tx: (vw - cw * fit) / 2, ty: (vh - ch * fit) / 2 })
  }, [min, max, fitMaxScale])

  /**
   * Posição inicial: tamanho legível (`initialScale`), ancorado no canto
   * superior esquerdo (começa nos 16-avos do topo). Quando o conteúdo é maior
   * que o viewport ele transborda — é o que torna o arrastar útil para explorar
   * o chaveamento. Retorna false se ainda não há dimensões.
   */
  const center = useCallback(() => {
    const vp = viewportRef.current
    const ct = contentRef.current
    if (!vp || !ct) return false
    const cw = ct.offsetWidth
    const ch = ct.offsetHeight
    if (!cw || !ch) return false
    const scale = clamp(initialScale, min, max)
    const c = clampTranslate(scale, 0, 0)
    setT({ scale, tx: c.tx, ty: c.ty })
    return true
  }, [initialScale, min, max, clampTranslate])

  /**
   * Restaura uma vista salva (scale/tx/ty), clampeando aos limites atuais.
   * Espelha `center`, mas ancora na posição que o usuário tinha antes de sair
   * para o detalhe da partida. Retorna false se ainda não há dimensões.
   */
  const restore = useCallback(
    (view: { scale: number; tx: number; ty: number }) => {
      const vp = viewportRef.current
      const ct = contentRef.current
      if (!vp || !ct) return false
      if (!ct.offsetWidth || !ct.offsetHeight) return false
      const scale = clamp(view.scale, min, max)
      const c = clampTranslate(scale, view.tx, view.ty)
      setT({ scale, tx: c.tx, ty: c.ty })
      return true
    },
    [min, max, clampTranslate],
  )

  /** Re-clampeia a posição atual (após resize) sem mexer no que o usuário ajustou. */
  const reclamp = useCallback(() => {
    setT(prev => {
      const c = clampTranslate(prev.scale, prev.tx, prev.ty)
      return { ...prev, tx: c.tx, ty: c.ty }
    })
  }, [clampTranslate])

  const zoomIn = useCallback(() => {
    const vp = viewportRef.current
    if (!vp) return
    zoomTo(tRef.current.scale * zoomStep, vp.clientWidth / 2, vp.clientHeight / 2)
  }, [zoomTo, zoomStep])

  const zoomOut = useCallback(() => {
    const vp = viewportRef.current
    if (!vp) return
    zoomTo(tRef.current.scale / zoomStep, vp.clientWidth / 2, vp.clientHeight / 2)
  }, [zoomTo, zoomStep])

  /**
   * Salto horizontal (botões ←/→): rola ~80% da largura do viewport por clique,
   * para o usuário percorrer as fases sem arrastar. `dir` +1 revela o conteúdo à
   * direita (move o conteúdo para a esquerda → tx diminui); −1 faz o inverso.
   * O clamp impede passar das pontas; a transição do transform anima o salto.
   */
  const PAGE_FRACTION = 0.8
  const pageBy = useCallback(
    (dir: 1 | -1) => {
      const vp = viewportRef.current
      if (!vp) return
      const step = vp.clientWidth * PAGE_FRACTION * dir
      setT(prev => {
        const c = clampTranslate(prev.scale, prev.tx - step, prev.ty)
        return { ...prev, tx: c.tx }
      })
    },
    [clampTranslate],
  )
  const pageRight = useCallback(() => pageBy(1), [pageBy])
  const pageLeft = useCallback(() => pageBy(-1), [pageBy])

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    viewportRef.current?.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, local(e))
    moved.current = false
    setGesturing(true)
    if (pointers.current.size === 1) {
      const p = pointers.current.get(e.pointerId)!
      pan.current = { x: p.x, y: p.y, tx: tRef.current.tx, ty: tRef.current.ty }
      pinch.current = null
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = {
        dist: Math.hypot(b.x - a.x, b.y - a.y),
        midX: (a.x + b.x) / 2,
        midY: (a.y + b.y) / 2,
      }
      pan.current = null
    }
  }, [])

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointers.current.has(e.pointerId)) return
      pointers.current.set(e.pointerId, local(e))
      e.preventDefault()

      if (pointers.current.size >= 2 && pinch.current) {
        const [a, b] = [...pointers.current.values()]
        const dist = Math.hypot(b.x - a.x, b.y - a.y)
        const midX = (a.x + b.x) / 2
        const midY = (a.y + b.y) / 2
        const factor = pinch.current.dist ? dist / pinch.current.dist : 1
        const prevMid = pinch.current
        moved.current = true
        setT(prev => {
          const nextScale = clamp(prev.scale * factor, min, max)
          const k = nextScale / prev.scale
          const tx = midX - k * (midX - prev.tx) + (midX - prevMid.midX)
          const ty = midY - k * (midY - prev.ty) + (midY - prevMid.midY)
          const c = clampTranslate(nextScale, tx, ty)
          return { scale: nextScale, tx: c.tx, ty: c.ty }
        })
        pinch.current = { dist, midX, midY }
        return
      }

      if (pointers.current.size === 1 && pan.current) {
        const anchor = pan.current
        const p = pointers.current.get(e.pointerId)!
        const dx = p.x - anchor.x
        const dy = p.y - anchor.y
        if (!moved.current && Math.hypot(dx, dy) > DRAG_THRESHOLD) moved.current = true
        if (!moved.current) return
        // Captura a âncora fora do updater: pan.current pode virar null (pointerup)
        // antes do reducer assíncrono rodar — deref dentro causaria null crash.
        setT(prev => {
          const c = clampTranslate(prev.scale, anchor.tx + dx, anchor.ty + dy)
          return { ...prev, tx: c.tx, ty: c.ty }
        })
      }
    },
    [min, max, clampTranslate],
  )

  const endPointer = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId)
    if (viewportRef.current?.hasPointerCapture(e.pointerId)) {
      viewportRef.current.releasePointerCapture(e.pointerId)
    }

    if (pointers.current.size === 1) {
      // Pinça e um dedo sobe: re-ancora o pan no dedo restante para não saltar.
      const [p] = [...pointers.current.values()]
      pan.current = { x: p.x, y: p.y, tx: tRef.current.tx, ty: tRef.current.ty }
      pinch.current = null
    } else if (pointers.current.size === 0) {
      if (moved.current) suppressClick.current = true
      pan.current = null
      pinch.current = null
      setGesturing(false)
    }
  }, [])

  /**
   * Click após um drag é suprimido (o card não navega sem querer); um toque
   * limpo dispara `onTap`. Tudo aqui porque o `setPointerCapture` do gesto faz
   * o click chegar no viewport, nunca nos cards — então o alvo real é
   * resolvido por quem consome (via `elementFromPoint`).
   */
  const onClickCapture = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onTapRef.current?.(e)
  }, [])

  // Wheel imperativo, não-passivo: o onWheel do React é passivo e ignora
  // preventDefault. ctrl/cmd+wheel (e pinça de trackpad) fazem zoom-to-cursor;
  // wheel puro é deixado em paz para a página rolar normalmente.
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const factor = Math.exp(-e.deltaY * wheelSensitivity)
      zoomTo(tRef.current.scale * factor, e.clientX - r.left, e.clientY - r.top)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomTo, wheelSensitivity])

  // Vista a restaurar é capturada uma vez (no mount): mudanças posteriores na
  // prop não devem rebobinar o que o usuário ajustou depois.
  const restoreViewRef = useRef(restoreView)

  // Posição inicial no mount: restaura a vista salva (volta do detalhe) ou,
  // na falta dela, o enquadramento legível. Em resize só re-clampeia (preserva
  // a exploração do usuário). Se o conteúdo ainda não tem dimensões no 1º run,
  // o ResizeObserver inicializa quando elas chegam.
  useLayoutEffect(() => {
    const vp = viewportRef.current
    const ct = contentRef.current
    if (!vp || !ct) return
    const wanted = restoreViewRef.current
    const init = () => (wanted ? restore(wanted) : center())
    let initialized = init()
    const ro = new ResizeObserver(() => {
      if (pointers.current.size > 0) return
      if (!initialized) initialized = init()
      else reclamp()
    })
    ro.observe(vp)
    ro.observe(ct)
    return () => ro.disconnect()
  }, [center, reclamp, restore])

  const transformStyle: CSSProperties = {
    transform: `translate(${t.tx}px, ${t.ty}px) scale(${t.scale})`,
    transformOrigin: '0 0',
    transition: gesturing || reduced ? 'none' : 'transform 120ms ease-out',
    willChange: 'transform',
  }

  // Há conteúdo escondido além de cada borda? Define a visibilidade dos botões
  // ←/→. O conteúdo escalado começa em x=tx e termina em tx+sw (largura de tela).
  // Recalcula a cada render — `t` muda no pan/zoom, então acompanha as bordas.
  const scaledWidth = (contentRef.current?.offsetWidth ?? 0) * t.scale
  const viewportWidth = viewportRef.current?.clientWidth ?? 0
  const canPanLeft = t.tx < -1
  const canPanRight = t.tx + scaledWidth - viewportWidth > 1

  return {
    scale: t.scale,
    /** Lê a vista corrente (scale/tx/ty) — para salvar antes de navegar fora. */
    getView: useCallback(() => ({ ...tRef.current }), []),
    transformStyle,
    viewportRef,
    contentRef,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onClickCapture,
    },
    zoomIn,
    zoomOut,
    reset,
    /** Salta uma "página" para a direita/esquerda (botões de navegação). */
    pageRight,
    pageLeft,
    /** Há conteúdo oculto à esquerda/direita? Controla a exibição dos botões. */
    canPanLeft,
    canPanRight,
  }
}
