import { useCallback, useState } from 'react'

/** State form dua arah: handleChange membaca name & value dari event input. */
export default function useInput(initialValues) {
  const [values, setValues] = useState(initialValues)

  const handleChange = useCallback((e) => {
    const { name, type, checked, value } = e.target
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }, [])

  const setValue = useCallback((name, value) => setValues((prev) => ({ ...prev, [name]: value })), [])
  const reset = useCallback(() => setValues(initialValues), [initialValues])

  return { values, handleChange, setValue, reset }
}
