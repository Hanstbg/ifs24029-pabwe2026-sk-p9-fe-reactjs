import { useCallback, useEffect, useState } from 'react'

/** Memuat data async; hasil usang diabaikan bila deps berubah / komponen unmount. */
export default function useFetch(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true, error: '' }))
    fn()
      .then((data) => {
        if (active) setState({ data, loading: false, error: '' })
      })
      .catch((err) => {
        if (active) setState({ data: null, loading: false, error: err.message })
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, reload }
}
