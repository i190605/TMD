import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
} from 'react'

import { cn } from '../../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    id,
    className,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...inputProps
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const describedBy = [
    ariaDescribedBy,
    error ? errorId : undefined,
    hint ? hintId : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="w-full">
      <label
        className="mb-1.5 block text-sm font-medium text-gray-700"
        htmlFor={inputId}
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'block min-h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-300',
          className,
        )}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {error ? (
        <p className="mt-1.5 text-sm text-red-600" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p className="mt-1.5 text-sm text-gray-500" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default Input