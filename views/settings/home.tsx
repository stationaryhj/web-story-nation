'use client'

import { useSettingsStore, BANK_LIST } from '@/store/useStoreSettings'
import { useAccountStore } from '@/store/useStoreData'
import { faChevronRight, faChevronLeft, faCamera } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ChangeEvent } from 'react'
import { useState, useRef } from 'react'

export default function SettingsForm() {
  const router = useRouter()
  const { settings, updateProfile, updateBankAccount, setLanguage, uploadProfileImage } = useSettingsStore()
  const { data: userInfo } = useAccountStore()

  // 입력 폼 상태
  const [nickname, setNickname] = useState(settings.profile.nickname)
  const [email, setEmail] = useState(settings.profile.email)
  const [bank, setBank] = useState(settings.bankAccount.bank)
  const [accountNumber, setAccountNumber] = useState(settings.bankAccount.accountNumber)
  const [accountHolder, setAccountHolder] = useState(settings.bankAccount.accountHolder)

  console.log('@@ userInfo :: ', userInfo);

  // 언어 선택 상태
  const [language, setLanguageState] = useState<'ko' | 'en'>(settings.language)

  // 파일 입력 참조
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    // 프로필 정보 업데이트
    updateProfile({
      nickname,
    })

    // 계좌 정보 업데이트
    updateBankAccount({
      bank,
      accountNumber,
      accountHolder,
    })

    // 언어 설정 업데이트
    setLanguage(language)

    // 저장 완료 알림
    alert('설정이 저장되었습니다.')
  }

  // 프로필 이미지 변경 핸들러
  const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 실제 구현에서는 서버에 이미지 업로드 후 URL을 받아와야 함
    // 여기서는 임시로 파일 객체 URL 생성
    const imageUrl = URL.createObjectURL(file)
    uploadProfileImage(imageUrl)
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-secondary-600 dark:text-dark-secondary-400 hover:text-primary-500 dark:hover:text-dark-primary-600"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
          </button>
          <h1 className="text-xl font-bold text-secondary-900 dark:text-dark-secondary-200">내 계정</h1>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700"
        >
          저장
        </button>
      </div>

      <div className="bg-white dark:bg-dark-background-light rounded-xl shadow-sm p-6 space-y-8">
        {/* 기본 정보 섹션 */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-300 pb-2 border-b border-secondary-200 dark:border-dark-secondary-700">
            기본 정보
          </h2>

          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-200 dark:border-dark-primary-300">
                <Image
                  src={settings.profile.profileImageUrl || '/images/default-profile.jpg'}
                  alt="프로필 이미지"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary-500 dark:bg-dark-primary-600 text-white p-2 rounded-full hover:bg-primary-600 dark:hover:bg-dark-primary-700 transition-colors"
              >
                <FontAwesomeIcon icon={faCamera} className="text-sm" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfileImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* 연동 플랫폼 */}
          <div className="grid grid-cols-4 gap-4 items-center">
            <label className="text-sm text-secondary-700 dark:text-dark-secondary-400">연동 플랫폼</label>
            <div className="col-span-3">
              <input
                type="text"
                value={settings.profile.platform}
                disabled
                className="w-full p-3 bg-secondary-50 dark:bg-dark-secondary-900/30 text-secondary-900 dark:text-dark-secondary-200 rounded-lg border border-secondary-200 dark:border-dark-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500"
              />
            </div>
          </div>

          {/* 닉네임 */}
          <div className="grid grid-cols-4 gap-4 items-center">
            <label htmlFor="nickname" className="text-sm text-secondary-700 dark:text-dark-secondary-400">
              닉네임
            </label>
            <div className="col-span-3">
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="w-full p-3 bg-secondary-50 dark:bg-dark-secondary-900/30 text-secondary-900 dark:text-dark-secondary-200 rounded-lg border border-secondary-200 dark:border-dark-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500"
              />
            </div>
          </div>

          {/* 이메일 */}
          <div className="grid grid-cols-4 gap-4 items-center">
            <label htmlFor="email" className="text-sm text-secondary-700 dark:text-dark-secondary-400">
              이메일
            </label>
            <div className="col-span-3">
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 bg-secondary-50 dark:bg-dark-secondary-900/30 text-secondary-900 dark:text-dark-secondary-200 rounded-lg border border-secondary-200 dark:border-dark-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500"
              />
            </div>
          </div>
        </div>

        {/* 계좌 정보 섹션 */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-300 pb-2 border-b border-secondary-200 dark:border-dark-secondary-700">
            계좌 정보
          </h2>

          {/* 은행 선택 */}
          <div className="grid grid-cols-4 gap-4 items-center">
            <label htmlFor="bank" className="text-sm text-secondary-700 dark:text-dark-secondary-400">
              은행 선택
            </label>
            <div className="col-span-3">
              <select
                id="bank"
                value={bank || ''}
                onChange={e => setBank(e.target.value || null)}
                className="w-full p-3 bg-secondary-50 dark:bg-dark-secondary-900/30 text-secondary-900 dark:text-dark-secondary-200 rounded-lg border border-secondary-200 dark:border-dark-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500"
              >
                <option value="">은행 선택</option>
                {BANK_LIST.map(bankName => (
                  <option key={bankName} value={bankName}>
                    {bankName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 계좌번호 */}
          <div className="grid grid-cols-4 gap-4 items-center">
            <label htmlFor="accountNumber" className="text-sm text-secondary-700 dark:text-dark-secondary-400">
              계좌번호
            </label>
            <div className="col-span-3">
              <input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="계좌번호를 입력하세요 ('-' 없이 입력)"
                className="w-full p-3 bg-secondary-50 dark:bg-dark-secondary-900/30 text-secondary-900 dark:text-dark-secondary-200 rounded-lg border border-secondary-200 dark:border-dark-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500"
              />
            </div>
          </div>

          {/* 예금주 */}
          <div className="grid grid-cols-4 gap-4 items-center">
            <label htmlFor="accountHolder" className="text-sm text-secondary-700 dark:text-dark-secondary-400">
              예금주
            </label>
            <div className="col-span-3">
              <input
                id="accountHolder"
                type="text"
                value={accountHolder}
                onChange={e => setAccountHolder(e.target.value)}
                placeholder="예금주명을 입력하세요"
                className="w-full p-3 bg-secondary-50 dark:bg-dark-secondary-900/30 text-secondary-900 dark:text-dark-secondary-200 rounded-lg border border-secondary-200 dark:border-dark-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500"
              />
            </div>
          </div>
        </div>

        {/* 언어 설정 */}
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4 items-center">
            <label className="text-sm text-secondary-700 dark:text-dark-secondary-400">언어/Language</label>
            <div className="col-span-3">
              <div className="flex rounded-lg border border-secondary-200 dark:border-dark-secondary-700 overflow-hidden">
                <button
                  className={`flex-1 py-3 px-4 transition-colors ${
                    language === 'ko'
                      ? 'bg-primary-500 dark:bg-dark-primary-600 text-white'
                      : 'bg-secondary-50 dark:bg-dark-secondary-900/30 text-secondary-900 dark:text-dark-secondary-200'
                  }`}
                  onClick={() => setLanguageState('ko')}
                >
                  한국어
                </button>
                <button
                  className={`flex-1 py-3 px-4 transition-colors ${
                    language === 'en'
                      ? 'bg-primary-500 dark:bg-dark-primary-600 text-white'
                      : 'bg-secondary-50 dark:bg-dark-secondary-900/30 text-secondary-900 dark:text-dark-secondary-200'
                  }`}
                  onClick={() => setLanguageState('en')}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="space-y-4 pt-4">
          {/* 카카오톡 1:1문의 */}
          <Link
            href="https://pf.kakao.com/_Impxls/chat"
            target="_blank"
            className="flex justify-between items-center p-4 bg-secondary-50 dark:bg-dark-secondary-900/30 rounded-lg hover:bg-secondary-100 dark:hover:bg-dark-secondary-800/50 transition-colors"
          >
            <span className="text-secondary-900 dark:text-dark-secondary-200">카카오톡 1:1문의</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-secondary-500 dark:text-dark-secondary-500" />
          </Link>

          {/* 이용약관 */}
          <Link
            href="/terms"
            className="flex justify-between items-center p-4 bg-secondary-50 dark:bg-dark-secondary-900/30 rounded-lg hover:bg-secondary-100 dark:hover:bg-dark-secondary-800/50 transition-colors"
          >
            <span className="text-secondary-900 dark:text-dark-secondary-200">이용약관</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-secondary-500 dark:text-dark-secondary-500" />
          </Link>

          {/* 개인정보처리방침 */}
          <Link
            href="/privacy"
            className="flex justify-between items-center p-4 bg-secondary-50 dark:bg-dark-secondary-900/30 rounded-lg hover:bg-secondary-100 dark:hover:bg-dark-secondary-800/50 transition-colors"
          >
            <span className="text-secondary-900 dark:text-dark-secondary-200">개인정보처리방침</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-secondary-500 dark:text-dark-secondary-500" />
          </Link>

          {/* 유료 이용 약관 */}
          <Link
            href="/paid-terms"
            className="flex justify-between items-center p-4 bg-secondary-50 dark:bg-dark-secondary-900/30 rounded-lg hover:bg-secondary-100 dark:hover:bg-dark-secondary-800/50 transition-colors"
          >
            <span className="text-secondary-900 dark:text-dark-secondary-200">유료 이용 약관</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-secondary-500 dark:text-dark-secondary-500" />
          </Link>

          {/* 운영정책 */}
          <Link
            href="/policies"
            className="flex justify-between items-center p-4 bg-secondary-50 dark:bg-dark-secondary-900/30 rounded-lg hover:bg-secondary-100 dark:hover:bg-dark-secondary-800/50 transition-colors"
          >
            <span className="text-secondary-900 dark:text-dark-secondary-200">운영정책</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-secondary-500 dark:text-dark-secondary-500" />
          </Link>

          {/* 로그아웃 */}
          <button
            onClick={() => {
              // 로그아웃 로직 구현
              alert('로그아웃되었습니다.')
              router.push('/')
            }}
            className="w-full p-4 bg-secondary-50 dark:bg-dark-secondary-900/30 text-secondary-900 dark:text-dark-secondary-200 rounded-lg hover:bg-secondary-100 dark:hover:bg-dark-secondary-800/50 transition-colors text-center"
          >
            로그아웃
          </button>
        </div>
      </div>
    </>
  )
}
