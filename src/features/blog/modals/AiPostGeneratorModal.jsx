import { useState } from 'react'
import { IconSparkles } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import useInput from '../../../hooks/useInput'
import { aiGenerate } from '../api/blogApi'
import { CATEGORIES } from './PostModal'

const field =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800'

/** Modal layar penuh AI Blog Generator dengan opsi penelusuran Search Engine. */
export default function AiPostGeneratorModal({ onClose, onApply }) {
  const { values, handleChange } = useInput({ topic: '', category: 'Teknologi', includeSearch: true })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!values.topic.trim()) {
      setError('Topik wajib diisi')
      return
    }
    setError('')
    setLoading(true)
    try {
      setResult(await aiGenerate({ topic: values.topic, category: values.category, include_web_search: values.includeSearch }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="AI Generator" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2">
      <div className="flex max-h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center gap-2 bg-[var(--accent)] px-6 py-4 text-white">
          <IconSparkles size={20} />
          <h2 className="text-lg font-semibold">AI Blog Generator</h2>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <label htmlFor="ai-topic" className="mb-1 block text-sm font-medium">Topik artikel</label>
            <input id="ai-topic" name="topic" className={field} value={values.topic} onChange={handleChange} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="ai-category" className="mb-1 block text-sm font-medium">Kategori</label>
              <select id="ai-category" name="category" className={field} value={values.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input type="checkbox" name="includeSearch" checked={values.includeSearch} onChange={handleChange} />
              Sertakan penelusuran Search Engine (fakta terkini)
            </label>
          </div>
          <button type="button" onClick={generate} disabled={loading} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-slate-200 dark:text-slate-900">
            {loading ? 'Menghasilkan...' : 'Hasilkan artikel'}
          </button>

          {result && (
            <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="text-xl font-bold">{result.title}</h3>
              <p className="text-sm text-slate-500">{result.excerpt}</p>
              <MarkdownViewer content={result.content} />
              {result.sources && result.sources.length > 0 && (
                <div>
                  <h4 className="mb-1 font-semibold">Sumber rujukan</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {result.sources.map((s) => (
                      <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">{s.title}</a></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 bg-slate-200 px-6 py-3 dark:bg-slate-800">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-400 px-4 py-2 text-sm">Batal</button>
          <button type="button" disabled={!result} onClick={() => onApply(result)} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Terapkan ke editor
          </button>
        </div>
      </div>
    </div>
  )
}
