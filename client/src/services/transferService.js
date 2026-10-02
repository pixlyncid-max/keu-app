import api from './api'

export const transferService = {
  async getTransfers(params = {}) {
    const res = await api.get('/transfers', { params })
    return res.data
  },

  async createTransfer(data) {
    const res = await api.post('/transfers', data)
    return res.data
  },

  async deleteTransfer(id) {
    const res = await api.delete(`/transfers/${id}`)
    return res.data
  },
}
