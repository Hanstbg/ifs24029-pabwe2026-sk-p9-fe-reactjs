import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthorDashboard from './AuthorDashboard'
import { createPost, deletePost, getMyPosts, getStats, togglePublish, updatePost } from '../api/blogApi'
import { showConfirmDialog, showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi')
vi.mock('../../../helpers/toolsHelper', async (orig) => ({
  ...(await orig()),
  showSuccessAlert: vi.fn(),
  showErrorAlert: vi.fn(),
  showConfirmDialog: vi.fn(),
}))
vi.mock('../modals/PostModal', () => ({
  default: ({ initial, onClose, onSave }) => (
    <div data-testid="post-modal">
      <span>{initial ? initial.title : 'baru'}</span>
      <button onClick={() => onSave({ title: 'T' })}>stub-save</button>
      <button onClick={onClose}>stub-close</button>
    </div>
  ),
}))
vi.mock('../modals/AiPostGeneratorModal', () => ({
  default: ({ onClose, onApply }) => (
    <div data-testid="ai-modal">
      <button onClick={() => onApply({ title: 'Draf AI', content: 'c' })}>stub-apply</button>
      <button onClick={onClose}>stub-ai-close</button>
    </div>
  ),
}))

const rows = [
  { id: 1, slug: 'satu', title: 'Satu', category: 'Umum', is_published: true, created_at: '2026-11-01T00:00:00Z' },
  { id: 2, slug: 'dua', title: 'Dua', category: 'Bisnis', is_published: false, created_at: '2026-11-02T00:00:00Z' },
]

const openMenu = async (user, title) => user.click(await screen.findByRole('button', { name: `Menu aksi ${title}` }))

beforeEach(() => {
  vi.resetAllMocks()
  getStats.mockResolvedValue({ total: 2, terbit: 1, draf: 1 })
  getMyPosts.mockResolvedValue(rows)
})

describe('AuthorDashboard', () => {
  it('menampilkan statistik dan tabel artikel', async () => {
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByText('Satu')).toBeInTheDocument()
    expect(await screen.findByTestId('stat-total')).toHaveTextContent('2')
  })

  it('keadaan kosong dan error', async () => {
    getMyPosts.mockResolvedValue([])
    getStats.mockRejectedValue(new Error('stat gagal'))
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    expect(await screen.findByText(/Belum ada artikel/)).toBeInTheDocument()
    expect(await screen.findByText('stat gagal')).toBeInTheDocument()
  })

  it('error memuat artikel', async () => {
    getMyPosts.mockRejectedValue(new Error('posts gagal'))
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    expect(await screen.findByText('posts gagal')).toBeInTheDocument()
  })

  it('menambah artikel baru lalu menyegarkan data', async () => {
    const user = userEvent.setup()
    createPost.mockResolvedValue({})
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await user.click(await screen.findByRole('button', { name: /Tambah Artikel/ }))
    expect(await screen.findByText('baru')).toBeInTheDocument()
    await user.click(screen.getByText('stub-save'))
    await waitFor(() => expect(createPost).toHaveBeenCalledWith({ title: 'T' }))
    expect(showSuccessAlert).toHaveBeenCalledWith('Artikel dibuat')
    await waitFor(() => expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument())
    expect(getMyPosts).toHaveBeenCalledTimes(2)
  })

  it('gagal menyimpan: modal tetap terbuka', async () => {
    const user = userEvent.setup()
    createPost.mockRejectedValue(new Error('gagal simpan'))
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await user.click(await screen.findByRole('button', { name: /Tambah Artikel/ }))
    await user.click(screen.getByText('stub-save'))
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal simpan'))
    expect(screen.getByTestId('post-modal')).toBeInTheDocument()
    await user.click(screen.getByText('stub-close'))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()
  })

  it('mengubah artikel lewat menu kebab', async () => {
    const user = userEvent.setup()
    updatePost.mockResolvedValue({})
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await openMenu(user, 'Satu')
    await user.click(screen.getByRole('menuitem', { name: /Ubah/ }))
    expect(screen.getByText('Satu', { selector: 'span' })).toBeInTheDocument()
    await user.click(screen.getByText('stub-save'))
    await waitFor(() => expect(updatePost).toHaveBeenCalledWith(1, { title: 'T' }))
    expect(showSuccessAlert).toHaveBeenCalledWith('Artikel diperbarui')
  })

  it('menu kebab dapat dibuka dan ditutup', async () => {
    const user = userEvent.setup()
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await openMenu(user, 'Satu')
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await openMenu(user, 'Satu')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('toggle status terbit/draf', async () => {
    const user = userEvent.setup()
    togglePublish.mockResolvedValue({})
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await user.click(await screen.findByRole('switch', { name: 'Terbitkan Satu' }))
    await waitFor(() => expect(togglePublish).toHaveBeenCalledWith(1))
    expect(showSuccessAlert).toHaveBeenCalledWith('Artikel dijadikan draf')
    await user.click(screen.getByRole('switch', { name: 'Terbitkan Dua' }))
    await waitFor(() => expect(togglePublish).toHaveBeenCalledWith(2))
    expect(showSuccessAlert).toHaveBeenCalledWith('Artikel diterbitkan')
  })

  it('hapus: batal lalu konfirmasi', async () => {
    const user = userEvent.setup()
    deletePost.mockResolvedValue({})
    showConfirmDialog.mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await openMenu(user, 'Satu')
    await user.click(screen.getByRole('menuitem', { name: /Hapus/ }))
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1))
    expect(deletePost).not.toHaveBeenCalled()

    await openMenu(user, 'Satu')
    await user.click(screen.getByRole('menuitem', { name: /Hapus/ }))
    await waitFor(() => expect(deletePost).toHaveBeenCalledWith(1))
    expect(showSuccessAlert).toHaveBeenCalledWith('Artikel dihapus')
  })

  it('detail: artikel terbit membuka halaman publik, draf menampilkan pesan', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<AuthorDashboard onNavigate={onNavigate} />)
    await openMenu(user, 'Satu')
    await user.click(screen.getByRole('menuitem', { name: /Detail/ }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/satu')

    await openMenu(user, 'Dua')
    await user.click(screen.getByRole('menuitem', { name: /Detail/ }))
    expect(showErrorAlert).toHaveBeenCalledWith(expect.stringContaining('masih draf'))
  })

  it('AI generator: terapkan hasil ke editor, dan tutup', async () => {
    const user = userEvent.setup()
    createPost.mockResolvedValue({})
    render(<AuthorDashboard onNavigate={vi.fn()} />)
    await user.click(await screen.findByRole('button', { name: /AI Generator/ }))
    await user.click(await screen.findByText('stub-ai-close'))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /AI Generator/ }))
    await user.click(await screen.findByText('stub-apply'))
    expect(await screen.findByText('Draf AI')).toBeInTheDocument()
    await user.click(await screen.findByText('stub-save'))
    await waitFor(() => expect(createPost).toHaveBeenCalled())
  })
})
