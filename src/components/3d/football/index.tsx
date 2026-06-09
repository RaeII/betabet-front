import { lazy, Suspense } from 'react'

// Lazy import: três.js + o asset .glb só são baixados quando o componente
// é montado (páginas de login/cadastro), nunca nas demais rotas.
const FootballOverlay = lazy(() => import('./FootballOverlay'))

/**
 * Bola de futebol 3D com física, sobreposta ao layout. Renderize uma única
 * vez por página. Não interfere no layout (canvas fixed + pointer-events:none).
 */
export function FootballField() {
  return (
    <Suspense fallback={null}>
      <FootballOverlay />
    </Suspense>
  )
}
