const TOKEN_KEY = 'delcom_blog_token'
const USER_KEY = 'delcom_blog_user'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/** Memanggil REST API; mengembalikan JSON standar {status, message, data?}. */
export async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  // Base URL backend (mis. https://api.example.com). Kosong = same-origin / proxy dev Vite.
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.status !== 'success') {
    throw new ApiError(json.message || 'Terjadi kesalahan pada server', res.status)
  }
  return json
}

/** Seperti apiRequest, tetapi langsung mengembalikan field `data`. */
export const apiData = async (path, options) => (await apiRequest(path, options)).data

/** Normalisasi data daftar: array langsung atau objek { [key]: [...] }. */
export const toList = (data, key) => (Array.isArray(data) ? data : (data && data[key]) || [])