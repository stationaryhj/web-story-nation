import React from 'react'
import type { ChangeEvent } from 'react'
import FormFieldHeader from './FormFieldHeader'

interface FormTextareaProps {
  label?: string
  required?: boolean
  description?: string
  name: string
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onFocus?: () => void
  placeholder?: string
  rows?: number
  maxLength?: number
  hasError?: boolean
  id?: string
}

export default function FormTextarea({
  label,
  required,
  description,
  name,
  value,
  onChange,
  onFocus,
  placeholder,
  rows = 4,
  maxLength,
  hasError = false,
  id,
}: FormTextareaProps) {
  return (
    <div>
      {label && (
        <FormFieldHeader
          label={label}
          required={required}
          description={description}
          count={maxLength !== undefined ? value.length : undefined}
          maxCount={maxLength}
        />
      )}
      <textarea
        id={id ?? name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 rounded-lg border ${
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-secondary-200 focus:border-primary-500 focus:ring-primary-500'
        } dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none text-sm sm:text-base`}
        maxLength={maxLength}
      />
    </div>
  )
}
