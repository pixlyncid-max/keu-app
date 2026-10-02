import api from './api'

export const dataService = {
  async exportCsv(params = {}) {
    const response = await api.get('/data/export/csv', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  async exportJson() {
    const response = await api.get('/data/export/json', {
      responseType: 'blob',
    })
    return response.data
  },

  async importJson(file, modeOverwrite = false) {
    const formData = new FormData()
    formData.append('file', file)
    if (modeOverwrite) {
      formData.append('mode_overwrite', '1')
    }

    const res = await api.post('/data/import/json', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  },
}
