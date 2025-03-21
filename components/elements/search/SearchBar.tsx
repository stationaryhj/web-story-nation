'use client'

import { faSearch, faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState, useCallback } from 'react'
import { BaseInput } from '@/components/elements/input/BaseInput'
import { BaseButton } from '@/components/elements/button/BaseButton'
import { BaseSelectBox } from '@/components/elements/selectbox/BaseSelectBox'

// 검색 결과를 위한 목데이터
const MOCK_SEARCH_RESULTS = {
  character: [
    { id: '1', name: '인기 캐릭터 1', gender: 'male', tags: ['로맨스', '판타지'] },
    { id: '2', name: '사랑스러운 캐릭터', gender: 'female', tags: ['로맨스', '일상'] },
    { id: '3', name: '재밌는 캐릭터', gender: 'male', tags: ['코미디', '액션'] },
    { id: '4', name: '판타지 캐릭터', gender: 'female', tags: ['판타지', '모험'] },
    { id: '5', name: '액션 캐릭터', gender: 'male', tags: ['액션', '스릴러'] },
  ],
  creator: [
    { id: '1', name: '인기 작가 A', works: 15 },
    { id: '2', name: '베스트셀러 작가 B', works: 23 },
    { id: '3', name: '신인 작가 C', works: 5 },
    { id: '4', name: '스타 작가 D', works: 45 },
  ],
}

interface SearchOption {
  value: string
  label: string
}

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string, option?: string) => void
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
  const [selectedOption, setSelectedOption] = useState<SearchOption>({ value: 'character', label: '캐릭터명' })
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showNoResults, setShowNoResults] = useState(false)

  const searchOptions: SearchOption[] = [
    { value: 'character', label: '캐릭터명' },
    { value: 'creator', label: '작가명' },
  ]

  // 디바운스 함수 구현
  const debounce = useCallback((fn: Function, delay: number) => {
    let timer: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args), delay)
    }
  }, [])

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    const handler = debounce((value: string) => {
      setDebouncedQuery(value)
      if (value.trim().length > 0) {
        // 실제로는 API 호출하지만, 여기서는 목데이터 필터링
        const filteredResults = MOCK_SEARCH_RESULTS[selectedOption.value as keyof typeof MOCK_SEARCH_RESULTS].filter(
          item => item.name.toLowerCase().includes(value.toLowerCase())
        )
        setSearchResults(filteredResults)
        setShowNoResults(filteredResults.length === 0)
      } else {
        setSearchResults([])
        setShowNoResults(false)
      }
    }, 300)

    handler(query)
    return () => clearTimeout(handler as unknown as NodeJS.Timeout)
  }, [query, selectedOption.value, debounce])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleClear = () => {
    setQuery('')
    setDebouncedQuery('')
    setSearchResults([])
    setShowNoResults(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
    if (onSearch) {
      onSearch('', selectedOption.value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && query.trim()) {
      onSearch(query, selectedOption.value)
    }
  }

  const handleOptionChange = (option: SearchOption) => {
    setSelectedOption(option)
    // 옵션 변경 시 검색 결과 재설정
    if (query.trim()) {
      const filteredResults = MOCK_SEARCH_RESULTS[option.value as keyof typeof MOCK_SEARCH_RESULTS].filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filteredResults)
      setShowNoResults(filteredResults.length === 0)
    }
  }

  return (
    <div className={`w-full ${className} relative`}>
      <div className="mx-auto w-full">
        <div className="bg-white dark:bg-dark-background-DEFAULT p-3 rounded-xl shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-1/5 sm:min-w-[120px] z-50">
              <BaseSelectBox options={searchOptions} selectedOption={selectedOption} onChange={handleOptionChange} />
            </div>
            <div className="flex flex-1 rounded-r-xl overflow-hidden">
              <BaseInput
                ref={inputRef}
                placeholder={`${selectedOption.label}으로 검색하세요`}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onEnterPress={() => {
                  if (query.trim() && onSearch) {
                    onSearch(query, selectedOption.value)
                  }
                }}
                className="rounded-l-none rounded-r-none border-l border-gray-200"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              <BaseButton
                color="primary"
                type="submit"
                className="rounded-l-none rounded-r-xl bg-gray-50 hover:bg-violet-500 hover:text-white text-gray-700 transition-colors"
                disabled={!query.trim()}
              >
                <FontAwesomeIcon icon={faSearch} className="mr-2" />
              </BaseButton>
            </div>
          </form>

          {/* 검색 결과 표시 영역 */}
          {debouncedQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-white dark:bg-dark-background-light shadow-lg overflow-hidden z-50 w-full">
              {showNoResults ? (
                <div className="p-6 text-center text-gray-500">
                  <p>'{debouncedQuery}'에 대한 검색 결과가 없습니다.</p>
                </div>
              ) : (
                searchResults.length > 0 && (
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-3 bg-gray-50 dark:bg-dark-background-DEFAULT border-b border-gray-200 dark:border-dark-secondary-800">
                      <h3 className="font-medium text-gray-800 dark:text-dark-secondary-300">
                        {selectedOption.label} 검색 결과 ({searchResults.length}개)
                      </h3>
                    </div>
                    <ul>
                      {searchResults.map(item => (
                        <li
                          key={item.id}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-dark-background-light border-b border-gray-100 dark:border-dark-secondary-800 cursor-pointer"
                          onClick={() => {
                            if (onSearch) {
                              onSearch(item.name, selectedOption.value)
                              setQuery(item.name)
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800 dark:text-dark-secondary-200">{item.name}</span>
                            {selectedOption.value === 'character' && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  item.gender === 'male'
                                    ? 'bg-blue-100 text-blue-800'
                                    : item.gender === 'female'
                                      ? 'bg-pink-100 text-pink-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {item.gender === 'male' ? '남성' : item.gender === 'female' ? '여성' : '기타'}
                              </span>
                            )}
                            {selectedOption.value === 'creator' && (
                              <span className="text-xs text-gray-600 dark:text-dark-secondary-400">
                                작품 {item.works}개
                              </span>
                            )}
                          </div>
                          {selectedOption.value === 'character' && item.tags && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.tags.map((tag: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-dark-secondary-800 text-gray-700 dark:text-dark-secondary-400 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
