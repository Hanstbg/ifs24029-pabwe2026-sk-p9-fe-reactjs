import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiData, apiRequest, clearSession, getToken, getUser, saveSession, toList } from './apiHelper'

const stubFetch = ({ ok = true, status = 200, body = {}, parseFails = false } = {}) => {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => (parseFails ? Promise.reject(new Error('bad json')) : Promise.resolve(body)),
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => vi.unstubAllGlobals())

describe('session', () => {
  it('menyimpan, membaca, dan menghapus sesi', () => {
    saveSession('tok', { username: 'budi' })
    expect(getToken()).toBe('tok')
    expect(getUser()).toEqual({ username: 'budi' })
    clearSession()
    expect(getToken()).toBeNull()
    expect(getUser()).toBeNull()
  })

  it('getUser mengembalikan null bila JSON rusak', () => {
    localStorage.setItem('delcom_blog_user', '{rusak')
    expect(getUser()).toBeNull()
  })
})

describe('apiRequest', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('memakai VITE_API_URL sebagai base URL (trailing slash dibuang)', async () => {
    vi.stubEnv('VITE_API_URL', 'https://be.example.com/')
    const fetchMock = stubFetch({ body: { status: 'success', data: 1 } })
    await apiRequest('/api/x')
    expect(fetchMock.mock.calls[0][0]).toBe('https://be.example.com/api/x')
  })

  it('GET tanpa token dan tanpa body', async () => {
    const fetchMock = stubFetch({ body: { status: 'success', data: 1 } })
    const json = await apiRequest('/api/x')
    expect(json.data).toBe(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/x', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    })
  })

  it('menyertakan Bearer token dan body JSON', async () => {
    saveSession('abc', {})
    const fetchMock = stubFetch({ body: { status: 'success' } })
    await apiRequest('/api/x', { method: 'POST', body: { a: 1 } })
    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.headers.Authorization).toBe('Bearer abc')
    expect(opts.body).toBe('{"a":1}')
  })

  it('melempar ApiError dengan pesan server', async () => {
    stubFetch({ ok: false, status: 401, body: { status: 'fail', message: 'Tidak sah' } })
    const err = await apiRequest('/api/x').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.message).toBe('Tidak sah')
    expect(err.status).toBe(401)
  })

  it('memakai pesan default bila server tidak memberi pesan', async () => {
    stubFetch({ ok: true, body: { status: 'error' } })
    await expect(apiRequest('/api/x')).rejects.toThrow('Terjadi kesalahan pada server')
  })

  it('memakai pesan default bila respons bukan JSON', async () => {
    stubFetch({ ok: false, status: 500, parseFails: true })
    await expect(apiRequest('/api/x')).rejects.toThrow('Terjadi kesalahan pada server')
  })

  it('apiData mengembalikan field data', async () => {
    stubFetch({ body: { status: 'success', data: { id: 7 } } })
    expect(await apiData('/api/x')).toEqual({ id: 7 })
  })
})

describe('toList', () => {
  it('menormalkan berbagai bentuk data', () => {
    expect(toList([1], 'posts')).toEqual([1])
    expect(toList({ posts: [2] }, 'posts')).toEqual([2])
    expect(toList({ lain: 1 }, 'posts')).toEqual([])
    expect(toList(null, 'posts')).toEqual([])
  })
})