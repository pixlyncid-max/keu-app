import api from './api'

export const recurringService = {
  async getRules() {
    const res = await api.get('/recurring')
    return res.data
  },

  async getUpcoming(days = 30) {
    const res = await api.get('/recurring/upcoming', { params: { days } })
    return res.data
  },

  async processDue() {
    const res = await api.post('/recurring/process')
    return res.data
  },

  async createRule(data) {
    const res = await api.post('/recurring', data)
    return res.data
  },

  async updateRule(id, data) {
    const res = await api.put(`/recurring/${id}`, data)
    return res.data
  },

  async deleteRule(id) {
    const res = await api.delete(`/recurring/${id}`)
    return res.data
  },
}
