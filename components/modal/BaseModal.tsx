'use client'

import { useModalStore } from '@/store/useStoreModal'
import TokenModal from './TokenModal'

const MODAL_COMPONENTS = {
  token: TokenModal,

}

export default function BaseModal() {
  const { isOpen, modalType, closeModal, modalProps } = useModalStore()
  
  if (!isOpen || !modalType) return null
  
  const ModalComponent = MODAL_COMPONENTS[modalType]
  return <ModalComponent isOpen={isOpen} onClose={closeModal} {...modalProps} />
} 