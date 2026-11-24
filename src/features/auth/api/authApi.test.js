import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiData } from '../../../helpers/apiHelper'
import { getProfile, login, logout, register, updateProfile } from './authApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiData: vi.fn().mockResolvedValue('ok') }))

beforeEach(() => vi.clearAllMocks())

describe('authApi', () => {
  it('memanggil endpoint auth yang benar', async () => {
    await login({ a: 1 })
    expect(apiData).toHaveBeenLastCalledWith('/api/auth/login', { method: 'POST', body: { a: 1 } })
    await register({ b: 2 })
    expect(apiData).toHaveBeenLastCalledWith('/api/auth/register', { method: 'POST', body: { b: 2 } })
    await logout()
    expect(apiData).toHaveBeenLastCalledWith('/api/auth/logout', { method: 'POST' })
    await getProfile()
    expect(apiData).toHaveBeenLastCalledWith('/api/auth/profile')
    await updateProfile({ c: 3 })
    expect(apiData).toHaveBeenLastCalledWith('/api/auth/profile', { method: 'PUT', body: { c: 3 } })
  })
})
