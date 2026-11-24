import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useTheme from './useTheme'

describe('useTheme', () => {
  it('default light/indigo lalu toggle dan ganti aksen', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(result.current.accent).toBe('indigo')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')

    act(() => result.current.setAccent('rose'))
    expect(document.documentElement.dataset.accent).toBe('rose')
    expect(result.current.accents).toContain('rose')
  })

  it('membaca preferensi tersimpan', () => {
    localStorage.setItem('theme', 'dark')
    localStorage.setItem('accent', 'amber')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.accent).toBe('amber')
  })
})
