'use client';

import { createContext, useContext } from 'react';
import type { ModalItem } from '@/shared/model/types/modal';

interface ModalContextProps {
  openModal: (modal: ModalItem) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextProps | null>(null);

export const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('모달 컴포넌트는 모달 내부에서 사용해야 합니다.');
  }
  return ctx;
};

export const ModalTypeContext = createContext<string | undefined>(undefined);

export const useModalType = () => useContext(ModalTypeContext);
