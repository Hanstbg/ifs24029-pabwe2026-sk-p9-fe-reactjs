import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useFetch from './useFetch'

const deferred = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

describe('useFetch', () => {
  it('memuat data lalu reload dan ikut deps', async () => {
    const fn = vi.fn().mockResolvedValue('A')
    const { result, rerender } = renderHook(({ dep }) => useFetch(fn, [dep]), { initialProps: { dep: 1 } })
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.data).toBe('A'))
    expect(result.current.loading).toBe(false)

    act(() => result.current.reload())
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(2))

    rerender({ dep: 2 })
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(3))
  })

  it('menyimpan pesan error', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('gagal'))
    const { result } = renderHook(() => useFetch(fn, []))
    await waitFor(() => expect(result.current.error).toBe('gagal'))
    expect(result.current.data).toBeNull()
  })

  it('mengabaikan hasil sukses setelah unmount', async () => {
    const d = deferred()
    const { unmount } = renderHook(() => useFetch(() => d.promise, []))
    unmount()
    await act(async () => { d.resolve('x'); await d.promise })
  })

  it('mengabaikan hasil gagal setelah unmount', async () => {
    const d = deferred()
    const { unmount } = renderHook(() => useFetch(() => d.promise, []))
    unmount()
    await act(async () => { d.reject(new Error('x')); await d.promise.catch(() => {}) })
  })
})
