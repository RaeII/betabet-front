import { useEffect, useRef } from 'react'
import { FootballScene } from './FootballScene'
import ballUrl from './trionda.glb?url'

/**
 * Overlay em tela cheia (position: fixed) que renderiza a bola 3D por cima do
 * layout. `pointer-events: none` mantém o formulário totalmente clicável — o
 * arrasto da bola é tratado via listeners de ponteiro na window.
 *
 * Carregado apenas via lazy import (ver ./index.tsx), então o three.js e o
 * asset .glb não entram no bundle das demais páginas.
 */
export default function FootballOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let scene: FootballScene | null = null
    try {
      scene = new FootballScene({ canvas, ballUrl })
    } catch {
      // sem WebGL: simplesmente não exibe a bola
      scene = null
    }
    return () => scene?.dispose()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 30,
      }}
    />
  )
}
