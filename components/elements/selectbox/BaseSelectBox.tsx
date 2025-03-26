'use client'

import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import cn from 'classnames'

interface Option {
  value: string
  label: string
}

interface BaseSelectBoxProps {
  options: Option[]
  selectedOption: Option
  onChange: (option: Option) => void
  className?: string
  placeholder?: string
}

export const BaseSelectBox = ({
  options,
  selectedOption,
  onChange,
  className,
  placeholder = '선택하세요',
}: BaseSelectBoxProps) => {
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
    <div ref={selectRef} className={cn('relative inline-block w-full text-left', className)}>
      <div
        className="cursor-pointer flex items-center justify-between rounded-l-xl bg-gray-100 py-3 px-4 text-base text-gray-800 hover:bg-gray-200 focus:outline-none"
        onClick={toggleDropdown}
      >
        <span className="mr-2 truncate">{selectedOption.label || placeholder}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map(option => (
              <div
                key={option.value}
                className={cn(
                  'block px-4 py-2 text-sm cursor-pointer hover:bg-gray-100',
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
