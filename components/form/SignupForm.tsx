'use client'

import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ChangeEvent, FormEvent, useState } from 'react'

interface SignupFormProps {
  onSubmit: (formData: {
    nickname: string
    birthday: string
    termsAgreed: boolean
    marketingAgreed: boolean
  }) => void
  disabled?: boolean
}

export default function SignupForm({ onSubmit, disabled = false }: SignupFormProps) {
  const [formData, setFormData] = useState({
    nickname: '',
    birthday: '',
    termsAgreed: false,
    marketingAgreed: false,
  })

  const [errors, setErrors] = useState({
    nickname: '',
    birthday: '',
    terms: '',
  })

  const [showTerms, setShowTerms] = useState({
    service: false,
    privacy: false,
    marketing: false
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // 에러 상태 초기화
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const toggleTermsView = (term: keyof typeof showTerms) => {
    setShowTerms(prev => ({
      ...prev,
      [term]: !prev[term]
    }))
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.'
      isValid = false
    } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      newErrors.nickname = '닉네임은 2~20자 이내로 입력해주세요.'
      isValid = false
    }

    if (!formData.birthday) {
      newErrors.birthday = '생년월일을 입력해주세요.'
      isValid = false
    } else {
      // 생년월일 유효성 검사 (YYYYMMDD 형식, 만 14세 이상)
      const birthdayRegex = /^(19[0-9][0-9]|20[0-9][0-9])(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/
      
      if (!birthdayRegex.test(formData.birthday)) {
        newErrors.birthday = '생년월일을 올바른 형식(YYYYMMDD)으로 입력해주세요.'
        isValid = false
      } else {
        // 만 14세 이상 체크
        const today = new Date()
        const birthDate = new Date(
          parseInt(formData.birthday.substring(0, 4)),
          parseInt(formData.birthday.substring(4, 6)) - 1,
          parseInt(formData.birthday.substring(6, 8))
        )
        
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (age < 14 || (age === 14 && monthDiff < 0) || 
            (age === 14 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          newErrors.birthday = '만 14세 이상만 가입 가능합니다.'
          isValid = false
        }
      }
    }

    if (!formData.termsAgreed) {
      newErrors.terms = '필수 약관에 동의해주세요.'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-1">
        <label htmlFor="nickname" className="block text-sm font-medium">
          닉네임
        </label>
        <input
          type="text"
          id="nickname"
          name="nickname"
          value={formData.nickname}
          onChange={handleInputChange}
          placeholder="닉네임을 입력하세요 (20자 이내)"
          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.nickname ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={disabled}
          maxLength={20}
        />
        {errors.nickname && <p className="text-sm text-red-500">{errors.nickname}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="birthday" className="block text-sm font-medium">
          생년월일
        </label>
        <input
          type="text"
          id="birthday"
          name="birthday"
          value={formData.birthday}
          onChange={handleInputChange}
          placeholder="ex. 19970320 (숫자 8자리)"
          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.birthday ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={disabled}
          maxLength={8}
        />
        {errors.birthday && <p className="text-sm text-red-500">{errors.birthday}</p>}
        <p className="text-xs text-gray-500">스토리네이션은 만14세 이상 이용 가능합니다.</p>
      </div>

      <div className="space-y-4">
        <div className="pb-2 border-b border-gray-200">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="termsAgreed"
              checked={formData.termsAgreed}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              disabled={disabled}
            />
            <span className="ml-2 text-sm font-medium">모두 동의</span>
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  disabled={disabled}
                />
                <span className="ml-2 text-sm">서비스 이용약관 (필수)</span>
              </label>
              <button
                type="button"
                className="text-sm text-gray-500"
                onClick={() => toggleTermsView('service')}
              >
                <FontAwesomeIcon icon={showTerms.service ? faEyeSlash : faEye} />
                <span className="ml-1">{showTerms.service ? '닫기' : '보기'}</span>
              </button>
            </div>
            {showTerms.service && (
              <div className="mt-2 p-3 text-xs bg-gray-50 rounded-md h-32 overflow-y-auto">
                <p>
                  서비스 이용약관 내용입니다. 실제 내용으로 대체해주세요.
                  서비스 이용약관 내용입니다. 실제 내용으로 대체해주세요.
                  서비스 이용약관 내용입니다. 실제 내용으로 대체해주세요.
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  disabled={disabled}
                />
                <span className="ml-2 text-sm">개인정보 수집 및 이용 (필수)</span>
              </label>
              <button
                type="button"
                className="text-sm text-gray-500"
                onClick={() => toggleTermsView('privacy')}
              >
                <FontAwesomeIcon icon={showTerms.privacy ? faEyeSlash : faEye} />
                <span className="ml-1">{showTerms.privacy ? '닫기' : '보기'}</span>
              </button>
            </div>
            {showTerms.privacy && (
              <div className="mt-2 p-3 text-xs bg-gray-50 rounded-md h-32 overflow-y-auto">
                <p>
                  개인정보 수집 및 이용 약관 내용입니다. 실제 내용으로 대체해주세요.
                  개인정보 수집 및 이용 약관 내용입니다. 실제 내용으로 대체해주세요.
                  개인정보 수집 및 이용 약관 내용입니다. 실제 내용으로 대체해주세요.
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="marketingAgreed"
                  checked={formData.marketingAgreed}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  disabled={disabled}
                />
                <span className="ml-2 text-sm">마케팅 정보 수신 동의 (선택)</span>
              </label>
              <button
                type="button"
                className="text-sm text-gray-500"
                onClick={() => toggleTermsView('marketing')}
              >
                <FontAwesomeIcon icon={showTerms.marketing ? faEyeSlash : faEye} />
                <span className="ml-1">{showTerms.marketing ? '닫기' : '보기'}</span>
              </button>
            </div>
            {showTerms.marketing && (
              <div className="mt-2 p-3 text-xs bg-gray-50 rounded-md h-32 overflow-y-auto">
                <p>
                  마케팅 정보 수신 동의 약관 내용입니다. 실제 내용으로 대체해주세요.
                  마케팅 정보 수신 동의 약관 내용입니다. 실제 내용으로 대체해주세요.
                  마케팅 정보 수신 동의 약관 내용입니다. 실제 내용으로 대체해주세요.
                </p>
              </div>
            )}
          </div>
        </div>
        {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
      </div>

      <button
        type="submit"
        disabled={disabled}
        className={`w-full py-3 rounded-md font-medium text-white ${
          disabled ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        확인
      </button>
    </form>
  )
} 