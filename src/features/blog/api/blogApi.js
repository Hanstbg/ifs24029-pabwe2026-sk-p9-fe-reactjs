import { apiData } from '../../../helpers/apiHelper'

const toQuery = (params) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })
  const text = search.toString()
  return text ? `?${text}` : ''
}

// Publik
export const getCategories = () => apiData('/api/public/categories')
export const getPublicPosts = ({ q, category }) =>
  apiData(`/api/public/posts${toQuery({ q, category })}`)
export const getPublicPost = (slug) => apiData(`/api/public/posts/${encodeURIComponent(slug)}`)

// Penulis
export const getMyPosts = () => apiData('/api/posts')
export const getMyPost = (id) => apiData(`/api/posts/${id}`)
export const createPost = (body) => apiData('/api/posts', { method: 'POST', body })
export const updatePost = (id, body) => apiData(`/api/posts/${id}`, { method: 'PUT', body })
export const togglePublish = (id) => apiData(`/api/posts/${id}/toggle-publish`, { method: 'PATCH' })
export const deletePost = (id) => apiData(`/api/posts/${id}`, { method: 'DELETE' })
export const aiGenerate = (body) => apiData('/api/posts/ai-generate', { method: 'POST', body })

/** Ringkasan 3 kartu: Total Artikel, Total Terbit, Belum Selesai/Draf. */
export const getStats = async () => {
  const data = await apiData('/api/posts/stats')
  return { total: data.total, terbit: data.total_terbit, draf: data.belum_selesai }
}
