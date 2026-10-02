import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [isLoading, setIsLoading] = useState(true)

  // Inisialisasi & verifikasi token saat mount
  useEffect(() => {
    async function initAuth() {
      const savedToken = localStorage.getItem('access_token')
      if (savedToken) {
        try {
          const res = await authService.getMe()
          setUser(res.data)
          localStorage.setItem('user', JSON.stringify(res.data))
        } catch {
          // Token tidak valid → bersihkan
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          setUser(null)
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    const response = await authService.login({ email, password })
    const { user: userData, access_token, refresh_token } = response.data

    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('user', JSON.stringify(userData))

    setToken(access_token)
    setUser(userData)

    return response
  }

  const register = async (registerData) => {
    const response = await authService.register(registerData)
    const { user: userData, access_token, refresh_token } = response.data

    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('user', JSON.stringify(userData))

    setToken(access_token)
    setUser(userData)

    return response
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setToken(null)
  }

  const updateUser = (newUserData) => {
    setUser(newUserData)
    localStorage.setItem('user', JSON.stringify(newUserData))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
