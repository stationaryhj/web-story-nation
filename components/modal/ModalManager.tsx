'use client'

import { useModalStore } from '@/store/useStoreModal'
import CharactorModal from './CharactorModal'
import LoginModal from './LoginModal'
import ConfirmActionModal from './ConfirmActionModal'
import NotificationSidebar from './NotificationSidebar'
import CreditSidebar from './CreditSidebar'
import AdultVerificationModal from './AdultVerificationModal'

export default function ModalManager() {
  const { isOpen, modalType, closeModal, modalProps } = useModalStore()

  if (!isOpen) {
    return null
  }

  if (modalType === 'character') {
    return <CharactorModal isOpen={isOpen} onClose={closeModal} {...modalProps} />
  }

  if (modalType === 'login') {
    return <LoginModal isOpen={isOpen} onClose={closeModal} {...modalProps} />
  }

  if (modalType === 'confirmAction') {
    return (
      <ConfirmActionModal
        isOpen={isOpen}
        onClose={closeModal}
        title={modalProps?.title || '확인'}
        description={modalProps?.description || '계속 진행하시겠습니까?'}
        onConfirm={modalProps?.onConfirm || (() => {})}
        {...modalProps}
      />
    )
  }

  if (modalType === 'notification') {
    return <NotificationSidebar />
  }

  if (modalType === 'credit') {
    return <CreditSidebar />
  }

  if (modalType === 'adultVerification') {
    return <AdultVerificationModal isOpen={isOpen} onClose={closeModal} />
  }

  return null
}
