'use client';

import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: DropdownOption) => {
    if (onChange) {
      onChange(option.value);
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type='button'
        onClick={handleToggle}
        className={`flex w-full items-center justify-between rounded-md border border-border-default bg-surface px-3 py-2 text-left transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? 'text-text-primary' : 'text-text-muted'}>
          {selectedOption ? (
            <div className='flex items-center'>
              {selectedOption.icon && <span className='mr-2'>{selectedOption.icon}</span>}
              {selectedOption.label}
            </div>
          ) : (
            placeholder
          )}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`ml-2 h-3 w-3 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-border-default bg-surface-elevated shadow-lg ${menuClassName}`}
          role='listbox'
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`flex cursor-pointer items-center px-3 py-2 text-text-primary hover:bg-surface-elevated-hover ${
                option.value === value ? 'bg-brand/10' : ''
              }`}
              role='option'
              aria-selected={option.value === value}
            >
              {option.icon && <span className='mr-2'>{option.icon}</span>}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
