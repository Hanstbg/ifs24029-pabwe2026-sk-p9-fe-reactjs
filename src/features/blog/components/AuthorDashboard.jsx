import { lazy, Suspense, useState } from 'react'
import { IconDotsVertical, IconEye, IconPencil, IconPlus, IconSparkles, IconTrash } from '@tabler/icons-react'
import useFetch from '../../../hooks/useFetch'
import { toList } from '../../../helpers/apiHelper'
import { formatDate, showConfirmDialog, showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'
import { createPost, deletePost, getMyPosts, getStats, togglePublish, updatePost } from '../api/blogApi'
import PostStats from './PostStats'

// Modal (beserta Toast UI Editor ~400 KB) hanya diunduh saat pertama kali dibuka,
// sehingga halaman /author tampil cepat tanpa menunggu editor.
const PostModal = lazy(() => import('../modals/PostModal'))
const AiPostGeneratorModal = lazy(() => import('../modals/AiPostGeneratorModal'))

export default function AuthorDashboard({ onNavigate }) {
  const stats = useFetch(getStats, [])
  const posts = useFetch(getMyPosts, [])
  const [modal, setModal] = useState(null) // { type: 'post' | 'ai', data }
  const [menuId, setMenuId] = useState(null)
  const rows = toList(posts.data, 'posts')

  const refresh = () => {
    stats.reload()
    posts.reload()
  }

  const run = async (action, okMessage) => {
    try {
      await action()
      showSuccessAlert(okMessage)
      refresh()
      return true
    } catch (err) {
      await showErrorAlert(err.message)
      return false
    }
  }

  const handleSave = async (payload) => {
    const id = modal.data && modal.data.id
    const ok = await run(() => (id ? updatePost(id, payload) : createPost(payload)), id ? 'Artikel diperbarui' : 'Artikel dibuat')
    if (ok) setModal(null)
  }

  const handleToggle = (p) =>
    run(() => togglePublish(p.id), p.is_published ? 'Artikel dijadikan draf' : 'Artikel diterbitkan')

  const handleDelete = async (p) => {
    setMenuId(null)
    if (!(await showConfirmDialog('Hapus artikel?', p.title))) return
    await run(() => deletePost(p.id), 'Artikel dihapus')
  }

  const handleDetail = (p) => {
    setMenuId(null)
    if (p.is_published) onNavigate(`/posts/${p.slug}`)
    else showErrorAlert('Artikel masih draf. Terbitkan dahulu agar bisa dibuka di halaman publik.')
  }

  const handleEdit = (p) => {
    setMenuId(null)
    setModal({ type: 'post', data: p })
  }

  const item = 'flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700'

  return (
    <section className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Workspace penulis</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setModal({ type: 'ai', data: null })} className="flex items-center gap-1 rounded-lg border border-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent)]">
            <IconSparkles size={16} /> AI Generator
          </button>
          <button type="button" onClick={() => setModal({ type: 'post', data: null })} className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
            <IconPlus size={16} /> Tambah Artikel
          </button>
        </div>
      </div>

      {stats.data && <PostStats stats={stats.data} />}
      {stats.error && <p role="alert" className="text-red-600">{stats.error}</p>}

      {posts.loading && !posts.data && <p>Memuat artikel...</p>}
      {posts.error && <p role="alert" className="text-red-600">{posts.error}</p>}
      {posts.data && rows.length === 0 && <p className="text-slate-500">Belum ada artikel. Tulis artikel pertama Anda.</p>}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left dark:bg-slate-800">
              <tr><th className="p-3">Judul</th><th className="p-3">Kategori</th><th className="p-3">Terbit</th><th className="p-3">Dibuat</th><th className="p-3 text-right">Aksi</th></tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">
                    <button type="button" role="switch" aria-checked={p.is_published} aria-label={`Terbitkan ${p.title}`} onClick={() => handleToggle(p)}
                      className={`relative h-6 w-11 rounded-full ${p.is_published ? 'bg-[var(--accent)]' : 'bg-slate-400'}`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${p.is_published ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="p-3">{formatDate(p.created_at)}</td>
                  <td className="relative p-3 text-right">
                    <button type="button" aria-label={`Menu aksi ${p.title}`} onClick={() => setMenuId(menuId === p.id ? null : p.id)} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <IconDotsVertical size={18} />
                    </button>
                    {menuId === p.id && (
                      <div role="menu" className="absolute right-3 top-10 z-10 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-lg dark:border-slate-600 dark:bg-slate-800">
                        <button type="button" role="menuitem" className={item} onClick={() => handleDetail(p)}><IconEye size={16} /> Detail</button>
                        <button type="button" role="menuitem" className={item} onClick={() => handleEdit(p)}><IconPencil size={16} /> Ubah</button>
                        <button type="button" role="menuitem" className={`${item} text-red-600`} onClick={() => handleDelete(p)}><IconTrash size={16} /> Hapus</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Suspense fallback={null}>
        {modal && modal.type === 'post' && <PostModal initial={modal.data} onClose={() => setModal(null)} onSave={handleSave} />}
        {modal && modal.type === 'ai' && (
          <AiPostGeneratorModal onClose={() => setModal(null)} onApply={(draft) => setModal({ type: 'post', data: draft })} />
        )}
      </Suspense>
    </section>
  )
}
