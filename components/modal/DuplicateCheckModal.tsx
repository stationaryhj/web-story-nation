import { useState } from 'react'
import BaseModal from './BaseModal'
import { toast } from 'react-toastify'
import { faCheckCircle, faPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface DuplicateCheckModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  originalNickname: string
}

export default function DuplicateCheckModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  originalNickname,
}: DuplicateCheckModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true)
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('닉네임 변경 중 오류:', error)
      toast.error('저장에 실패했습니다. 다시 시도 바랍니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onCancel()
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="닉네임 변경 확인"
      size="md"
      showCloseButton={true}
      preventBackdropClose={isSubmitting}
      isIcon={true}
      icon={
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg">
          <FontAwesomeIcon icon={faCheckCircle} className="text-white text-2xl" />
        </div>
      }
    >
      <div className="flex flex-col items-center space-y-6 px-4">
        {/* Success Message */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">사용 가능한 닉네임입니다</h3>
          <p className="text-base text-gray-600 dark:text-gray-400">변경하시겠습니까?</p>
        </div>

        {/* Cost Information */}
        <div className="w-full bg-amber-50 dark:bg-amber-900/20 rounded-lg p-5 flex items-center justify-center space-x-3">
          <FontAwesomeIcon icon={faPen} className="text-amber-500 dark:text-amber-400 text-lg" />
          <p className="text-base">
            <span className="text-gray-600 dark:text-gray-400">변경 시 </span>
            <span className="font-bold text-amber-500 dark:text-amber-400">100펜</span>
            <span className="text-gray-600 dark:text-gray-400">이 소모됩니다</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex w-full space-x-4 pt-2">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-medium disabled:opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            변경하기
          </button>
        </div>
      </div>
    </BaseModal>
  )
}
