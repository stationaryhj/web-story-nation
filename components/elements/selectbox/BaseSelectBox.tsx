'use client'

import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import cn from 'classnames'

interface Option<T = string> {
  value: T
  label: string
}

interface BaseSelectBoxProps<T = string> {
  options: Option<T>[]
  selectedOption: Option<T>
  onChange: (option: Option<T>) => void
  className?: string
  placeholder?: string
  label?: string
  isSidebar?: boolean
  sideRound?: boolean
  containerClassName?: string
  selectClassName?: string
  optionClassName?: string
}

export const BaseSelectBox = <T extends string | number>({
  options,
  selectedOption,
  onChange,
  className,
  placeholder = '선택하세요',
  label,
  isSidebar = false,
  sideRound = false,
  containerClassName,
  selectClassName,
  optionClassName,
}: BaseSelectBoxProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 옵션 리스트 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleOptionClick = (option: Option<T>) => {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div
      ref={selectRef}
      className={cn(
        containerClassName,
        className,
        'relative inline-block w-fit max-w-[150px] md:max-w-[220px] text-left'
      )}
    >
      {label && <label className="block text-sm text-text-primary mb-2">{label}</label>}
      <div
        className={cn(
          'cursor-pointer flex items-center justify-between py-2 px-3 text-[11px] md:py-3 md:px-4 md:text-base text-text-primary focus:outline-none w-full',
          sideRound ? 'rounded-l-xl rounded-r-none' : 'rounded-xl',
          isSidebar
            ? 'bg-surface-elevated hover:bg-surface-elevated-hover focus:border-brand border border-border-default'
            : 'bg-surface-elevated hover:bg-surface-elevated-hover border border-border-default',
          selectClassName
        )}
        onClick={toggleDropdown}
      >
        <span className="mr-2 whitespace-nowrap overflow-hidden text-ellipsis">
          {selectedOption.label || placeholder}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-fit min-w-full max-w-[150px] md:max-w-[220px] origin-top-right rounded-lg bg-surface-elevated shadow-lg focus:outline-none">
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map(option => (
              <div
                key={option.value.toString()}
                className={cn(
                  'block py-2 px-3 text-[11px] md:py-3 md:px-4 md:text-base cursor-pointer hover:bg-surface-elevated-hover whitespace-nowrap overflow-hidden text-ellipsis',
                  selectedOption.value === option.value ? 'bg-brand/10 text-brand font-medium' : 'text-text-primary',
                  optionClassName
                )}
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
