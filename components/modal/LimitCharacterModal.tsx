'use client'

import { useRouter } from 'next/navigation'
import BaseModal from './BaseModal'
import { BaseButton } from '@/components/elements/button/BaseButton'

interface LimitCharacterModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LimitCharacterModal({ isOpen, onClose }: LimitCharacterModalProps) {
  const router = useRouter()

  const handleConfirm = () => {
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      animation="fade"
      backdropColor="bg-black/70 backdrop-blur-sm"
      showCloseButton={false}
      preventBackdropClose={true}
      footerContent={
        <div className="flex justify-center">
          <BaseButton color="gradient" onClick={handleConfirm}>
            확인
          </BaseButton>
        </div>
      }
    >
      <div className="flex flex-col items-center py-6 space-y-4">
        <p className="text-center text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
          임시 저장 한도에 도달하여,
          <br />
          캐릭터 생성이 불가능합니다.
          <br />
          임시 저장 캐릭터를 삭제하거나,
          <br />
          캐릭터룰 완성해주세요.
        </p>
      </div>
    </BaseModal>
  )
}
