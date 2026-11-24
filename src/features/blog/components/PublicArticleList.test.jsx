import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PublicArticleList from './PublicArticleList'
import { getCategories, getPublicPosts } from '../api/blogApi'

vi.mock('../api/blogApi')

const posts = [
  { id: 1, slug: 'react-dasar', title: 'React Dasar', category: 'Teknologi', excerpt: 'Ringkas', published_at: '2026-11-01T00:00:00Z', reading_time: 3, author: { username: 'budi' } },
  { id: 2, slug: 'tanpa-penulis', title: 'Tanpa Penulis', category: 'Umum', excerpt: 'Lain', published_at: '2026-11-02T00:00:00Z', reading_time: 1 },
]

beforeEach(() => {
  vi.resetAllMocks()
  getCategories.mockResolvedValue(['Teknologi', 'Bisnis'])
  getPublicPosts.mockResolvedValue(posts)
})

describe('PublicArticleList', () => {
  it('menampilkan artikel, memfilter, mencari, dan membuka detail', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<PublicArticleList onNavigate={onNavigate} />)
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByText('React Dasar')).toBeInTheDocument()
    expect(screen.getByText(/budi/)).toBeInTheDocument()
    expect(screen.getByText(/Anonim/)).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Teknologi' }))
    expect(getPublicPosts).toHaveBeenLastCalledWith({ q: '', category: 'Teknologi' })
    await user.click(screen.getByRole('button', { name: 'Semua' }))
    expect(getPublicPosts).toHaveBeenLastCalledWith({ q: '', category: '' })

    await user.type(screen.getByLabelText('Cari artikel'), 're')
    expect(getPublicPosts).toHaveBeenLastCalledWith({ q: 're', category: '' })

    await user.click(await screen.findByRole('link', { name: 'React Dasar' }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/react-dasar')
  })

  it('menampilkan keadaan kosong', async () => {
    getPublicPosts.mockResolvedValue([])
    render(<PublicArticleList onNavigate={vi.fn()} />)
    expect(await screen.findByText(/Tidak ada artikel yang cocok/)).toBeInTheDocument()
  })

  it('menampilkan error', async () => {
    getPublicPosts.mockRejectedValue(new Error('Server mati'))
    render(<PublicArticleList onNavigate={vi.fn()} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Server mati')
  })
})
