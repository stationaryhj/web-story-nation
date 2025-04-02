'use client'

import React from 'react'
import { BaseSelectBox } from './BaseSelectBox'

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
  return (
    <BaseSelectBox<number>
      options={options}
      selectedOption={selectedOption}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      label={label}
      isSidebar={isSidebar}
    />
  )
}
