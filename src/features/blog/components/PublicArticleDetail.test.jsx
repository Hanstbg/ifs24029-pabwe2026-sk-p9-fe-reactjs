import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PublicArticleDetail from './PublicArticleDetail'
import { getPublicPost } from '../api/blogApi'

vi.mock('../api/blogApi')
vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="viewer">{content}</div>,
}))

beforeEach(() => vi.resetAllMocks())

describe('PublicArticleDetail', () => {
  it('menampilkan artikel lengkap dengan sampul dan penulis', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    getPublicPost.mockResolvedValue({
      title: 'Judul Besar', category: 'Opini', content: '# isi', cover_image_path: 'https://x.test/a.png',
      published_at: '2026-11-01T00:00:00Z', reading_time: 4, author: { username: 'sari' },
    })
    render(<PublicArticleDetail slug="judul-besar" onNavigate={onNavigate} />)
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Judul Besar' })).toBeInTheDocument()
    expect(screen.getByAltText('Judul Besar')).toBeInTheDocument()
    expect(screen.getByText(/sari/)).toBeInTheDocument()
    expect(screen.getByTestId('viewer')).toHaveTextContent('# isi')
    expect(getPublicPost).toHaveBeenCalledWith('judul-besar')

    await user.click(screen.getByRole('link', { name: /Kembali/ }))
    expect(onNavigate).toHaveBeenCalledWith('/')
  })

  it('artikel tanpa sampul dan tanpa penulis', async () => {
    getPublicPost.mockResolvedValue({ title: 'Polos', category: 'Umum', content: 'x', published_at: null, reading_time: 1 })
    render(<PublicArticleDetail slug="polos" onNavigate={vi.fn()} />)
    expect(await screen.findByRole('heading', { name: 'Polos' })).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText(/Anonim/)).toBeInTheDocument()
  })

  it('menampilkan error bila artikel tidak ditemukan', async () => {
    getPublicPost.mockRejectedValue(new Error('Artikel tidak ditemukan'))
    render(<PublicArticleDetail slug="x" onNavigate={vi.fn()} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Artikel tidak ditemukan')
  })
})
