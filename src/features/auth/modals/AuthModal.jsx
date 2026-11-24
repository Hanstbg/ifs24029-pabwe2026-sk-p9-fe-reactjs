import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import AuthForm from '../components/AuthForm'

export default function AuthModal({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const handleSuccess = (user) => (user ? onAuthenticated(user) : setMode('login'))

  return (
    <div role="dialog" aria-modal="true" aria-label="Autentikasi" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-[var(--accent)] px-6 py-3 text-white">
          <h2 className="font-semibold">{mode === 'login' ? 'Masuk' : 'Daftar'}</h2>
          <button type="button" aria-label="Tutup" onClick={onClose}><IconX size={20} /></button>
        </div>
        <div className="p-6">
          <AuthForm mode={mode} onSuccess={handleSuccess} />
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="mt-4 w-full text-center text-sm font-semibold text-[var(--accent)]"
          >
            {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </div>
    </div>
  )
}
