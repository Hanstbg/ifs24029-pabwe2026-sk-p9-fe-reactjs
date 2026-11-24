import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiData } from '../../../helpers/apiHelper'
import * as api from './blogApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiData: vi.fn().mockResolvedValue('ok') }))

beforeEach(() => vi.clearAllMocks())

describe('blogApi', () => {
  it('endpoint publik', async () => {
    await api.getCategories()
    expect(apiData).toHaveBeenLastCalledWith('/api/public/categories')
    await api.getPublicPosts({ q: 'react', category: 'Teknologi' })
    expect(apiData).toHaveBeenLastCalledWith('/api/public/posts?q=react&category=Teknologi')
    await api.getPublicPosts({ q: '', category: '' })
    expect(apiData).toHaveBeenLastCalledWith('/api/public/posts')
    await api.getPublicPost('halo dunia')
    expect(apiData).toHaveBeenLastCalledWith('/api/public/posts/halo%20dunia')
  })

  it('endpoint penulis', async () => {
    await api.getMyPosts()
    expect(apiData).toHaveBeenLastCalledWith('/api/posts')
    await api.getMyPost(3)
    expect(apiData).toHaveBeenLastCalledWith('/api/posts/3')
    await api.createPost({ t: 1 })
    expect(apiData).toHaveBeenLastCalledWith('/api/posts', { method: 'POST', body: { t: 1 } })
    await api.updatePost(3, { t: 2 })
    expect(apiData).toHaveBeenLastCalledWith('/api/posts/3', { method: 'PUT', body: { t: 2 } })
    await api.togglePublish(3)
    expect(apiData).toHaveBeenLastCalledWith('/api/posts/3/toggle-publish', { method: 'PATCH' })
    await api.deletePost(3)
    expect(apiData).toHaveBeenLastCalledWith('/api/posts/3', { method: 'DELETE' })
    await api.aiGenerate({ topic: 'x' })
    expect(apiData).toHaveBeenLastCalledWith('/api/posts/ai-generate', { method: 'POST', body: { topic: 'x' } })
  })

  it('getStats memetakan 3 kartu statistik', async () => {
    apiData.mockResolvedValueOnce({ total: 5, total_terbit: 3, belum_selesai: 2 })
    expect(await api.getStats()).toEqual({ total: 5, terbit: 3, draf: 2 })
    expect(apiData).toHaveBeenLastCalledWith('/api/posts/stats')
  })
})
