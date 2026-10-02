import api from './api'

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data)
    return res.data
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials)
    return res.data
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Abaikan error saat logout jika token sudah revoked
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  },

  async getMe() {
    const res = await api.get('/auth/me')
    return res.data
  },

  async changePassword(data) {
    const res = await api.put('/auth/password', data)
    return res.data
  },

  async deleteAccount(password) {
    const res = await api.delete('/auth/account', { data: { password } })
    return res.data
  },
}
