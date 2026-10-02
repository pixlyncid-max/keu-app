import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Lock,
  Mail,
  Wallet,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  PieChart,
  Sun,
  Moon,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [apiError, setApiError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Autofill fungsi akun demo untuk kemudahan pengujian
  const fillDemoAccount = () => {
    setValue('email', 'admin@berizin.id', { shouldValidate: true })
    setValue('password', 'password', { shouldValidate: true })
    setApiError(null)
  }

  const onSubmit = async (data) => {
    setApiError(null)
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal login. Periksa email dan password Anda.'
      setApiError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-800 dark:text-slate-100 relative overflow-hidden flex flex-col justify-between transition-colors duration-300">
      {/* Background Ambient Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/20 dark:bg-primary-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-sky-500/15 dark:bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 ring-2 ring-white/20 dark:ring-white/10">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
              Keuangan<span className="text-primary-600 dark:text-primary-400">Pribadi</span>
            </span>
            <span className="hidden xs:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
              Pro
            </span>
          </div>
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Ubah Tema"
          className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 shadow-sm transition-all duration-200 flex items-center gap-2 text-xs font-medium"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Gelap</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Visual Showcase (Visible on Desktop / Tablet) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-8 pr-4">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/70 border border-primary-200/80 dark:border-primary-800/80 text-primary-700 dark:text-primary-300 text-xs font-semibold shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
              <span>Sistem Manajemen Keuangan Modern</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
                Kendalikan Finansial,{' '}
                <span className="bg-gradient-to-r from-primary-600 via-indigo-500 to-sky-500 dark:from-primary-400 dark:via-indigo-300 dark:to-sky-400 bg-clip-text text-transparent">
                  Wujudkan Impian Anda.
                </span>
              </h1>
              <p className="text-base xl:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Platform pencatatan transaksi real-time, alokasi anggaran cerdas, target tabungan terukur, dan ekspor laporan spreadsheet instan.
              </p>
            </div>

            {/* Interactive Preview Glass Card */}
            <div className="relative pt-2">
              <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/50 dark:shadow-black/40 space-y-5 max-w-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Saldo Aktif</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">Rp 28.750.000</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <TrendingUp className="w-3 h-3" /> +14.2%
                  </span>
                </div>

                {/* Feature Mini Pills */}
                <div className="grid grid-cols-3 gap-3 pt-1 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Dompet</div>
                    <div className="text-sm font-bold text-primary-600 dark:text-primary-400">3 Rekening</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Tabungan</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">78% Target</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Anggaran</div>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Terkontrol</div>
                  </div>
                </div>
              </div>

              {/* Decorative Floating Mini Badge */}
              <div className="absolute -bottom-3 right-8 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Pembaruan Real-Time Aktif</span>
              </div>
            </div>

            {/* Value Props Row */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                <span>Enkripsi Aman & Privat</span>
              </div>
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-500" />
                <span>Visualisasi Laporan Otomatis</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Ekspor Excel & CSV</span>
              </div>
            </div>

          </div>

          {/* Right Column: Sleek Auth Card (Both Desktop & Mobile) */}
          <div className="w-full lg:col-span-5 max-w-md mx-auto">
            <div className="relative">
              
              {/* Outer Glow Halo on Dark Mode */}
              <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-primary-600/30 to-indigo-600/30 dark:from-primary-500/20 dark:to-indigo-500/20 blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

              {/* Card Container */}
              <div className="relative rounded-3xl bg-white dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-9 shadow-2xl shadow-slate-200/60 dark:shadow-black/70">
                
                {/* Header inside Card */}
                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Selamat Datang!
                    </h2>
                    <span className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Masukkan akun untuk mengakses dashboard finansial Anda.
                  </p>
                </div>

                {/* Deskripsi Singkat Aplikasi & Akses Demo */}
                <div className="w-full mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-primary-50/90 via-indigo-50/70 to-sky-50/60 dark:from-primary-950/40 dark:via-indigo-950/30 dark:to-sky-950/30 border border-primary-200/80 dark:border-primary-800/60">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Catat & Kelola Finansial
                        </span>
                        <button
                          type="button"
                          onClick={fillDemoAccount}
                          title="Klik untuk mengisi akun demo pengujian"
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-white/90 dark:bg-slate-800/90 text-primary-600 dark:text-primary-300 border border-primary-200 dark:border-primary-700/80 hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
                        >
                          <span>Coba Demo</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-400 mt-1">
                        Pantau arus kas harian, kendalikan anggaran belanja, dan wujudkan target tabungan Anda dalam satu platform praktis.
                      </p>
                    </div>
                  </div>
                </div>

                {/* API Error Notification */}
                {apiError && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-danger-50 dark:bg-danger-950/50 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 text-xs sm:text-sm font-medium animate-fade-in flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-danger-500 shrink-0 animate-ping" />
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Form Elements */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        placeholder="nama@email.com"
                        className={`w-full min-h-[48px] pl-10 pr-4 rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.email
                            ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
                            : 'border-slate-200 dark:border-slate-700/80 focus:border-primary-500 focus:ring-primary-500/20 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-danger-500 font-medium animate-fade-in">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Kata Sandi
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`w-full min-h-[48px] pl-10 pr-11 rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.password
                            ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
                            : 'border-slate-200 dark:border-slate-700/80 focus:border-primary-500 focus:ring-primary-500/20 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-danger-500 font-medium animate-fade-in">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Options: Remember Me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600 border-slate-300 dark:border-slate-700 focus:ring-primary-500 dark:bg-slate-800"
                      />
                      <span>Ingat saya di perangkat ini</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 min-h-[48px] rounded-xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 hover:from-primary-500 hover:via-indigo-500 hover:to-primary-600 active:scale-[0.98] shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Memproses Masuk...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk Sekarang</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Register Link */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Belum memiliki akun?{' '}
                    <Link
                      to="/register"
                      className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors"
                    >
                      Daftar Akun Baru
                    </Link>
                  </p>
                </div>

              </div>
            </div>

            {/* Mobile Visual Security Note */}
            <div className="mt-6 text-center lg:hidden">
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                <span>Koneksi aman dengan enkripsi 256-bit</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div>
          © {new Date().getFullYear()} Keuangan Pribadi. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Server Aktif
          </span>
          <span>•</span>
          <span>Privasi & Keamanan Terjamin</span>
        </div>
      </footer>
    </div>
  )
}
