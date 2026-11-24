import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useInput from './useInput'

describe('useInput', () => {
  it('menangani input teks, checkbox, setValue, dan reset', () => {
    const initial = { name: '', ok: false }
    const { result } = renderHook(() => useInput(initial))

    act(() => result.current.handleChange({ target: { name: 'name', type: 'text', value: 'abc' } }))
    expect(result.current.values.name).toBe('abc')

    act(() => result.current.handleChange({ target: { name: 'ok', type: 'checkbox', checked: true } }))
    expect(result.current.values.ok).toBe(true)

    act(() => result.current.setValue('name', 'xyz'))
    expect(result.current.values.name).toBe('xyz')

    act(() => result.current.reset())
    expect(result.current.values).toEqual(initial)
  })
})
