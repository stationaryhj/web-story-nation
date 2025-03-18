'use client';

import { useModalStore } from '@/store/useStoreModal';
import type { ComponentType } from 'react';

import CharactorModal from './CharactorModal';
import LoginModal from './LoginModal';

// 모달 컴포넌트 맵
const MODAL_COMPONENTS: Record<string, ComponentType<any>> = {
  character: CharactorModal,
  login: LoginModal,
};

export default function BaseModal() {
  const { isOpen, modalType, closeModal, modalProps } = useModalStore();

  if (!isOpen || !modalType) return null;

  const ModalComponent = MODAL_COMPONENTS[modalType];
  if (!ModalComponent) return null;

  return <ModalComponent isOpen={ isOpen } onClose={ closeModal } { ...modalProps }/>;
}
