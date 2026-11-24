import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App, { getRedirect } from './App'
import { logout } from './features/auth/api/authApi'
import { saveSession } from './helpers/apiHelper'

vi.mock('./features/auth/api/authApi', () => ({ logout: vi.fn() }))
vi.mock('./features/blog/components/PublicArticleList', () => ({ default: () => <div>page-list</div> }))
vi.mock('./features/blog/components/PublicArticleDetail', () => ({ default: ({ slug }) => <div>{`page-detail:${slug}`}</div> }))
vi.mock('./features/blog/components/AuthorDashboard', () => ({ default: () => <div>page-author</div> }))
vi.mock('./features/admin/components/AdminDashboard', () => ({ default: () => <div>page-admin</div> }))
vi.mock('./features/auth/components/AuthPage', () => ({
  default: ({ mode, onNavigate, onAuthenticated }) => (
    <div>
      <span>{`page-auth-${mode}`}</span>
      <button onClick={() => onAuthenticated({ role: 'member', username: 'm' })}>auth-member</button>
      <button onClick={() => onAuthenticated({ role: 'admin', username: 'a' })}>auth-admin</button>
      <button onClick={() => onNavigate('/')}>auth-home</button>
    </div>
  ),
}))
vi.mock('./features/auth/modals/AuthModal', () => ({
  default: ({ onClose, onAuthenticated }) => (
    <div>
      <span>modal-auth</span>
      <button onClick={onClose}>modal-close</button>
      <button onClick={() => onAuthenticated({ role: 'member', username: 'm' })}>modal-ok</button>
    </div>
  ),
}))

const go = (path) => window.history.pushState({}, '', path)
const loginAs = (role) => saveSession('tok', { username: 'u', role })

beforeEach(() => vi.resetAllMocks())
afterEach(() => go('/'))

describe('getRedirect', () => {
  it('guard rute', () => {
    expect(getRedirect('/author', null)).toBe('/login')
    expect(getRedirect('/admin', null)).toBe('/login')
    expect(getRedirect('/admin', { role: 'member' })).toBe('/')
    expect(getRedirect('/admin', { role: 'admin' })).toBeNull()
    expect(getRedirect('/login', { role: 'member' })).toBe('/author')
    expect(getRedirect('/register', { role: 'member' })).toBe('/author')
    expect(getRedirect('/', null)).toBeNull()
  })
})

describe('App routing', () => {
  it.each(['/', '/public'])('%s menampilkan daftar artikel', (p) => {
    go(p)
    render(<App />)
    expect(screen.getByText('page-list')).toBeInTheDocument()
  })

  it('/posts/:slug menampilkan detail', async () => {
    go('/posts/halo%20dunia')
    render(<App />)
    expect(await screen.findByText('page-detail:halo dunia')).toBeInTheDocument()
  })

  it('/author: tamu dialihkan ke login, penulis masuk', async () => {
    go('/author')
    const { unmount } = render(<App />)
    expect(await screen.findByText('page-auth-login')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
    unmount()

    loginAs('member')
    go('/author')
    render(<App />)
    expect(await screen.findByText('page-author')).toBeInTheDocument()
  })

  it('/admin: tamu ke login, member ke beranda, admin masuk', async () => {
    go('/admin')
    const first = render(<App />)
    expect(await screen.findByText('page-auth-login')).toBeInTheDocument()
    first.unmount()

    loginAs('member')
    go('/admin')
    const second = render(<App />)
    expect(await screen.findByText('page-list')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
    second.unmount()

    loginAs('admin')
    go('/admin')
    render(<App />)
    expect(await screen.findByText('page-admin')).toBeInTheDocument()
  })

  it('/register untuk tamu; /login untuk user terautentikasi dialihkan', async () => {
    go('/register')
    const first = render(<App />)
    expect(screen.getByText('page-auth-register')).toBeInTheDocument()
    first.unmount()

    loginAs('member')
    go('/login')
    render(<App />)
    expect(await screen.findByText('page-author')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/author')
  })

  it('rute tidak dikenal', () => {
    go('/tidak-ada')
    render(<App />)
    expect(screen.getByText('Halaman tidak ditemukan.')).toBeInTheDocument()
  })

  it('mengikuti event popstate', async () => {
    loginAs('admin')
    render(<App />)
    expect(screen.getByText('page-list')).toBeInTheDocument()
    act(() => {
      go('/admin')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(await screen.findByText('page-admin')).toBeInTheDocument()
  })
})

describe('App autentikasi', () => {
  it('modal login dari navbar: tutup, lalu login sebagai member', async () => {
    const user = userEvent.setup()
    go('/')
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    await user.click(screen.getByText('modal-close'))
    expect(screen.queryByText('modal-auth')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    await user.click(screen.getByText('modal-ok'))
    expect(await screen.findByText('page-author')).toBeInTheDocument()
    expect(screen.queryByText('modal-auth')).not.toBeInTheDocument()
  })

  it('AuthPage: login admin ke /admin dan navigasi ke beranda', async () => {
    const user = userEvent.setup()
    go('/login')
    render(<App />)
    await user.click(screen.getByText('auth-home'))
    expect(await screen.findByText('page-list')).toBeInTheDocument()

    go('/login')
    act(() => window.dispatchEvent(new PopStateEvent('popstate')))
    await user.click(await screen.findByText('auth-admin'))
    expect(await screen.findByText('page-admin')).toBeInTheDocument()
  })

  it('logout berhasil membersihkan sesi', async () => {
    const user = userEvent.setup()
    loginAs('member')
    logout.mockResolvedValue({})
    go('/author')
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Keluar/ }))
    await waitFor(() => expect(screen.getByText('page-list')).toBeInTheDocument())
    expect(localStorage.getItem('delcom_blog_token')).toBeNull()
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument()
  })

  it('logout tetap membersihkan sesi walau server gagal', async () => {
    const user = userEvent.setup()
    loginAs('member')
    logout.mockRejectedValue(new Error('offline'))
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Keluar/ }))
    await waitFor(() => expect(localStorage.getItem('delcom_blog_token')).toBeNull())
  })

  it('navigasi lewat tautan navbar', async () => {
    const user = userEvent.setup()
    loginAs('member')
    go('/tidak-ada')
    render(<App />)
    await user.click(screen.getAllByRole('link', { name: 'Artikel' })[0])
    expect(screen.getByText('page-list')).toBeInTheDocument()
  })
})
