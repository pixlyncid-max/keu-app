import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-lg mx-auto my-12 bg-white dark:bg-surface-900 rounded-3xl shadow-xl border border-surface-200 dark:border-surface-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-danger-50 text-danger-500 mx-auto flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
            Terjadi Kesalahan Tampilan
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {this.state.error?.message || 'Halaman ini tidak dapat ditampilkan.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 text-white shadow-md hover:bg-primary-700 transition-colors"
          >
            Muat Ulang Halaman
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
