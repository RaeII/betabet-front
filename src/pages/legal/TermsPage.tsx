import type { ComponentPropsWithoutRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { getTerms } from '@/services/legal.service'

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-2 text-2xl font-semibold leading-tight text-[var(--text)]">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 border-b border-[var(--border)] pb-2 text-lg font-semibold text-[var(--text)]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 text-base font-semibold text-[var(--text)]">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-3 text-sm leading-7 text-[var(--text)]">{children}</p>
  ),
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5 text-sm leading-7 text-[var(--text)]">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5 text-sm leading-7 text-[var(--text)]">{children}</ol>,
  li: ({ children }) => <li className="text-sm leading-7 text-[var(--text)]">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-[var(--text)]">{children}</strong>,
  a: ({ children, href }: ComponentPropsWithoutRef<'a'>) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-[var(--brand)] underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
}

export function TermsPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['terms'],
    queryFn: getTerms,
  })

  function handleBack() {
    if (window.history.length > 1) navigate(-1)
    else navigate('/auth/register')
  }

  return (
    <main className="min-h-dvh bg-[var(--bg)] px-4 py-8 text-[var(--text)] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-6">
          <ArrowLeft size={16} />
          Voltar
        </Button>

        <section className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8">
          {isLoading && (
            <p className="text-sm text-[var(--text-muted)]">Carregando termos…</p>
          )}

          {isError && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-[var(--danger)]">
                Não foi possível carregar os termos. Tente novamente.
              </p>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Tentar de novo
              </Button>
            </div>
          )}

          {data && (
            <>
              <p className="mb-6 text-xs font-medium text-[var(--text-muted)]">
                Versão {data.version} — atualizado em {data.updatedAt}
              </p>
              <article>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {data.content}
                </ReactMarkdown>
              </article>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
