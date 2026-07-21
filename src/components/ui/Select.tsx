import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
} from 'react'

import { cn } from '../../utils/cn'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      error,
      options,
      placeholder,
      id,
      className,
      children,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...selectProps
    },
    ref,
  ) {
    const generatedId = useId()
    const selectId = id ?? generatedId
    const errorId = `${selectId}-error`
    const describedBy = [ariaDescribedBy, error ? errorId : undefined]
      .filter(Boolean)
      .join(' ')

    return (
      <div className="w-full">
        <label
          className="mb-1.5 block text-sm font-medium text-gray-700"
          htmlFor={selectId}
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'block min-h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-300',
            className,
          )}
          aria-invalid={error ? true : ariaInvalid}
          aria-describedby={describedBy || undefined}
          {...selectProps}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        {error ? (
          <p className="mt-1.5 text-sm text-red-600" id={errorId} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)

export default Select