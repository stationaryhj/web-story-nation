'use client'

import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import cn from 'classnames'

interface Option {
  value: number
  label: string
}

interface SidebarSelectBoxProps {
  options: Option[]
  selectedOption: Option
  onChange: (option: Option) => void
  className?: string
  placeholder?: string
  label?: string
  isSidebar?: boolean
}

export const SidebarSelectBox = ({
  options,
  selectedOption,
  onChange,
  className,
  placeholder = '선택하세요',
  label,
  isSidebar = false,
}: SidebarSelectBoxProps) => {
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

  const handleOptionClick = (option: Option) => {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div
      ref={selectRef}
      className={cn(
        'relative inline-block w-full text-left',
        isSidebar ? 'max-w-[200px]' : 'max-w-[90px] sm:max-w-[90px] md:max-w-[120px]',
        className
      )}
    >
      {label && <label className="block text-sm text-secondary-700 dark:text-dark-secondary-300 mb-2">{label}</label>}
      <div
        className={cn(
          'cursor-pointer flex items-center justify-between rounded-xl bg-white py-2 px-3 text-[11px] md:py-3 md:px-4 md:text-base text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border border-gray-200',
          isSidebar ? 'w-full' : 'rounded-r-none rounded-l-xl'
        )}
        onClick={toggleDropdown}
      >
        <span className="mr-2 truncate">{selectedOption.label || placeholder}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full origin-top-right rounded-lg bg-white shadow-lg focus:outline-none">
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map(option => (
              <div
                key={option.value}
                className={cn(
                  'block py-2 px-3 text-[11px] md:py-3 md:px-4 md:text-base cursor-pointer hover:bg-gray-100',
                  selectedOption.value === option.value ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-700'
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
