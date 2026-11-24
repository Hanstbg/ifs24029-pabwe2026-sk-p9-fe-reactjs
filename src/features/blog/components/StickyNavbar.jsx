import { useState } from 'react'
import { IconMenu2, IconMoon, IconSun, IconX } from '@tabler/icons-react'

export default function StickyNavbar({
  user, theme, accent, accents, onToggleTheme, onAccent, onNavigate, onLogin, onLogout,
}) {
  const [open, setOpen] = useState(false)
  const go = (to) => (e) => {
    e.preventDefault()
    setOpen(false)
    onNavigate(to)
  }
  const link = 'rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800'

  const items = (
    <>
      <a href="/" onClick={go('/')} className={link}>Artikel</a>
      {user && <a href="/author" onClick={go('/author')} className={link}>Workspace</a>}
      {user && user.role === 'admin' && <a href="/admin" onClick={go('/admin')} className={link}>Admin</a>}
      {user ? (
        <button type="button" onClick={() => { setOpen(false); onLogout() }} className={link}>Keluar ({user.username})</button>
      ) : (
        <>
          <button type="button" onClick={() => { setOpen(false); onLogin() }} className={link}>Masuk</button>
          <a href="/register" onClick={go('/register')} className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white">Daftar</a>
        </>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <nav className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <a href="/" onClick={go('/')} className="text-lg font-bold text-[var(--accent)]">Delcom Blog</a>
        <div className="hidden items-center gap-1 md:flex">{items}</div>
        <div className="flex items-center gap-2">
          <select aria-label="Warna aksen" value={accent} onChange={(e) => onAccent(e.target.value)}
            className="rounded-lg border border-slate-300 bg-transparent px-2 py-1 text-sm dark:border-slate-600">
            {accents.map((a) => <option key={a} value={a} className="text-slate-900">{a}</option>)}
          </select>
          <button type="button" aria-label="Ganti tema" onClick={onToggleTheme} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>
          <button type="button" aria-label="Menu" onClick={() => setOpen(!open)} className="rounded-lg p-2 md:hidden">
            {open ? <IconX size={20} /> : <IconMenu2 size={20} />}
          </button>
        </div>
      </nav>
      {open && <div data-testid="mobile-menu" className="flex flex-col gap-1 border-t border-slate-200 px-4 py-2 md:hidden dark:border-slate-800">{items}</div>}
    </header>
  )
}
