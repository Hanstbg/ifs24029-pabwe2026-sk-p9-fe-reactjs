const CARDS = [
  { key: 'total', label: 'Total Artikel' },
  { key: 'terbit', label: 'Total Terbit' },
  { key: 'draf', label: 'Belum Selesai (Draf)' },
]

export default function PostStats({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CARDS.map((c) => (
        <div key={c.key} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">{c.label}</p>
          <p className="mt-1 text-3xl font-bold text-[var(--accent)]" data-testid={`stat-${c.key}`}>{stats[c.key]}</p>
        </div>
      ))}
    </div>
  )
}
