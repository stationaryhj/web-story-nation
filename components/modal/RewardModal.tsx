'use client'

import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import BaseModal from './BaseModal'
import { BaseButton } from '@/components/elements/button/BaseButton'

interface RewardModalProps {
  isOpen: boolean
  onClose: () => void
  isAfterSignup?: boolean // 회원가입 후 표시되는지 여부
}

export default function RewardModal({ isOpen, onClose, isAfterSignup = false }: RewardModalProps) {
  const router = useRouter()

  const handleConfirm = () => {
    onClose()

    // 회원가입 완료 후에만 로그인 페이지로 이동
    if (isAfterSignup) {
      router.push('/')
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
      animation="fade"
      backdropColor="bg-black/70 backdrop-blur-sm"
      showCloseButton={false}
      preventBackdropClose={true}
      footerContent={
        <div className="flex justify-center w-full">
          <BaseButton color="gradient" className="w-full" onClick={handleConfirm}>
            확인
          </BaseButton>
        </div>
      }
    >
      <div className="flex flex-col items-center py-6 space-y-6">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          보상 지급!
          <br />
          30펜을 지급해 드렸어요
        </h1>

        {/* 펜 아이콘 */}
        <div className="w-24 h-24 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
          <FontAwesomeIcon icon={faPen} className="h-12 w-12 text-primary-500 dark:text-primary-400" />
        </div>

        {/* 안내 메시지 */}
        <p className="text-center text-gray-600 dark:text-gray-300">
          {isAfterSignup ? (
            <>
              스토리네이션에 오신 것을 환영합니다!
              <br />
              지급된 펜으로 캐릭터를 만들어보세요.
            </>
          ) : (
            <>
              소중한 의견 감사합니다!
              <br />
              지급된 펜으로 더 많은 이야기를 만들어보세요.
            </>
          )}
        </p>
      </div>
    </BaseModal>
  )
}
