import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Lock,
  Mail,
  User,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  UserPlus,
  Sun,
  Moon,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const registerSchema = z
  .object({
    nama: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi password tidak sesuai',
    path: ['password_confirmation'],
  })

export function RegisterPage() {
  const { register: registerAuth } = useAuth()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [apiError, setApiError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nama: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  const onSubmit = async (data) => {
    setApiError(null)
    setIsSubmitting(true)
    try {
      await registerAuth({
        nama: data.nama,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.'
      setApiError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-800 dark:text-slate-100 relative overflow-hidden flex flex-col justify-between transition-colors duration-300">
      {/* Background Ambient Glow Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 dark:bg-primary-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-sky-500/15 dark:bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />

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
          <img
            src="/Logo.png"
            alt="Keuangan-Ku"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-contain shadow-lg shadow-primary-500/25 ring-2 ring-white/20 dark:ring-white/10"
          />
          <div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
              Keuangan<span className="text-primary-600 dark:text-primary-400">-Ku</span>
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
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Benefits Showcase */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-7 pr-4">
            
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/70 border border-primary-200/80 dark:border-primary-800/80 text-primary-700 dark:text-primary-300 text-xs font-semibold shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
              <span>Mulai Gratis Hari Ini</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
                Mulai Kelola Keuangan{' '}
                <span className="bg-gradient-to-r from-primary-600 via-indigo-500 to-sky-500 dark:from-primary-400 dark:via-indigo-300 dark:to-sky-400 bg-clip-text text-transparent">
                  Tanpa Ribet.
                </span>
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                Bergabunglah untuk mengatur pengeluaran, mencapai target tabungan, dan melihat perkembangan finansial Anda secara transparan.
              </p>
            </div>

            {/* Benefit Checkpoints */}
            <div className="space-y-3.5 pt-2 max-w-md">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-sm">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white">Pencatatan Cepat & Multi Dompet</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Pisahkan saldo tunai, rekening bank, dan dompet digital dengan mudah.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-sm">
                <div className="w-6 h-6 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white">Target Tabungan Otomatis</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Pantau progres tabungan impian dengan visualisasi bar interaktif.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-sm">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white">Ekspor Laporan Spreadsheet & Excel</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Unduh data keuangan sewaktu-waktu dengan format rapi dan terstruktur.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Register Form */}
          <div className="w-full lg:col-span-6 max-w-md mx-auto">
            <div className="relative">
              
              <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-primary-600/30 to-indigo-600/30 dark:from-primary-500/20 dark:to-indigo-500/20 blur-xl opacity-75" />

              <div className="relative rounded-3xl bg-white dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-2xl shadow-slate-200/60 dark:shadow-black/70">
                
                <div className="mb-5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Daftar Akun
                    </h2>
                    <span className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                      <UserPlus className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Lengkapi data diri di bawah untuk memulai secara gratis.
                  </p>
                </div>

                {apiError && (
                  <div className="mb-4 p-3 rounded-2xl bg-danger-50 dark:bg-danger-950/50 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 text-xs font-medium animate-fade-in flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-danger-500 shrink-0 animate-ping" />
                    <span>{apiError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                  
                  {/* Nama */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Contoh: Budi Santoso"
                        className={`w-full min-h-[46px] pl-10 pr-4 rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.nama
                            ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
                            : 'border-slate-200 dark:border-slate-700/80 focus:border-primary-500 focus:ring-primary-500/20 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        {...register('nama')}
                      />
                    </div>
                    {errors.nama && (
                      <p className="text-xs text-danger-500 font-medium animate-fade-in">{errors.nama.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
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
                        className={`w-full min-h-[46px] pl-10 pr-4 rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
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

                  {/* Password Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Kata Sandi
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 8 karakter"
                          className={`w-full min-h-[46px] pl-10 pr-10 rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.password
                              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
                              : 'border-slate-200 dark:border-slate-700/80 focus:border-primary-500 focus:ring-primary-500/20'
                          }`}
                          {...register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-danger-500 font-medium">{errors.password.message}</p>
                      )}
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Konfirmasi
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Ulangi kata sandi"
                          className={`w-full min-h-[46px] pl-10 pr-10 rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.password_confirmation
                              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
                              : 'border-slate-200 dark:border-slate-700/80 focus:border-primary-500 focus:ring-primary-500/20'
                          }`}
                          {...register('password_confirmation')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {errors.password_confirmation && (
                        <p className="text-xs text-danger-500 font-medium">{errors.password_confirmation.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 min-h-[48px] rounded-xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 hover:from-primary-500 hover:via-indigo-500 hover:to-primary-600 active:scale-[0.98] shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Membuat Akun...</span>
                      </>
                    ) : (
                      <>
                        <span>Daftar Sekarang</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Sudah memiliki akun?{' '}
                    <Link
                      to="/login"
                      className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors"
                    >
                      Masuk di Sini
                    </Link>
                  </p>
                </div>

              </div>
            </div>

            <div className="mt-4 text-center lg:hidden">
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                <span>Privasi data Anda terjaga dengan aman</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div>
          © {new Date().getFullYear()} Keuangan-Ku. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sistem Siap
          </span>
          <span>•</span>
          <span>Bantuan & Dukungan</span>
        </div>
      </footer>
    </div>
  )
}
