import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

type BeforeInstallPromptTestEvent = Event & {
  platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function createBeforeInstallPromptEvent() {
  const prompt = vi.fn().mockResolvedValue(undefined)
  const event = new Event('beforeinstallprompt', { cancelable: true })

  Object.defineProperties(event, {
    platforms: { value: ['web'], configurable: true },
    prompt: { value: prompt, configurable: true },
    userChoice: {
      value: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      configurable: true,
    },
  })

  return { event: event as BeforeInstallPromptTestEvent, prompt }
}

describe('usePwaInstall', () => {
  it('keeps the install prompt when the browser event fires before the hook mounts', async () => {
    vi.resetModules()
    const { startPwaInstallListener, usePwaInstall } = await import('@/hooks/usePwaInstall')
    const { event, prompt } = createBeforeInstallPromptEvent()

    startPwaInstallListener()
    window.dispatchEvent(event)

    const { result } = renderHook(() => usePwaInstall())

    expect(event.defaultPrevented).toBe(true)
    expect(result.current.canInstall).toBe(true)

    await act(async () => {
      await result.current.promptInstall()
    })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(result.current.canInstall).toBe(false)
  })
})
