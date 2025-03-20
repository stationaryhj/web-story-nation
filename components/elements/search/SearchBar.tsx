'use client'

import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
  initialValue?: string
  autoFocus?: boolean
}

export default function SearchBar({
  placeholder = '검색어를 입력하세요',
  onSearch,
  className = '',
  initialValue = '',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleClear = () => {
    setQuery('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
    if (onSearch) {
      onSearch('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(query)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative w-full max-w-md ${className}`}>
      <div
        className={`flex items-center overflow-hidden rounded-full border bg-white transition-all dark:bg-dark-background ${
          isFocused
            ? 'border-primary-500 shadow-sm dark:border-dark-primary-500'
            : 'border-secondary-200 dark:border-dark-secondary-700'
        }`}
      >
        <button
          type="submit"
          className="px-3 text-secondary-400 transition-colors hover:text-secondary-600 dark:text-dark-secondary-500 dark:hover:text-dark-secondary-400"
          aria-label="검색"
        >
          <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-2 text-secondary-800 outline-none placeholder:text-secondary-400 dark:text-dark-secondary-200 dark:placeholder:text-dark-secondary-600"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 text-secondary-400 transition-colors hover:text-secondary-600 dark:text-dark-secondary-500 dark:hover:text-dark-secondary-400"
            aria-label="지우기"
          >
            <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  )
}
