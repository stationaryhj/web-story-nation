'use client';

import Modal from './Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entityName?: string;
  onConfirm: () => void;
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
      <div className='text-center'>
        <p className='mb-4 text-text-primary'>
          정말 {entityName ? `"${entityName}"` : '이 항목을'} 삭제하시겠습니까?
        </p>
        <p className='mb-6 text-sm text-text-muted'>
          이 작업은 되돌릴 수 없으며, 관련된 모든 데이터도 삭제됩니다.
        </p>
        <div className='flex gap-3 justify-center'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-surface-elevated hover:bg-surface-elevated-hover text-text-primary rounded transition-colors'
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className='px-4 py-2 bg-danger hover:bg-danger/90 text-text-inverse rounded transition-colors'
          >
            삭제
          </button>
        </div>
      </div>
    </Modal>
  );
}
