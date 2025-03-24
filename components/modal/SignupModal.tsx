'use client'

import { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import BaseModal from './BaseModal'
import { BaseButton } from '@/components/elements/button/BaseButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [nickname, setNickname] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [isNicknameValid, setIsNicknameValid] = useState(false)
  const [isNicknameChecked, setIsNicknameChecked] = useState(false)

  // 약관 동의 상태
  const [allAgreed, setAllAgreed] = useState(false)
  const [serviceAgreed, setServiceAgreed] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [paidServiceAgreed, setPaidServiceAgreed] = useState(false)
  const [marketingAgreed, setMarketingAgreed] = useState(false)

  // 모든 필수 동의 여부 확인
  const allRequiredAgreed = serviceAgreed && privacyAgreed && paidServiceAgreed

  // 닉네임 중복 확인
  const checkNickname = () => {
    if (!nickname) {
      toast.error('닉네임을 입력해주세요.')
      return
    }

    if (nickname.length > 20) {
      toast.error('닉네임은 20자 이내로 입력해주세요.')
      return
    }

    // 실제 API 호출 대신 가상의 중복 확인 로직
    const isDuplicate = false // API 호출 결과에 따라 변경

    if (isDuplicate) {
      toast.error('이미 사용 중인 닉네임입니다.')
      setIsNicknameValid(false)
    } else {
      toast.success('사용 가능한 닉네임입니다.')
      setIsNicknameValid(true)
    }

    setIsNicknameChecked(true)
  }

  // 생년월일 유효성 검사
  const isValidBirthdate = (value: string) => {
    if (!value || value.length !== 8) return false

    const year = parseInt(value.substring(0, 4))
    const month = parseInt(value.substring(4, 6))
    const day = parseInt(value.substring(6, 8))

    const currentYear = new Date().getFullYear()
    const age = currentYear - year

    // 기본적인 날짜 유효성 검사
    if (year < 1900 || year > currentYear || month < 1 || month > 12 || day < 1 || day > 31) return false

    // 만 14세 이상 확인
    return age >= 14
  }

  // 모든 약관 동의/해제
  const toggleAllAgreements = () => {
    setAllAgreed(!allAgreed)
    setServiceAgreed(!allAgreed)
    setPrivacyAgreed(!allAgreed)
    setPaidServiceAgreed(!allAgreed)
    setMarketingAgreed(!allAgreed)
  }

  // 개별 약관 동의 시 전체 동의 업데이트
  useEffect(() => {
    if (serviceAgreed && privacyAgreed && paidServiceAgreed && marketingAgreed) {
      setAllAgreed(true)
    } else {
      setAllAgreed(false)
    }
  }, [serviceAgreed, privacyAgreed, paidServiceAgreed, marketingAgreed])

  // 회원가입 제출
  const handleSubmit = () => {
    // 닉네임 유효성 검사
    if (!nickname) {
      toast.error('닉네임을 입력해주세요.')
      return
    }

    if (!isNicknameChecked || !isNicknameValid) {
      toast.error('닉네임 중복 확인이 필요합니다.')
      return
    }

    // 생년월일 유효성 검사
    if (!birthdate) {
      toast.error('생년월일을 입력해주세요.')
      return
    }

    if (!isValidBirthdate(birthdate)) {
      toast.error('유효한 생년월일 형식이 아니거나 만 14세 이상이어야 합니다.')
      return
    }

    // 필수 약관 동의 확인
    if (!allRequiredAgreed) {
      toast.error('필수 약관에 모두 동의해주세요.')
      return
    }

    // 회원가입 처리 로직 구현
    toast.success('회원가입이 완료되었습니다!', {
      onClose: () => {
        // 토스트 메시지가 닫힌 후에 모달을 닫음
        onClose()
      },
      autoClose: 1000, // 2초 후 자동으로 닫힘
    })

    // 토스트 메시지가 보이도록 모달 닫기를 지연시킴
    // onClose() // 즉시 닫지 않음
  }

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="회원가입"
        size="md"
        animation="fade"
        backdropColor="bg-black/70 backdrop-blur-sm"
        footerContent={
          <div className="flex justify-center w-full">
            <BaseButton color="gradient" className="w-full" onClick={handleSubmit}>
              확인
            </BaseButton>
          </div>
        }
      >
        <div className="flex flex-col space-y-6">
          {/* 닉네임 입력 */}
          <div className="space-y-2">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              닉네임
            </label>
            <div className="relative">
              <input
                type="text"
                id="nickname"
                className="w-full rounded-lg border border-gray-300 p-3 pr-20 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-dark-background dark:focus:border-primary-400"
                placeholder="닉네임을 입력하세요. (20자 이내)"
                value={nickname}
                onChange={e => {
                  setNickname(e.target.value)
                  setIsNicknameChecked(false)
                }}
                maxLength={20}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary-500 px-2 py-1 text-xs text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
                onClick={checkNickname}
              >
                중복확인
              </button>
            </div>
          </div>

          {/* 생년월일 입력 */}
          <div className="space-y-2">
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              생년월일
            </label>
            <input
              type="text"
              id="birthdate"
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-dark-background dark:focus:border-primary-400"
              placeholder="ex. 19970404 (숫자 8자리)"
              value={birthdate}
              onChange={e => setBirthdate(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
              maxLength={8}
            />
          </div>

          {/* 안내 문구 */}
          <div className="text-sm text-gray-500 dark:text-gray-400">스토리네이션은 만 14세 이상 이용 가능합니다.</div>

          {/* 약관 동의 */}
          <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex items-center">
              <button
                className="mr-2 text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                onClick={toggleAllAgreements}
              >
                <FontAwesomeIcon
                  icon={allAgreed ? faCheckSquare : faSquare}
                  className={`h-5 w-5 ${allAgreed ? 'text-primary-500 dark:text-primary-400' : ''}`}
                />
              </button>
              <span className="font-medium">모두 동의</span>
            </div>

            {/* 서비스 이용약관 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  className="mr-2 text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                  onClick={() => setServiceAgreed(!serviceAgreed)}
                >
                  <FontAwesomeIcon
                    icon={serviceAgreed ? faCheckSquare : faSquare}
                    className={`h-5 w-5 ${serviceAgreed ? 'text-primary-500 dark:text-primary-400' : ''}`}
                  />
                </button>
                <span className="text-sm">서비스 이용약관(필수)</span>
              </div>
              <a
                href="/terms?tab=service"
                target="_blank"
                className="text-sm text-primary-500 hover:underline dark:text-primary-400"
              >
                보기
              </a>
            </div>

            {/* 개인정보 수집 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  className="mr-2 text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                  onClick={() => setPrivacyAgreed(!privacyAgreed)}
                >
                  <FontAwesomeIcon
                    icon={privacyAgreed ? faCheckSquare : faSquare}
                    className={`h-5 w-5 ${privacyAgreed ? 'text-primary-500 dark:text-primary-400' : ''}`}
                  />
                </button>
                <span className="text-sm">개인정보 수집 및 이용(필수)</span>
              </div>
              <a
                href="/terms?tab=privacy"
                target="_blank"
                className="text-sm text-primary-500 hover:underline dark:text-primary-400"
              >
                보기
              </a>
            </div>

            {/* 유료 이용약관 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  className="mr-2 text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                  onClick={() => setPaidServiceAgreed(!paidServiceAgreed)}
                >
                  <FontAwesomeIcon
                    icon={paidServiceAgreed ? faCheckSquare : faSquare}
                    className={`h-5 w-5 ${paidServiceAgreed ? 'text-primary-500 dark:text-primary-400' : ''}`}
                  />
                </button>
                <span className="text-sm">유료 이용약관(필수)</span>
              </div>
              <a
                href="/terms?tab=paid"
                target="_blank"
                className="text-sm text-primary-500 hover:underline dark:text-primary-400"
              >
                보기
              </a>
            </div>

            {/* 마케팅 정보 수신 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  className="mr-2 text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                  onClick={() => setMarketingAgreed(!marketingAgreed)}
                >
                  <FontAwesomeIcon
                    icon={marketingAgreed ? faCheckSquare : faSquare}
                    className={`h-5 w-5 ${marketingAgreed ? 'text-primary-500 dark:text-primary-400' : ''}`}
                  />
                </button>
                <span className="text-sm">마케팅 정보 수신 동의(선택)</span>
              </div>
              <a
                href="/terms?tab=marketing"
                target="_blank"
                className="text-sm text-primary-500 hover:underline dark:text-primary-400"
              >
                보기
              </a>
            </div>
          </div>
        </div>
      </BaseModal>
      <ToastContainer position="bottom-center" autoClose={3000} />
    </>
  )
}
