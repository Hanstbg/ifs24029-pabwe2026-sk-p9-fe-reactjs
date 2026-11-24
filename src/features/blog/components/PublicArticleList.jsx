import { useState } from 'react'
import { IconSearch } from '@tabler/icons-react'
import useFetch from '../../../hooks/useFetch'
import { toList } from '../../../helpers/apiHelper'
import { formatDate } from '../../../helpers/toolsHelper'
import { getCategories, getPublicPosts } from '../api/blogApi'

export default function PublicArticleList({ onNavigate }) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const cats = useFetch(getCategories, [])
  const posts = useFetch(() => getPublicPosts({ q, category }), [q, category])
  const categories = toList(cats.data, 'categories')
  const rows = toList(posts.data, 'posts')

  const pill = (active) =>
    `rounded-full border px-4 py-1.5 text-sm ${active
      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
      : 'border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800'}`

  return (
    <section className="mx-auto w-full max-w-6xl">
      <h1 className="mb-1 text-3xl font-bold">Artikel terbaru</h1>
      <p className="mb-6 text-slate-500 dark:text-slate-400">Bacaan dari para penulis Delcom Blog.</p>

      <div className="relative mb-4">
        <IconSearch size={18} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="search"
          aria-label="Cari artikel"
          placeholder="Cari judul atau kata kunci"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 dark:border-slate-600 dark:bg-slate-800"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" className={pill(category === '')} onClick={() => setCategory('')}>Semua</button>
        {categories.map((c) => (
          <button key={c} type="button" className={pill(category === c)} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {posts.loading && <p>Memuat artikel...</p>}
      {posts.error && <p role="alert" className="text-red-600">{posts.error}</p>}
      {!posts.loading && !posts.error && rows.length === 0 && (
        <p className="text-slate-500">Tidak ada artikel yang cocok. Ubah kata kunci atau kategori.</p>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <article key={p.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <span className="mb-2 w-fit rounded-full bg-slate-100 px-3 py-0.5 text-xs dark:bg-slate-800">{p.category}</span>
            <h2 className="mb-2 text-lg font-semibold">
              <a href={`/posts/${p.slug}`} onClick={(e) => { e.preventDefault(); onNavigate(`/posts/${p.slug}`) }} className="hover:text-[var(--accent)]">{p.title}</a>
            </h2>
            <p className="mb-4 flex-1 text-sm text-slate-600 dark:text-slate-300">{p.excerpt}</p>
            <p className="text-xs text-slate-500">
              {p.author ? p.author.username : 'Anonim'} · {formatDate(p.published_at)} · {p.reading_time} menit baca
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
