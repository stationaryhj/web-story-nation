'use client'

import Modal from './Modal'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  entityName?: string
  onConfirm: () => void
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  title,
  entityName = '',
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} showCloseButton={true}>
      <div className="text-center">
        <p className="mb-4 text-secondary-700 dark:text-dark-secondary-300">
          정말 {entityName ? `"${entityName}"` : '이 항목을'} 삭제하시겠습니까?
        </p>
        <p className="mb-6 text-sm text-secondary-500 dark:text-dark-secondary-500">
          이 작업은 되돌릴 수 없으며, 관련된 모든 데이터도 삭제됩니다.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded transition-colors dark:bg-dark-secondary-100/10 dark:hover:bg-dark-secondary-100/20 dark:text-dark-secondary-400"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors dark:bg-red-600 dark:hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>
    </Modal>
  )
}
