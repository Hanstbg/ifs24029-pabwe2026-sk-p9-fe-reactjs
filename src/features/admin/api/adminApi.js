import { apiData } from '../../../helpers/apiHelper'

export const getUsers = () => apiData('/api/admin/users')
export const getAllPosts = () => apiData('/api/admin/posts')
export const getUserPosts = (id) => apiData(`/api/admin/users/${id}/posts`)
