import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AiPostGeneratorModal from './AiPostGeneratorModal'
import { aiGenerate } from '../api/blogApi'

vi.mock('../api/blogApi')
vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="viewer">{content}</div>,
}))

const result = {
  title: 'Artikel AI', excerpt: 'Ringkasan', content: '# isi', category: 'Teknologi',
  sources: [{ title: 'Sumber A', url: 'https://a.test' }],
}

beforeEach(() => vi.resetAllMocks())

describe('AiPostGeneratorModal', () => {
  it('validasi topik kosong dan tombol terapkan nonaktif', async () => {
    const user = userEvent.setup()
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Terapkan ke editor' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Hasilkan artikel' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Topik wajib diisi')
    expect(aiGenerate).not.toHaveBeenCalled()
  })

  it('menghasilkan artikel dengan sumber lalu menerapkannya', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    aiGenerate.mockResolvedValue(result)
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={onApply} />)
    await user.type(screen.getByLabelText('Topik artikel'), 'AI di pendidikan')
    await user.click(screen.getByRole('button', { name: 'Hasilkan artikel' }))
    expect(await screen.findByRole('heading', { name: 'Artikel AI' })).toBeInTheDocument()
    expect(aiGenerate).toHaveBeenCalledWith({ topic: 'AI di pendidikan', category: 'Teknologi', include_web_search: true })
    expect(screen.getByRole('link', { name: 'Sumber A' })).toHaveAttribute('href', 'https://a.test')

    await user.click(screen.getByRole('button', { name: 'Terapkan ke editor' }))
    expect(onApply).toHaveBeenCalledWith(result)
  })

  it('opsi search engine dimatikan, kategori diganti, tanpa sumber', async () => {
    const user = userEvent.setup()
    aiGenerate.mockResolvedValue({ ...result, sources: undefined })
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    await user.type(screen.getByLabelText('Topik artikel'), 'Topik')
    await user.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Hasilkan artikel' }))
    await screen.findByRole('heading', { name: 'Artikel AI' })
    expect(aiGenerate).toHaveBeenCalledWith({ topic: 'Topik', category: 'Bisnis', include_web_search: false })
    expect(screen.queryByText('Sumber rujukan')).not.toBeInTheDocument()
  })

  it('menampilkan status loading dan error', async () => {
    const user = userEvent.setup()
    let fail
    aiGenerate.mockReturnValue(new Promise((_, rej) => { fail = rej }))
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    await user.type(screen.getByLabelText('Topik artikel'), 'Topik')
    await user.click(screen.getByRole('button', { name: 'Hasilkan artikel' }))
    expect(screen.getByRole('button', { name: 'Menghasilkan...' })).toBeDisabled()
    fail(new Error('AI sibuk'))
    expect(await screen.findByRole('alert')).toHaveTextContent('AI sibuk')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Hasilkan artikel' })).toBeEnabled())
  })

  it('tombol batal menutup modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AiPostGeneratorModal onClose={onClose} onApply={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
  })
})
