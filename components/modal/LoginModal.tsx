'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BaseModal from './BaseModal'
import SignupModal from './SignupModal'
import { useAccountStore } from '@/store/useAccountStore'
import { OAuthProvider } from '@/types/login'
import GuestLoginForm from '@/components/form/GuestLoginForm'
import { toast } from 'react-toastify'
import { authService } from '@/services/auth'
import { SpeechBubble } from '@/components/animation/SpeechBubble'
import Image from 'next/image'
interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [showSignup, setShowSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isNewUserMode, setIsNewUserMode] = useState(false)
  // 이벤트 처리 중인지 추적하는 ref (중복 메시지 처리 방지)
  const processingCallback = useRef(false)

  // 모달이 열리면 authService 초기화
  useEffect(() => {
    if (isOpen) {
      authService.init().catch(err => {
        console.error('인증 서비스 초기화 오류:', err)
      })
    }
  }, [isOpen])

  // 로그인 타임아웃 핸들러
  const handleLoginTimeout = useCallback(() => {
    setLoading(false)

    // 타임아웃 관련 데이터 정리
    const timeoutId = localStorage.getItem('naver_login_timeout')
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId))
      localStorage.removeItem('naver_login_timeout')
    }
    localStorage.removeItem('social_login_state')
    localStorage.removeItem('social_login_type')

    // 콜백 처리 상태 초기화
    processingCallback.current = false
  }, [])

  // 소셜 로그인 콜백 메시지 처리 함수
  useEffect(() => {
    if (!isOpen) return

    const handleCallbackMessage = async (event: MessageEvent) => {
      // 출처 확인 (보안)
      if (event.origin !== window.location.origin) {
        console.warn('알 수 없는 출처의 메시지 무시됨:', event.origin)
        return
      }

      // 메시지 데이터 확인
      const data = event.data
      if (!data || typeof data !== 'object') return

      // 소셜 로그인 데이터 확인
      if (data.code || data.error) {
        // 이미 처리 중인 경우 중복 처리 방지
        if (processingCallback.current) {
          console.log('이미 콜백을 처리 중입니다. 중복 처리 방지')
          return
        }

        // 처리 중 상태로 설정
        processingCallback.current = true

        // 에러 처리
        if (data.error) {
          setLoading(false)
          processingCallback.current = false
          return
        }

        // 콜백 처리
        try {
          setLoading(true)

          // 타임아웃 클리어
          const timeoutId = localStorage.getItem('naver_login_timeout')
          if (timeoutId) {
            clearTimeout(parseInt(timeoutId))
            localStorage.removeItem('naver_login_timeout')
          }

          // authService.handleCallback 호출
          const result = await authService.handleCallback({
            code: data.code,
            state: data.state,
          })

          if (result.success) {
            // 로그인 성공 시 상태 업데이트 (useAccountStore)
            if (result.data) {
              useAccountStore.getState().setLoginState(true, result.data)
              await useAccountStore.getState().updateUserInfoFromUserInfo2()
              await useAccountStore.getState().fetchWriterInfo()

              // 성공 시에만 모달 닫기
              onClose()
            }
          } else if (result.signupRequired || result.needSignup) {
            // 회원가입 필요 - 모달 닫지 않고 회원가입 모달로 전환
            setShowSignup(true)
          } else {
            // 기타 오류
            toast.error(result.error || '로그인에 실패했습니다.')
          }
        } catch (error) {
          console.error('콜백 처리 중 오류 발생:', error)
        } finally {
          setLoading(false)
          // 처리 완료 후 상태 초기화
          processingCallback.current = false
        }
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener('message', handleCallbackMessage)

    // cleanup 함수
    return () => {
      window.removeEventListener('message', handleCallbackMessage)
      // 모달이 닫힐 때 처리 상태 초기화
      processingCallback.current = false
    }
  }, [isOpen, onClose])

  const handleSignupClick = () => {
    setShowSignup(true)
  }

  const handleSignupClose = () => {
    setShowSignup(false)
  }

  const { guestLogin } = useAccountStore()

  // 통합된 소셜 로그인 처리 함수
  const handleSocialLogin = async (provider: OAuthProvider) => {
    try {
      setLoading(true)

      const result = await authService.socialLogin(provider, {
        onLoginTimeout: handleLoginTimeout,
      })

      if (!result.success && result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('소셜 로그인 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async (nickname: string) => {
    try {
      setLoading(true)
      let isSuccess = await guestLogin(nickname)
      if (isSuccess) {
        onClose()
        router.push('/')
      }
    } catch (err) {
      console.error('게스트 로그인 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  // 회원가입 성공 시 모달 닫기
  const handleSignupSuccess = () => {
    // 임시 저장 데이터 정리
    localStorage.removeItem('social_login_state')
    localStorage.removeItem('social_login_type')

    setShowSignup(false)
    onClose()
  }

  const handleNewUserClick = () => {
    setIsNewUserMode(true)
  }

  return (
    <>
      {/* 로그인 모달 - 회원가입 모달이 표시 중일 때 숨김 */}
      <BaseModal
        isOpen={isOpen && !showSignup}
        onClose={onClose}
        title={isNewUserMode ? '캐릭터와 설레는 대화를 시작하세요!' : '로그인'}
        size="md"
      >
        <div className="flex flex-col pb-6">
          {/* 신규 가입 모드일 때만 보여줄 헤더 */}
          {isNewUserMode && (
            <>
              <div className="flex flex-col justify-center items-center">
                <div className="text-sm text-gray-500">캐릭터부터 시작하는 세계관 공동 창작</div>
                <div className="text-sm text-gray-500">스토리네이션</div>
              </div>
              <div>
                <SpeechBubble text="3초만에 가입하고 30펜 받으세요!" position="center" />
              </div>
            </>
          )}
          <div className="space-y-4 mt-4">
            <button
              onClick={() => handleSocialLogin('GOOGLE')}
              disabled={loading}
              className="flex w-full h-12 items-center justify-start rounded-full bg-[#F2F2F2] px-[71px] font-medium text-white transition-colors"
            >
              <div className="flex items-center justify-center gap-4">
                <span>
                  <Image src="/images/symbol/google.svg" alt="구글" width={20} height={20} />
                </span>
                <span className="text-[#1F1F1F]">구글 계정으로 로그인</span>
              </div>
            </button>
            <button
              onClick={() => handleSocialLogin('KAKAO')}
              disabled={loading}
              className="flex w-full h-12 items-center justify-center rounded-full bg-[#FEE500] font-medium text-yellow-900 shadow transition-colors"
            >
              <div className="flex items-center justify-center gap-4">
                <span>
                  <Image src="/images/social_logo/kakao.svg" alt="카카오" width={20} height={20} />
                </span>
                <span className="text-[#000000D9]">카카오 계정으로 로그인</span>
              </div>
            </button>
            <button
              onClick={() => handleSocialLogin('APPLE')}
              disabled={loading}
              className="flex w-full h-12 items-center justify-start rounded-full px-[71px] bg-black font-medium text-white shadow transition-colors"
            >
              <div className="flex items-center justify-center gap-4">
                <span>
                  <Image src="/images/social_logo/apple.png" alt="애플" width={20} height={20} />
                </span>
                <span>애플 계정으로 로그인</span>
              </div>
            </button>

            <button
              onClick={() => handleSocialLogin('NAVER')}
              disabled={loading}
              className="flex w-full h-12 items-center justify-center rounded-full bg-[#03C75A] py-1 font-medium text-white shadow transition-colors"
            >
              <div className="flex items-center justify-center gap-4">
                <span>
                  <Image src="/images/symbol/naver.svg" alt="네이버" width={20} height={20} />
                </span>
                <span>네이버 계정으로 로그인</span>
              </div>
            </button>
            {!isNewUserMode ? (
              <button
                onClick={handleNewUserClick}
                className="flex w-full h-12 items-center justify-between rounded-full px-[61px] bg-gradient-to-br from-[#109af7] to-[#4251f0] font-medium text-white"
              >
                <div className="flex items-center justify-center gap-1 w-full">
                  <span>
                    <Image src="/images/symbol/storyNation.png" alt="스토리네이션 심볼" width={50} height={50} />
                  </span>
                  <span className="text-white w-full text-center">신규 유저 가입하기</span>
                </div>
              </button>
            ) : (
              <button
                onClick={handleSignupClick}
                className="flex w-full h-12 items-center justify-between rounded-full px-[61px] bg-gradient-to-br from-[#109af7] to-[#4251f0] font-medium text-white"
              >
                <div className="flex items-center justify-center gap-1 w-full">
                  <span>
                    <Image src="/images/symbol/storyNation.png" alt="스토리네이션 심볼" width={50} height={50} />
                  </span>
                  <span className="text-white w-full text-center">스토리 네이션 회원가입</span>
                </div>
              </button>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-background text-gray-500">또는</span>
            </div>
          </div>

          <GuestLoginForm onSubmit={handleGuestLogin} disabled={loading} />

          {/* 신규 가입 모드일 때만 약관 동의 문구 표시 */}
          {isNewUserMode && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <p>계속 진행하면 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.</p>
            </div>
          )}
        </div>
      </BaseModal>

      {/* 회원가입 모달 - isOpen 조건만 체크하여 로그인 모달과 독립적으로 표시 */}
      {showSignup && <SignupModal isOpen={isOpen} onClose={handleSignupClose} onSuccess={handleSignupSuccess} />}
    </>
  )
}
