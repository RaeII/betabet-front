import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { useJoinByCode } from '@/hooks/useGroups'
import { server } from '../../mocks/server'

const mockGroup = {
  id: 'group-99',
  name: 'Bolão Teste',
  emoji: null,
  coverUrl: null,
  memberCount: 5,
}

const joinHandlers = [
  http.get('/api/groups/invite/:code', ({ params }) => {
    if (params.code === 'INVALID') {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json({ group: mockGroup })
  }),
  http.post('/api/groups/:groupId/join', () => {
    return HttpResponse.json({ joined: true, pending: false })
  }),
]

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useJoinByCode', () => {
  beforeEach(() => server.use(...joinHandlers))

  it('resolves code, joins group, and returns groupId', async () => {
    const { result } = renderHook(() => useJoinByCode(), { wrapper: makeWrapper() })

    act(() => { result.current.mutate({ code: 'ABC123' }) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.group.id).toBe('group-99')
    expect(result.current.data?.joined).toBe(true)
  })

  it('fails when invite code is invalid', async () => {
    const { result } = renderHook(() => useJoinByCode(), { wrapper: makeWrapper() })

    act(() => { result.current.mutate({ code: 'INVALID' }) })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
