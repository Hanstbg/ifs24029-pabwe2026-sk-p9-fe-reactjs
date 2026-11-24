import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Polyfill JSDOM yang dibutuhkan Toast UI Editor
HTMLCanvasElement.prototype.getContext = () => ({})
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }))
document.getSelection =
  document.getSelection ||
  (() => ({ removeAllRanges() {}, addRange() {}, getRangeAt: () => document.createRange() }))

afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.className = ''
})
