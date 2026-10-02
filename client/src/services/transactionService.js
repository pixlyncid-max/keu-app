import api from './api'

export const transactionService = {
  async getTransactions(params = {}) {
    const res = await api.get('/transactions', { params })
    return res.data
  },

  async getSummary(params = {}) {
    const res = await api.get('/transactions/summary', { params })
    return res.data
  },

  async getTransaction(id) {
    const res = await api.get(`/transactions/${id}`)
    return res.data
  },

  async createTransaction(data) {
    const res = await api.post('/transactions', data)
    return res.data
  },

  async updateTransaction(id, data) {
    const res = await api.put(`/transactions/${id}`, data)
    return res.data
  },

  async deleteTransaction(id) {
    const res = await api.delete(`/transactions/${id}`)
    return res.data
  },
}
