import { cn } from '@/shared/lib/utils/cn'

interface FormFieldHeaderProps {
  label: string
  required?: boolean
  description?: string
  className?: string
}

export default function FormFieldHeader({ label, required = false, description, className }: FormFieldHeaderProps) {
  return (
    <div className={cn('mb-4 max-md:mb-3', className)}>
      <div className=" flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <span className="block font-bold text-secondary-700 dark:text-dark-secondary-400 max-md:text-sm">
            {label}
          </span>
          {required && <span className="text-primary-500">*</span>}
        </div>
      </div>
      {description && (
        <p className="mt-1 text-sm font-medium text-secondary-500 dark:text-dark-secondary-500 max-md:text-xs">
          {description}
        </p>
      )}
    </div>
  )
}
