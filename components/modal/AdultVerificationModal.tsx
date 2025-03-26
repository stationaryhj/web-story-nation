'use client'

import { useState } from 'react'
import BaseModal from './BaseModal'

interface AdultVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify?: () => void // 본인인증 성공 시 호출될 콜백
}

export default function AdultVerificationModal({ isOpen, onClose, onVerify }: AdultVerificationModalProps) {
  const [isVerifying, setIsVerifying] = useState(false)

  // 본인인증 처리 함수
  const handleVerify = async () => {
    try {
      setIsVerifying(true)

      // 여기에 본인인증 API 호출 코드 추가
      // const response = await fetch('/api/verify-adult', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ /* 필요한 데이터 */ }),
      // });

      // if (response.ok) {
      //   const data = await response.json();
      //   console.log('본인인증 성공:', data);
      //
      //   if (onVerify) {
      //     onVerify();
      //   }
      //
      //   onClose();
      // } else {
      //   const error = await response.json();
      //   console.error('본인인증 실패:', error);
      //   alert('본인인증에 실패했습니다. 다시 시도해주세요.');
      // }

      // 임시 구현: 바로 성공으로 처리 (실제 API 연동 전까지만 사용)
      console.log('본인인증 프로세스 시작')

      // 인증 성공 시 콜백 실행
      if (onVerify) {
        onVerify()
      }

      onClose()
    } catch (error) {
      console.error('본인인증 중 오류 발생:', error)
      alert('본인인증 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsVerifying(false)
    }
  }

  // 푸터에 들어갈 버튼 컴포넌트
  const footerButtons = (
    <div className="flex justify-end space-x-3">
      <button
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        disabled={isVerifying}
      >
        취소
      </button>
      <button
        onClick={handleVerify}
        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors flex items-center justify-center"
        disabled={isVerifying}
      >
        {isVerifying ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            인증 중...
          </>
        ) : (
          '본인인증하기'
        )}
      </button>
    </div>
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="성인인증이 필요한 서비스"
      size="md"
      animation="scale"
      showCloseButton={true}
      preventBackdropClose={isVerifying}
      footerContent={footerButtons}
    >
      <div className="mb-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          성인인증을 마친 뒤 성인모드 캐릭터를 생성할 수 있어요!
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          본인확인 서비스를 통해 만 19세 이상 성인임을 인증해주세요.
        </p>
      </div>
    </BaseModal>
  )
}
