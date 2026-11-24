import { describe, expect, it, vi } from 'vitest'
import { apiData } from '../../../helpers/apiHelper'
import { getAllPosts, getUserPosts, getUsers } from './adminApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiData: vi.fn().mockResolvedValue('ok') }))

describe('adminApi', () => {
  it('memanggil endpoint admin', async () => {
    await getUsers()
    expect(apiData).toHaveBeenLastCalledWith('/api/admin/users')
    await getAllPosts()
    expect(apiData).toHaveBeenLastCalledWith('/api/admin/posts')
    await getUserPosts(4)
    expect(apiData).toHaveBeenLastCalledWith('/api/admin/users/4/posts')
  })
})
