import api from './api'

export const budgetService = {
  async getBudgets(params = {}) {
    const res = await api.get('/budgets', { params })
    return res.data
  },

  async getSummary(params = {}) {
    const res = await api.get('/budgets/summary', { params })
    return res.data
  },

  async setBudget(data) {
    const res = await api.post('/budgets', data)
    return res.data
  },

  async updateBudget(id, data) {
    const res = await api.put(`/budgets/${id}`, data)
    return res.data
  },

  async deleteBudget(id) {
    const res = await api.delete(`/budgets/${id}`)
    return res.data
  },
}
