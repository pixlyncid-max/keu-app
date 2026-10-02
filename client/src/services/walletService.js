import api from './api'

export const walletService = {
  async getWallets() {
    const res = await api.get('/wallets')
    const rawData = res.data?.data
    if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.wallets)) {
      return {
        ...res.data,
        data: rawData.wallets,
        total_saldo: rawData.total_saldo ?? 0,
      }
    }
    return res.data
  },

  async getWallet(id) {
    const res = await api.get(`/wallets/${id}`)
    return res.data
  },

  async createWallet(data) {
    const res = await api.post('/wallets', data)
    return res.data
  },

  async updateWallet(id, data) {
    const res = await api.put(`/wallets/${id}`, data)
    return res.data
  },

  async deleteWallet(id) {
    const res = await api.delete(`/wallets/${id}`)
    return res.data
  },

  async archiveWallet(id) {
    const res = await api.post(`/wallets/${id}/archive`)
    return res.data
  },

  async unarchiveWallet(id) {
    const res = await api.post(`/wallets/${id}/unarchive`)
    return res.data
  },
}
