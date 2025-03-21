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
          'w-full py-3 px-4 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all',
          className
        )}
        {...props}
      />
    )
  }
)
