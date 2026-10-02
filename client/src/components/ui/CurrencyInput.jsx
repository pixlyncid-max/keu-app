import React, { forwardRef } from 'react'
import { formatInputRupiah, parseRupiah } from '../../lib/formatters'
import { Input } from './Input'

export const CurrencyInput = forwardRef(({
  value,
  onChange,
  label = 'Nominal',
  placeholder = '0',
  error,
  required = false,
  ...props
}, ref) => {
  const displayValue = formatInputRupiah(value)

  const handleChange = (e) => {
    const rawVal = e.target.value
    const numericVal = parseRupiah(rawVal)
    if (onChange) {
      onChange(numericVal)
    }
  }

  return (
    <div className="relative">
      <Input
        ref={ref}
        label={label}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        error={error}
        required={required}
        icon={({ className }) => (
          <span className={`font-semibold text-sm text-surface-500 dark:text-surface-400 ${className}`}>
            Rp
          </span>
        )}
        {...props}
      />
    </div>
  )
})

CurrencyInput.displayName = 'CurrencyInput'
