import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

const mocks = vi.hoisted(() => ({ editors: [], viewers: [] }))

vi.mock('@toast-ui/editor', () => ({
  default: class {
    constructor(opts) { this.opts = opts; this.destroy = vi.fn(); mocks.editors.push(this) }
    getMarkdown() { return 'hasil-md' }
  },
}))
vi.mock('@toast-ui/editor/dist/toastui-editor-viewer', () => ({
  default: class {
    constructor(opts) { this.opts = opts; this.setMarkdown = vi.fn(); this.destroy = vi.fn(); mocks.viewers.push(this) }
  },
}))

beforeEach(() => { mocks.editors.length = 0; mocks.viewers.length = 0 })

describe('MarkdownEditor', () => {
  it('membuat editor tema terang, meneruskan perubahan, dan destroy saat unmount', () => {
    const onChange = vi.fn()
    const { unmount } = render(<MarkdownEditor value="# Halo" onChange={onChange} />)
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    const editor = mocks.editors[0]
    expect(editor.opts.initialValue).toBe('# Halo')
    expect(editor.opts.previewStyle).toBe('tab')
    expect(editor.opts.theme).toBe('light')
    editor.opts.events.change()
    expect(onChange).toHaveBeenCalledWith('hasil-md')
    unmount()
    expect(editor.destroy).toHaveBeenCalled()
  })

  it('memakai tema gelap bila halaman dark', () => {
    document.documentElement.classList.add('dark')
    render(<MarkdownEditor value="" onChange={() => {}} />)
    expect(mocks.editors[0].opts.theme).toBe('dark')
  })
})

describe('MarkdownViewer', () => {
  it('menampilkan konten, memperbarui, dan destroy saat unmount', () => {
    const { rerender, unmount } = render(<MarkdownViewer content="satu" />)
    const viewer = mocks.viewers[0]
    expect(viewer.opts.initialValue).toBe('satu')
    rerender(<MarkdownViewer content="dua" />)
    expect(viewer.setMarkdown).toHaveBeenLastCalledWith('dua')
    unmount()
    expect(viewer.destroy).toHaveBeenCalled()
  })
})
