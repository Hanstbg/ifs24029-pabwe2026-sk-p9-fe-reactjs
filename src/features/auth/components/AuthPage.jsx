import AuthForm from './AuthForm'

export default function AuthPage({ mode, onNavigate, onAuthenticated }) {
  const isLogin = mode === 'login'
  const handleSuccess = (user) => (user ? onAuthenticated(user) : onNavigate('/login'))

  return (
    <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h1 className="mb-1 text-2xl font-bold">{isLogin ? 'Masuk ke Delcom Blog' : 'Buat akun penulis'}</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        {isLogin ? 'Kelola dan terbitkan artikel Anda.' : 'Daftar untuk mulai menulis artikel.'}
      </p>
      <AuthForm mode={mode} onSuccess={handleSuccess} />
      <p className="mt-6 text-center text-sm">
        {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
        <a
          href={isLogin ? '/register' : '/login'}
          onClick={(e) => {
            e.preventDefault()
            onNavigate(isLogin ? '/register' : '/login')
          }}
          className="font-semibold text-[var(--accent)] hover:underline"
        >
          {isLogin ? 'Daftar' : 'Masuk'}
        </a>
      </p>
    </div>
  )
}
