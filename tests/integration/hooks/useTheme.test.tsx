import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTheme } from '@/hooks/useTheme'

function ThemeProbe({ id }: { id: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button type="button" data-testid={id} onClick={toggleTheme}>
      {theme}
    </button>
  )
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.setItem('theme', 'light')
    document.documentElement.removeAttribute('data-theme')
  })

  it('keeps separate consumers synchronized when one toggles the theme', async () => {
    const user = userEvent.setup()

    render(
      <>
        <ThemeProbe id="shell-theme" />
        <ThemeProbe id="menu-theme" />
      </>,
    )

    expect(screen.getByTestId('shell-theme')).toHaveTextContent('light')
    expect(screen.getByTestId('menu-theme')).toHaveTextContent('light')

    await user.click(screen.getByTestId('menu-theme'))

    expect(screen.getByTestId('shell-theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('menu-theme')).toHaveTextContent('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
