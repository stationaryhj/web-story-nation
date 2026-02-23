import React from 'react'

interface FormFieldHeaderProps {
  label: string
  required?: boolean
  description?: string
  count?: number
  maxCount?: number
  countLabel?: string
}

export default function FormFieldHeader({
  label,
  required = false,
  description,
  count,
  maxCount,
  countLabel,
}: FormFieldHeaderProps) {
  const showCount = countLabel !== undefined || (count !== undefined && maxCount !== undefined)

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1">
          <span className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
            {label}
          </span>
          {required && <span className="text-orange-500">*</span>}
        </div>
        {showCount && (
          <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
            {countLabel ?? `${count}/${maxCount}`}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-2">
          {description}
        </p>
      )}
    </div>
  )
}
