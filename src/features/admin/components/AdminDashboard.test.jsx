import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminDashboard from './AdminDashboard'
import { getAllPosts, getUsers } from '../api/adminApi'

vi.mock('../api/adminApi')

const users = [{ id: 1, username: 'adm', email: 'a@a.com', role: 'admin', total_posts: 4, total_published: 2 }]
const posts = [
  { id: 1, title: 'Artikel A', author: { username: 'adm' }, category: 'Umum', is_published: true, created_at: '2026-11-01T00:00:00Z' },
  { id: 2, title: 'Artikel B', category: 'Bisnis', is_published: false, created_at: '2026-11-02T00:00:00Z' },
]

beforeEach(() => {
  vi.resetAllMocks()
  getUsers.mockResolvedValue(users)
  getAllPosts.mockResolvedValue(posts)
})

describe('AdminDashboard', () => {
  it('menampilkan ringkasan, tabel pengguna, dan tab artikel', async () => {
    const user = userEvent.setup()
    render(<AdminDashboard />)
    expect(screen.getByText('Memuat data...')).toBeInTheDocument()
    expect(await screen.findByText('a@a.com')).toBeInTheDocument()
    expect(screen.getByTestId('admin-total-users')).toHaveTextContent('1')
    expect(await screen.findByTestId('admin-total-posts')).toHaveTextContent('2')

    await user.click(screen.getByRole('button', { name: 'Semua artikel' }))
    expect(screen.getByText('Artikel A')).toBeInTheDocument()
    expect(screen.getByText('Terbit')).toBeInTheDocument()
    expect(screen.getByText('Draf')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Pengguna' }))
    expect(screen.getByText('a@a.com')).toBeInTheDocument()
  })

  it('error pada tab pengguna', async () => {
    getUsers.mockRejectedValue(new Error('users gagal'))
    render(<AdminDashboard />)
    expect(await screen.findByRole('alert')).toHaveTextContent('users gagal')
  })

  it('error pada tab artikel', async () => {
    const user = userEvent.setup()
    getAllPosts.mockRejectedValue(new Error('posts gagal'))
    render(<AdminDashboard />)
    await user.click(screen.getByRole('button', { name: 'Semua artikel' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('posts gagal')
  })
})
