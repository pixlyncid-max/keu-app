import api from './api'

export const reportService = {
  async getSummary(params = {}) {
    const res = await api.get('/reports/summary', { params })
    return res.data
  },

  async getCategoriesReport(params = {}) {
    const res = await api.get('/reports/categories', { params })
    return res.data
  },

  async getMonthlyTrend(months = 6) {
    const res = await api.get('/reports/monthly-trend', { params: { months } })
    return res.data
  },

  async getBankStatement(params = {}) {
    const res = await api.get('/reports/bank-statement', { params })
    return res.data
  },
}
