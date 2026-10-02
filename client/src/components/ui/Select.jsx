import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

export const Select = forwardRef(({
  label,
  options = [],
  error,
  helperText,
  size = 'md',
  className = '',
  required = false,
  placeholder = '-- Pilih --',
  children,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'min-h-[36px] py-1.5 px-2.5 text-xs sm:text-sm rounded-lg',
    md: 'min-h-[44px] py-2.5 px-3.5 text-base sm:text-sm rounded-xl',
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs sm:text-sm font-medium text-surface-700 dark:text-surface-300">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      <select
        ref={ref}
        className={clsx(
          'w-full border bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-surface-100 disabled:opacity-60 cursor-pointer',
          sizeClasses[size] || sizeClasses.md,
          error
            ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
            : 'border-surface-200 dark:border-surface-700 focus:border-primary-500 focus:ring-primary-500/20',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>

      {error ? (
        <p className="text-xs text-danger-500 font-medium animate-fade-in">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-surface-500 dark:text-surface-400">{helperText}</p>
      ) : null}
    </div>
  )
})

Select.displayName = 'Select'
