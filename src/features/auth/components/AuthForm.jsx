import { useState } from 'react'
import useInput from '../../../hooks/useInput'
import { saveSession } from '../../../helpers/apiHelper'
import { showSuccessAlert } from '../../../helpers/toolsHelper'
import { login, register } from '../api/authApi'

const field =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800'

/** Form login/registrasi. onSuccess(user) setelah login; onSuccess(null) setelah registrasi. */
export default function AuthForm({ mode, onSuccess }) {
  const isLogin = mode === 'login'
  const prefix = isLogin ? 'login' : 'register'
  const { values, handleChange } = useInput({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        const { token, user } = await login({ username: values.username, password: values.password })
        saveSession(token, user)
        onSuccess(user)
      } else {
        await register(values)
        showSuccessAlert('Registrasi berhasil, silakan masuk')
        onSuccess(null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      <div>
        <label htmlFor={`${prefix}-username`} className="mb-1 block text-sm font-medium">Username</label>
        <input id={`${prefix}-username`} name="username" className={field} value={values.username} onChange={handleChange} required />
      </div>
      {!isLogin && (
        <div>
          <label htmlFor="register-email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="register-email" name="email" type="email" className={field} value={values.email} onChange={handleChange} required />
        </div>
      )}
      <div>
        <label htmlFor={`${prefix}-password`} className="mb-1 block text-sm font-medium">Password</label>
        <input id={`${prefix}-password`} name="password" type="password" className={field} value={values.password} onChange={handleChange} required />
      </div>
      <button
        id={`${prefix}-submit`}
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-60"
      >
        {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar'}
      </button>
    </form>
  )
}
