import { cn } from '@/shared/lib/utils/cn'

import FormFieldHeader from './FormFieldHeader'

interface FormButtonGroupOption {
  label: string
  value: string
}

interface FormButtonGroupProps {
  label?: string
  required?: boolean
  description?: string
  options: FormButtonGroupOption[]
  value: string
  onChange: (value: string) => void
  errorMessage?: string
  wrapperClassName?: string
  className?: string
}

const buttonBase =
  'flex-1 rounded-[10px] max-md:text-sm py-[13px] max-md:py-[11px] leading-[1.4] font-semibold transition-colors duration-200'

const buttonVariants = {
  active: 'bg-primary-500 text-white',
  inactive: 'bg-secondary-100 text-gray-500 hover:bg-secondary-200',
  error: 'border border-red-500',
}

export default function FormButtonGroup({
  label,
  required,
  description,
  options,
  value,
  onChange,
  errorMessage,
  wrapperClassName,
  className,
}: FormButtonGroupProps) {
  return (
    <div className={wrapperClassName}>
      {label && <FormFieldHeader label={label} required={required} description={description} />}
      <div className={cn('flex gap-3 max-md:gap-2', className)}>
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            className={cn(
              buttonBase,
              value === option.value ? buttonVariants.active : buttonVariants.inactive,
              errorMessage && !value && buttonVariants.error
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {errorMessage && <span className="mt-2 text-sm text-v2-red">{errorMessage}</span>}
    </div>
  )
}
