import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PostModal from './PostModal'

vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange }) => (
    <textarea data-testid="md" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

describe('PostModal', () => {
  it('artikel baru: nilai default dan validasi', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue()
    render(<PostModal initial={null} onClose={vi.fn()} onSave={onSave} />)
    expect(screen.getByRole('heading', { name: 'Tambah artikel' })).toBeInTheDocument()
    expect(screen.getByLabelText('Kategori')).toHaveValue('Umum')

    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Judul dan isi artikel wajib diisi')

    await user.type(screen.getByLabelText('Judul'), 'Judul')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('menyimpan payload lengkap dan menampilkan status menyimpan', async () => {
    const user = userEvent.setup()
    let finish
    const onSave = vi.fn(() => new Promise((r) => { finish = r }))
    render(<PostModal initial={null} onClose={vi.fn()} onSave={onSave} />)
    await user.type(screen.getByLabelText('Judul'), 'Judul')
    await user.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await user.type(screen.getByLabelText('Gambar sampul (URL)'), 'https://x.test/a.png')
    await user.type(screen.getByLabelText('Ringkasan'), 'Ringkas')
    await user.type(screen.getByTestId('md'), 'isi')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(onSave).toHaveBeenCalledWith({
      title: 'Judul', category: 'Bisnis', excerpt: 'Ringkas', cover_image_path: 'https://x.test/a.png', content: 'isi',
    })
    expect(screen.getByRole('button', { name: 'Menyimpan...' })).toBeDisabled()
    finish()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Simpan' })).toBeEnabled())
  })

  it('ubah artikel: form terisi dan tombol batal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const initial = { id: 9, title: 'Lama', category: 'Opini', excerpt: 'E', cover_image_path: 'c', content: 'konten lama' }
    render(<PostModal initial={initial} onClose={onClose} onSave={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Ubah artikel' })).toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toHaveValue('Lama')
    expect(screen.getByTestId('md')).toHaveValue('konten lama')
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('draf AI tanpa id dianggap artikel baru', () => {
    render(<PostModal initial={{ title: 'Draf', content: 'isi' }} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Tambah artikel' })).toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toHaveValue('Draf')
  })
})
