import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import useTheme from './hooks/useTheme'
import { clearSession, getUser } from './helpers/apiHelper'
import { logout } from './features/auth/api/authApi'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'

// Dimuat saat dibutuhkan (code splitting): Toast UI Editor/Viewer berukuran besar
// sehingga tidak perlu ikut diunduh di halaman daftar artikel / login.
const PublicArticleDetail = lazy(() => import('./features/blog/components/PublicArticleDetail'))
const AuthorDashboard = lazy(() => import('./features/blog/components/AuthorDashboard'))
const AdminDashboard = lazy(() => import('./features/admin/components/AdminDashboard'))

/** Menentukan apakah rute perlu dialihkan (guard akses multi-tier). */
export function getRedirect(path, user) {
  if (path === '/author' && !user) return '/login'
  if (path === '/admin' && (!user || user.role !== 'admin')) return user ? '/' : '/login'
  if ((path === '/login' || path === '/register') && user) return '/author'
  return null
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState(getUser)
  const [showAuth, setShowAuth] = useState(false)
  const { theme, accent, accents, setAccent, toggleTheme } = useTheme()

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to)
    setPath(to)
  }, [])

  const redirect = getRedirect(path, user)
  useEffect(() => {
    if (redirect) {
      window.history.replaceState({}, '', redirect)
      setPath(redirect)
    }
  }, [redirect])

  const handleAuthenticated = (u) => {
    setUser(u)
    setShowAuth(false)
    navigate(u.role === 'admin' ? '/admin' : '/author')
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // sesi lokal tetap dibersihkan walau server tidak dapat dihubungi
    }
    clearSession()
    setUser(null)
    navigate('/')
  }

  let content
  if (redirect) content = null
  else if (path === '/' || path === '/public') content = <PublicArticleList onNavigate={navigate} />
  else if (path.startsWith('/posts/')) content = <PublicArticleDetail slug={decodeURIComponent(path.slice(7))} onNavigate={navigate} />
  else if (path === '/author') content = <AuthorDashboard onNavigate={navigate} />
  else if (path === '/admin') content = <AdminDashboard />
  else if (path === '/login' || path === '/register')
    content = <AuthPage mode={path.slice(1)} onNavigate={navigate} onAuthenticated={handleAuthenticated} />
  else content = <p className="text-center text-slate-500">Halaman tidak ditemukan.</p>

  return (
    <>
      <StickyNavbar
        user={user} theme={theme} accent={accent} accents={accents}
        onToggleTheme={toggleTheme} onAccent={setAccent} onNavigate={navigate}
        onLogin={() => setShowAuth(true)} onLogout={handleLogout}
      />
      <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
        <Suspense fallback={<p className="text-center text-slate-500">Memuat…</p>}>{content}</Suspense>
      </main>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuthenticated={handleAuthenticated} />}
    </>
  )
}
