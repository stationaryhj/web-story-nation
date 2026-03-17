import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

import { cn } from '@/shared/lib/utils/cn'

import FormFieldHeader from './FormFieldHeader'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
  description?: string
  errorMessage?: string
  /** @deprecated errorMessage를 사용하세요 */
  hasError?: boolean
  showCount?: boolean
  wrapperClassName?: string
}

const inputBase =
  'block w-full rounded-[10px] border px-3.5 py-[13px] text-sm text-secondary-900 placeholder:text-[#909090] placeholder-secondary-400 focus:outline-none focus:ring-0.5'

const inputVariants = {
  default: 'border-[#A6A6A6] focus:border-primary-500 focus:ring-primary-500',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      required,
      description,
      errorMessage,
      hasError = false,
      showCount = false,
      wrapperClassName,
      className,
      maxLength,
      value,
      ...rest
    },
    ref
  ) => {
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className={wrapperClassName}>
        {label && <FormFieldHeader label={label} required={required} description={description} />}
        <div className="flex flex-col items-end gap-y-2">
          <input
            ref={ref}
            type="text"
            value={value}
            maxLength={maxLength}
            className={cn(inputBase, errorMessage || hasError ? inputVariants.error : inputVariants.default, className)}
            {...rest}
          />
          <div className="flex w-full items-center justify-between">
            {errorMessage ? <span className="text-sm text-v2-red">{errorMessage}</span> : <span />}
            {showCount && maxLength !== undefined && (
              <span className="text-sm text-[#6B7280] max-md:text-[12px]">
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

export default FormInput
