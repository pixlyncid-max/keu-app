import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { clsx } from 'clsx'

export const Input = forwardRef(({
  label,
  error,
  helperText,
  type = 'text',
  placeholder,
  icon: Icon,
  size = 'md',
  className = '',
  containerClassName = '',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  const sizeClasses = {
    sm: 'min-h-[36px] py-1.5 px-3 text-xs sm:text-sm rounded-lg',
    md: 'min-h-[44px] py-2.5 px-3.5 text-base sm:text-sm rounded-xl',
  }

  return (
    <div className={clsx('flex flex-col gap-1 w-full', containerClassName)}>
      {label && (
        <label className="text-xs sm:text-sm font-medium text-surface-700 dark:text-surface-300 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-danger-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center w-full">
        {Icon && (
          <div className={clsx(
            'absolute text-surface-400 pointer-events-none flex items-center justify-center',
            size === 'sm' ? 'left-2.5' : 'left-3.5'
          )}>
            <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          placeholder={placeholder}
          className={clsx(
            'w-full border bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-surface-100 disabled:opacity-60',
            sizeClasses[size] || sizeClasses.md,
            Icon ? (size === 'sm' ? 'pl-8' : 'pl-11') : (size === 'sm' ? 'pl-3' : 'pl-3.5'),
            isPassword ? (size === 'sm' ? 'pr-8' : 'pr-11') : (size === 'sm' ? 'pr-3' : 'pr-3.5'),
            error
              ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
              : 'border-surface-200 dark:border-surface-700 focus:border-primary-500 focus:ring-primary-500/20',
            className
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            className="absolute right-3.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 p-1 rounded-lg transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs text-danger-500 font-medium animate-fade-in">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-surface-500 dark:text-surface-400">{helperText}</p>
      ) : null}
    </div>
  )
})

Input.displayName = 'Input'
