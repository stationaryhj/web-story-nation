import React, { forwardRef } from 'react'
import cn from 'classnames'

interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  onEnterPress?: () => void
}

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  ({ type = 'text', placeholder, value, onChange, className, onEnterPress, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onEnterPress) {
        e.preventDefault()
        onEnterPress()
      }
    }

    return (
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full py-2 px-3 md:py-3 md:px-4 bg-gray-100 text-[12px] md:text-base text-gray-800 focus:outline-none transition-all',
          className
        )}
        {...props}
      />
    )
  }
)
