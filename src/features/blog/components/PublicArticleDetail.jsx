import useFetch from '../../../hooks/useFetch'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { formatDate } from '../../../helpers/toolsHelper'
import { getPublicPost } from '../api/blogApi'

export default function PublicArticleDetail({ slug, onNavigate }) {
  const { data: post, loading, error } = useFetch(() => getPublicPost(slug), [slug])

  return (
    <article className="w-full">
      <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/') }} className="mb-4 inline-block text-sm text-[var(--accent)] hover:underline">
        Kembali ke daftar artikel
      </a>
      {loading && <p>Memuat artikel...</p>}
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {post && (
        <>
          {post.cover_image_path && <img src={post.cover_image_path} alt={post.title} className="mb-6 max-h-96 w-full rounded-xl object-cover" />}
          <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs dark:bg-slate-800">{post.category}</span>
          <h1 className="mt-3 text-4xl font-bold">{post.title}</h1>
          <p className="mb-8 mt-2 text-sm text-slate-500">
            {post.author ? post.author.username : 'Anonim'} · {formatDate(post.published_at)} · {post.reading_time} menit baca
          </p>
          <MarkdownViewer content={post.content} />
        </>
      )}
    </article>
  )
}
