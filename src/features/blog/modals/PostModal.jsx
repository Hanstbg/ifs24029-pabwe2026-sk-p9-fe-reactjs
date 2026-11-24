import { useState } from 'react'
import MarkdownEditor from '../../../components/MarkdownEditor'
import useInput from '../../../hooks/useInput'

export const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']
const field =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800'

/** Modal layar penuh tambah/ubah artikel. `initial` boleh null (artikel baru) atau data artikel / draf AI. */
export default function PostModal({ initial, onClose, onSave }) {
  const { title = '', category = 'Umum', excerpt = '', cover_image_path = '', content = '' } = initial || {}
  const { values, handleChange } = useInput({ title, category, excerpt, cover_image_path })
  const [body, setBody] = useState(content)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!values.title.trim() || !body.trim()) {
      setError('Judul dan isi artikel wajib diisi')
      return
    }
    setError('')
    setSaving(true)
    await onSave({ ...values, content: body })
    setSaving(false)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Form artikel" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2">
      <form onSubmit={submit} className="flex max-h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="bg-[var(--accent)] px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">{initial && initial.id ? 'Ubah artikel' : 'Tambah artikel'}</h2>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <label htmlFor="post-title" className="mb-1 block text-sm font-medium">Judul</label>
            <input id="post-title" name="title" className={field} value={values.title} onChange={handleChange} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="post-category" className="mb-1 block text-sm font-medium">Kategori</label>
              <select id="post-category" name="category" className={field} value={values.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="post-cover" className="mb-1 block text-sm font-medium">Gambar sampul (URL)</label>
              <input id="post-cover" name="cover_image_path" className={field} value={values.cover_image_path} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label htmlFor="post-excerpt" className="mb-1 block text-sm font-medium">Ringkasan</label>
            <textarea id="post-excerpt" name="excerpt" rows={2} className={field} value={values.excerpt} onChange={handleChange} />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">Isi artikel (Markdown)</span>
            <MarkdownEditor value={body} onChange={setBody} />
          </div>
        </div>
        <div className="flex justify-end gap-3 bg-slate-200 px-6 py-3 dark:bg-slate-800">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-400 px-4 py-2 text-sm">Batal</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
