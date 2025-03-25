'use client'

import BaseModal from './BaseModal'
import { BaseButton } from '@/components/elements/button/BaseButton'
import { faWarning } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface CharacterVisibilityWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function CharacterVisibilityWarningModal({
  isOpen,
  onClose,
  onConfirm,
}: CharacterVisibilityWarningModalProps) {
  // 확인 버튼 핸들러
  const handleConfirm = () => {
    console.log('확인 버튼 클릭됨')
    onConfirm()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="캐릭터 공개 시 주의사항"
      size="md"
      footerContent={
        <div className="flex justify-end space-x-3">
          <BaseButton onClick={onClose} color="secondary">
            돌아갈래요
          </BaseButton>
          <BaseButton
            onClick={handleConfirm}
            color="primary"
            className="bg-violet-600 !text-white !border-transparent hover:bg-violet-700"
          >
            확인했어요
          </BaseButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center text-amber-500 text-6xl mb-4">
          <FontAwesomeIcon icon={faWarning} />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold mb-2">중요한 안내사항</p>
          <p className="text-gray-700">한 번 공개한 캐릭터는 비공개로 전환할 수 없어요!</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <ul className="text-sm text-amber-800 space-y-2">
            <li>• 공개된 캐릭터는 다른 사용자들에게 노출됩니다.</li>
            <li>• 모든 사용자가 해당 캐릭터와 대화할 수 있습니다.</li>
            <li>• 한 번 공개된 캐릭터는 비공개 상태로 되돌릴 수 없습니다.</li>
            <li>• 계속 진행하시려면 "확인했어요" 버튼을 클릭해주세요.</li>
          </ul>
        </div>
      </div>
    </BaseModal>
  )
}
