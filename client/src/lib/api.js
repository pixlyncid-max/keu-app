/**
 * Axios instance terkonfigurasi untuk semua API call ke backend Laravel.
 * Features:
 * - Base URL otomatis dari env
 * - Kirim cookies (withCredentials) untuk session
 * - Interceptor request: tambahkan Authorization header dari localStorage
 * - Interceptor response: handle 401 (token expired) → redirect ke login
 *
 * Catatan: Refresh token logic akan ditambahkan di Tahap 2.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 15000, // 15 detik
})

// =====================================================================
// REQUEST INTERCEPTOR — Tambahkan token ke setiap request
// =====================================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// =====================================================================
// RESPONSE INTERCEPTOR — Handle error global
// =====================================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Token expired (401) — coba refresh token
    // TODO: Implementasi di Tahap 2 (Auth)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Hapus token dan redirect ke login
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default api
