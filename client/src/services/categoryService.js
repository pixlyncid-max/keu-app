import api from './api'

export const categoryService = {
  async getCategories(params = {}) {
    const res = await api.get('/categories', { params })
    return res.data
  },

  async createCategory(data) {
    const res = await api.post('/categories', data)
    return res.data
  },

  async updateCategory(id, data) {
    const res = await api.put(`/categories/${id}`, data)
    return res.data
  },

  async deleteCategory(id) {
    const res = await api.delete(`/categories/${id}`)
    return res.data
  },
}
