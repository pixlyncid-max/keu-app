import api from './api'

export const savingsService = {
  async getGoals() {
    const res = await api.get('/savings')
    return res.data
  },

  async getGoal(id) {
    const res = await api.get(`/savings/${id}`)
    return res.data
  },

  async createGoal(data) {
    const res = await api.post('/savings', data)
    return res.data
  },

  async updateGoal(id, data) {
    const res = await api.put(`/savings/${id}`, data)
    return res.data
  },

  async deleteGoal(id) {
    const res = await api.delete(`/savings/${id}`)
    return res.data
  },

  async addContribution(goalId, data) {
    const res = await api.post(`/savings/${goalId}/contributions`, data)
    return res.data
  },

  async deleteContribution(goalId, contributionId) {
    const res = await api.delete(`/savings/${goalId}/contributions/${contributionId}`)
    return res.data
  },
}
