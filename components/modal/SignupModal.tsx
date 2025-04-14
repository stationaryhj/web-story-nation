'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import BaseModal from './BaseModal'
import { BaseButton } from '@/components/elements/button/BaseButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccountStore } from '@/store/useAccountStore'
import { contentApi } from '@/services/api/storyNationApi'
import { createPortal } from 'react-dom'
import Image from 'next/image'
interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  state: 'signup' | 'reward'
}

export default function SignupModal({ isOpen, onClose, onSuccess, state = 'signup' }: SignupModalProps) {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [isNicknameValid, setIsNicknameValid] = useState(false)
  const [isNicknameChecked, setIsNicknameChecked] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [birthError, setBirthError] = useState<string | null>(null)

  // 계정 스토어에서 회원가입 함수와 로딩 상태 가져오기
  const { registerWithSocialData, loading, error } = useAccountStore()

  // 약관 동의 상태
  const [allAgreed, setAllAgreed] = useState(false)
  const [serviceAgreed, setServiceAgreed] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [paidServiceAgreed, setPaidServiceAgreed] = useState(false)
  const [marketingAgreed, setMarketingAgreed] = useState(false)

  // 모든 필수 동의 여부 확인
  const allRequiredAgreed = serviceAgreed && privacyAgreed && paidServiceAgreed

  // 닉네임 중복 확인
  const checkNickname = async () => {
    if (!nickname) {
      toast.error('닉네임을 입력해주세요.')
      return
    }

    if (nickname.length > 20) {
      toast.error('닉네임은 20자 이내로 입력해주세요.')
      return
    }

    const response = await contentApi.NicknmCheck(nickname)
    if (response.data.result.err === 0) {
      toast.success('사용 가능한 닉네임입니다.')
      setIsNicknameValid(true)
      setIsNicknameChecked(true)
    } else {
      toast.error('이미 사용 중인 닉네임입니다.')
      setIsNicknameValid(false)
      setIsNicknameChecked(true)
    }
  }

  // 생년월일 유효성 검사
  const isValidBirthdate = (value: string) => {
    console.log('Starting birthdate validation for:', value)
    if (!value) {
      console.log('Empty value, clearing error')
      setBirthError(null)
      return false
    }

    // 8자리 완성 여부 확인 (최종 제출 또는 포커스 아웃 시)
    if (value.length > 0 && value.length < 8) {
      console.log('Incomplete birthdate (less than 8 digits)')
      setBirthError('생년월일 8자리를 모두 입력해주세요.')
      return false
    }

    // 숫자가 한 자리라도 입력된 경우에만 검사
    if (value.length > 0) {
      // 연도 검사 (1900년 이상)
      if (value.length >= 4) {
        const year = parseInt(value.substring(0, 4))
        console.log('Checking year:', year)
        if (year < 1900) {
          console.log('Invalid year, setting error')
          setBirthError('1900년 이상의 연도를 입력해주세요.')
          return false
        }
      }

      // 월 검사 (01-12)
      if (value.length >= 6) {
        const month = parseInt(value.substring(4, 6))
        console.log('Checking month:', month)
        if (month < 1 || month > 12) {
          console.log('Invalid month, setting error')
          setBirthError('월은 01부터 12까지 입력 가능합니다.')
          return false
        }
      }

      // 일 검사 (해당 월의 마지막 날짜까지)
      if (value.length === 8) {
        const year = parseInt(value.substring(0, 4))
        const month = parseInt(value.substring(4, 6))
        const day = parseInt(value.substring(6, 8))
        const lastDayOfMonth = new Date(year, month, 0).getDate()

        console.log('Checking day:', day, 'Last day of month:', lastDayOfMonth)
        if (day < 1 || day > lastDayOfMonth) {
          console.log('Invalid day, setting error')
          setBirthError(`${month}월은 01부터 ${lastDayOfMonth}까지 입력 가능합니다.`)
          return false
        }

        // 만 14세 검사 (UTC 기준)
        const birthDate = new Date(Date.UTC(year, month - 1, day))
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()

        console.log('Checking age:', age, 'Month diff:', monthDiff)
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          if (age - 1 < 14) {
            console.log('Invalid age (under 14), setting error')
            setBirthError('만 14세 이상이어야 합니다.')
            return false
          }
        } else if (age < 14) {
          console.log('Invalid age (under 14), setting error')
          setBirthError('만 14세 이상이어야 합니다.')
          return false
        }
      }
    }

    console.log('Validation passed, clearing error')
    setBirthError(null)
    return true
  }

  // 생년월일 입력 처리
  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8)
    setBirthdate(value)
    // 입력 중에는 에러 메시지를 표시하지 않음
    setBirthError(null)
  }

  // 생년월일 focus 해제 처리
  const handleBirthdateBlur = () => {
    console.log('Birthdate blur event triggered')
    if (birthdate.length > 0) {
      console.log('Validating birthdate:', birthdate)
      const isValid = isValidBirthdate(birthdate)
      console.log('Validation result:', isValid)
      console.log('Current birthError:', birthError)
    }
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

  // 완료 화면에서 확인 버튼 클릭 시 로그인 페이지로 이동
  const handleCompleteConfirm = () => {
    onClose()
    
    // router.push('/')
  }

  // 회원가입 제출
  const handleSubmit = async () => {
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
      setBirthError('생년월일을 입력해주세요.')
      return
    }

    if (!isValidBirthdate(birthdate)) {
      return // isValidBirthdate 함수 내에서 이미 에러 메시지를 설정하므로 여기서는 추가 메시지 없음
    }

    // 필수 약관 동의 확인
    if (!allRequiredAgreed) {
      toast.error('필수 약관에 모두 동의해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      // 회원가입 처리 호출 (성공 콜백 전달)
      const success = await registerWithSocialData(nickname, birthdate, marketingAgreed, onSuccess)

      if (success) {
        // 회원가입 성공 시 완료 화면으로 전환
        setIsCompleted(true)
      } else {
        // 실패 메시지 표시
        toast.error(error || '회원가입에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (err) {
      console.error('회원가입 오류:', err)
      toast.error('회원가입 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 에러 메시지 표시
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    console.log('console', isNicknameChecked, isNicknameValid)
  }, [isNicknameChecked, isNicknameValid])

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsCompleted(false)
        setNickname('')
        setBirthdate('')
        setIsNicknameValid(false)
        setIsNicknameChecked(false)
        setAllAgreed(false)
        setServiceAgreed(false)
        setPrivacyAgreed(false)
        setPaidServiceAgreed(false)
        setMarketingAgreed(false)
      }, 300) // 모달 애니메이션이 완료된 후 상태 초기화
    }
  }, [isOpen])

  // 회원가입 양식 내용
  const signupContent = (
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
            className={`w-full rounded-lg border p-3 pr-20 focus:outline-none dark:bg-dark-background
              ${
                isNicknameChecked && !isNicknameValid
                  ? 'border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500'
                  : 'border-gray-300 focus:border-primary-500 dark:border-gray-600 dark:focus:border-primary-400'
              }`}
            placeholder="닉네임을 입력하세요. (20자 이내)"
            value={nickname}
            onChange={e => {
              setNickname(e.target.value)
              setIsNicknameChecked(false)
              setIsNicknameValid(false)
            }}
            maxLength={20}
            disabled={loading || isSubmitting}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary-500 px-2 py-1 text-xs text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
            onClick={checkNickname}
            disabled={loading || isSubmitting}
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
          className={`w-full rounded-lg border p-3 focus:outline-none dark:bg-dark-background
            ${
              birthError
                ? 'border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500'
                : 'border-gray-300 focus:border-primary-500 dark:border-gray-600 dark:focus:border-primary-400'
            }`}
          placeholder="ex. 19970404 (숫자 8자리)"
          value={birthdate}
          onChange={handleBirthdateChange}
          onBlur={handleBirthdateBlur}
          maxLength={8}
          disabled={loading || isSubmitting}
        />
        {birthError && <p className="text-sm text-red-500 dark:text-red-400">{birthError}</p>}
      </div>

      {/* 안내 문구 */}
      <div className="text-sm text-gray-500 dark:text-gray-400">스토리네이션은 만 14세 이상 이용 가능합니다.</div>

      {/* 약관 동의 */}
      <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-center">
          <button
            className="mr-2 text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
            onClick={toggleAllAgreements}
            disabled={loading || isSubmitting}
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
              disabled={loading || isSubmitting}
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
              disabled={loading || isSubmitting}
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
              disabled={loading || isSubmitting}
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
              disabled={loading || isSubmitting}
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
  )

  // 가입 완료 내용
  const completionContent = (
    <div className="flex flex-col items-center py-6 space-y-6">
      {/* 제목 */}
      <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
        가입완료!
        <br />
        30펜을 지급해 드렸어요
      </h1>

      {/* 펜 아이콘 */}
      <div className="w-24 h-24 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
        <Image src="/images/pen/pen_primary.svg" alt="pen" width={24} height={24} />
      </div>

      {/* 안내 메시지 */}
      <p className="text-center text-gray-600 dark:text-gray-300">
        스토리네이션에 오신 것을 환영합니다!
        <br />
        지급된 펜으로 캐릭터를 만들어보세요.
      </p>
    </div>
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isCompleted ? '' : '회원가입'}
      size="md"
      animation="none"
      backdropColor="bg-black/70 backdrop-blur-sm"
      showCloseButton={!isCompleted}
      preventBackdropClose={isCompleted || loading || isSubmitting}
      footerContent={
        <div className="flex justify-center w-full">
          <BaseButton
            color="gradient"
            className="w-full"
            onClick={isCompleted ? handleCompleteConfirm : handleSubmit}
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? '처리 중...' : '확인'}
          </BaseButton>
        </div>
      }
    >
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          {state === 'reward' ? (
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {completionContent}
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {signupContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseModal>
  )
}
