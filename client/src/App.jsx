import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Skeleton } from './components/ui/Skeleton'
import { useAuth } from './context/AuthContext'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { BudgetsPage } from './pages/budgets/BudgetsPage'
import { CategoriesPage } from './pages/categories/CategoriesPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RecurringPage } from './pages/recurring/RecurringPage'
import { SavingsPage } from './pages/savings/SavingsPage'
import { MorePage } from './pages/settings/MorePage'
import { TransactionsPage } from './pages/transactions/TransactionsPage'
import { WalletsPage } from './pages/wallets/WalletsPage'

import { ErrorBoundary } from './components/ErrorBoundary'

// Wrapper Route Khusus Terproteksi (Harus Login)
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-600 animate-pulse flex items-center justify-center text-white font-bold">
          K
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Wrapper Route Khusus Publik (Hanya untuk tamu / belum login)
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-600 animate-pulse flex items-center justify-center text-white font-bold">
          K
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Route Publik (Auth) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        {/* Route Terproteksi dengan AppLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
          <Route path="transactions" element={<ErrorBoundary><TransactionsPage /></ErrorBoundary>} />
          <Route path="wallets" element={<ErrorBoundary><WalletsPage /></ErrorBoundary>} />
          <Route path="savings" element={<ErrorBoundary><SavingsPage /></ErrorBoundary>} />
          <Route path="budgets" element={<ErrorBoundary><BudgetsPage /></ErrorBoundary>} />
          <Route path="recurring" element={<ErrorBoundary><RecurringPage /></ErrorBoundary>} />
          <Route path="categories" element={<ErrorBoundary><CategoriesPage /></ErrorBoundary>} />
          <Route path="more" element={<ErrorBoundary><MorePage /></ErrorBoundary>} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  )
}
