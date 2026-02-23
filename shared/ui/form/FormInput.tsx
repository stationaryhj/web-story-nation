import React from 'react'
import type { ChangeEvent } from 'react'
import FormFieldHeader from './FormFieldHeader'

interface FormInputProps {
  label?: string
  required?: boolean
  description?: string
  name: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  maxLength?: number
  hasError?: boolean
  id?: string
}

export default function FormInput({
  label,
  required,
  description,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  hasError = false,
  id,
}: FormInputProps) {
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
      <input
        type="text"
        id={id ?? name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-lg border ${
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-secondary-200 focus:border-primary-500 focus:ring-primary-500'
        } px-4 py-3 text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-1 dark:border-dark-secondary-200/10 dark:bg-dark-background-light dark:text-dark-secondary-200 dark:placeholder-dark-secondary-500`}
        maxLength={maxLength}
      />
    </div>
  )
}
