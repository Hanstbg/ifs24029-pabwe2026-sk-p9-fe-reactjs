import { useState } from 'react'
import useFetch from '../../../hooks/useFetch'
import { toList } from '../../../helpers/apiHelper'
import { formatDate } from '../../../helpers/toolsHelper'
import { getAllPosts, getUsers } from '../api/adminApi'

export default function AdminDashboard() {
  const [tab, setTab] = useState('users')
  const users = useFetch(getUsers, [])
  const posts = useFetch(getAllPosts, [])
  const userRows = toList(users.data, 'users')
  const postRows = toList(posts.data, 'posts')
  const active = tab === 'users' ? users : posts

  const tabClass = (name) =>
    `rounded-lg px-4 py-2 text-sm font-medium ${tab === name ? 'bg-[var(--accent)] text-white' : 'border border-slate-300 dark:border-slate-600'}`
  const th = 'p-3 text-left'

  return (
    <section className="w-full space-y-6">
      <h1 className="text-2xl font-bold">Panel administrasi</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Total pengguna</p>
          <p className="text-3xl font-bold text-[var(--accent)]" data-testid="admin-total-users">{userRows.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Total artikel</p>
          <p className="text-3xl font-bold text-[var(--accent)]" data-testid="admin-total-posts">{postRows.length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" className={tabClass('users')} onClick={() => setTab('users')}>Pengguna</button>
        <button type="button" className={tabClass('posts')} onClick={() => setTab('posts')}>Semua artikel</button>
      </div>

      {active.loading && <p>Memuat data...</p>}
      {active.error && <p role="alert" className="text-red-600">{active.error}</p>}

      {tab === 'users' && userRows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800"><tr>
              <th className={th}>ID</th><th className={th}>Username</th><th className={th}>Email</th><th className={th}>Role</th><th className={th}>Total artikel</th><th className={th}>Total terbit</th>
            </tr></thead>
            <tbody>
              {userRows.map((u) => (
                <tr key={u.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="p-3">{u.id}</td><td className="p-3">{u.username}</td><td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td><td className="p-3">{u.total_posts}</td><td className="p-3">{u.total_published}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'posts' && postRows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800"><tr>
              <th className={th}>Judul</th><th className={th}>Penulis</th><th className={th}>Kategori</th><th className={th}>Status</th><th className={th}>Dibuat</th>
            </tr></thead>
            <tbody>
              {postRows.map((p) => (
                <tr key={p.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3">{p.author ? p.author.username : '-'}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">{p.is_published ? 'Terbit' : 'Draf'}</td>
                  <td className="p-3">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
