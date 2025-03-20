'use client'

import Modal from './Modal'
import { useSettingsStore } from '@/store/useStoreSettings'

interface AdultVerificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdultVerificationModal({ isOpen, onClose }: AdultVerificationModalProps) {
  const { enableAdultMode } = useSettingsStore()

  const handleVerify = () => {
    enableAdultMode()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="성인 인증" showCloseButton={true}>
      <div className="text-secondary-600 dark:text-dark-secondary-400 mb-6">
        짜릿모드는 성인(만 19세 이상)만 이용 가능합니다. 계속하시려면 성인인증이 필요합니다.
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-secondary-600 dark:text-dark-secondary-400 hover:text-secondary-800 dark:hover:text-dark-secondary-200"
        >
          취소
        </button>
        <button onClick={handleVerify} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md">
          인증하기
        </button>
      </div>
    </Modal>
  )
}
