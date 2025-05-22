'use client'

import { useModalStore } from '@/store/useStoreModal'
import CharactorModal from './CharactorModal'
import LoginModal from './LoginModal'
import SignupModal from './SignupModal'
import ConfirmActionModal from './ConfirmActionModal'
import NotificationSidebar from './NotificationSidebar'

import AdultVerificationModal from './AdultVerificationModal'
import ChatModeModal from './ChatModeModal'
import BankInfoModal from './BankInfoModal'
// import CharactorOpenModal from './CharactorOpenModal'

export default function ModalManager() {
  const { isOpen, modalType, closeModal, modalProps } = useModalStore()

  if (!isOpen) {
    return null
  }

  if (modalType === 'character') {
    return <CharactorModal isOpen={isOpen} onClose={closeModal} {...modalProps} />
  }

  // if (modalType === 'characterOpen') {
  //   return <CharactorOpenModal isOpen={isOpen} onClose={closeModal} {...modalProps} />
  // }

  if (modalType === 'login') {
    return <LoginModal isOpen={isOpen} onClose={closeModal} {...modalProps} />
  }

  if (modalType === 'signup') {
    return <SignupModal isOpen={isOpen} onClose={closeModal} {...modalProps} state={'signup'} />
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

  if (modalType === 'adultVerification') {
    return <AdultVerificationModal isOpen={isOpen} onClose={closeModal} />
  }

  if (modalType === 'chatMode') {
    return (
      <ChatModeModal
        nsfw={modalProps?.nsfw || 0}
        isOpen={isOpen}
        onClose={closeModal}
        currentModeId={modalProps?.currentModeId || 1}
        onSelectMode={modalProps?.onSelectMode || (() => {})}
      />
    )
  }

  if (modalType === 'bankInfo') {
    return (
      <BankInfoModal
        isOpen={isOpen}
        onClose={closeModal}
        bankInfo={modalProps?.bankInfo || { bank: '', accountNumber: '', accountHolder: '' }}
        onBankInfoChange={modalProps?.onBankInfoChange || (() => {})}
      />
    )
  }

  return null
}
