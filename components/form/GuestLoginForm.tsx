'use client'

import { ChangeEvent, FormEvent, useState } from 'react'

interface GuestLoginFormProps {
  onSubmit: (nickname: string) => void
  disabled?: boolean
}

export default function GuestLoginForm({ onSubmit, disabled = false }: GuestLoginFormProps) {
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value)
    if (error) setError(null)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }

    if (nickname.trim().length < 2 || nickname.trim().length > 20) {
      setError('닉네임은 2~20자 이내로 입력해주세요.')
      return
    }

    onSubmit(nickname.trim())
  }


  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col space-y-2">
        <div className="flex">
          <input
            type="text"
            value={nickname}
            onChange={handleChange}
            placeholder="닉네임을 입력하세요"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
            maxLength={20}
          />
          <button
            type="submit"
            disabled={disabled}
            className={`px-4 py-3 bg-blue-500 text-white rounded-r-md ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            시작하기
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </form>
  )
} 