/**
 * Pílula "Ao vivo" em vermelho com ponto pulsante. Sinaliza partida em
 * andamento sem depender de cor de tema — mesmo tom usado nos demais
 * indicadores ao vivo do app.
 */
export function LiveDot() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      Ao vivo
    </span>
  )
}
