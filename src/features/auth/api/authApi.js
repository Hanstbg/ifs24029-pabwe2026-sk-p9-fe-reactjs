import { apiData } from '../../../helpers/apiHelper'

export const login = (body) => apiData('/api/auth/login', { method: 'POST', body })
export const register = (body) => apiData('/api/auth/register', { method: 'POST', body })
export const logout = () => apiData('/api/auth/logout', { method: 'POST' })
export const getProfile = () => apiData('/api/auth/profile')
export const updateProfile = (body) => apiData('/api/auth/profile', { method: 'PUT', body })
