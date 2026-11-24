import { useCallback, useEffect, useState } from 'react'

export const ACCENTS = ['indigo', 'emerald', 'rose', 'amber']

export default function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [accent, setAccent] = useState(() => localStorage.getItem('accent') || 'indigo')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem('accent', accent)
  }, [accent])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, accent, setAccent, toggleTheme, accents: ACCENTS }
}
