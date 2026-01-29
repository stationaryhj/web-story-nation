'use client';

import type { FC, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils/cn';
import useModalStore from '@/shared/model/stores/useModalStore';
import ModalBackDrop from './ModalBackDrop';
import ModalClose from './ModalClose';
import ModalContent from './ModalContent';
import { ModalContext, useModalZIndex } from './modalContexts';

interface ModalProps {
  className?: string;
  children: ReactNode;
}

interface ModalCompoundProps {
  Backdrop: typeof ModalBackDrop;
  Content: typeof ModalContent;
  Close: typeof ModalClose;
}

const Modal: FC<ModalProps> & ModalCompoundProps = ({ className, children }) => {
  const { openModal, closeModal } = useModalStore();
  const zIndex = useModalZIndex();

  const contextValue = {
    openModal,
    closeModal,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      <div
        className={cn(
          'fixed inset-0 pointer-events-auto touch-none flex items-center justify-center',
          className
        )}
        style={{ zIndex }}
        role='dialog'
        aria-modal='true'
      >
        {children}
      </div>
    </ModalContext.Provider>
  );
};

Modal.Backdrop = ModalBackDrop;
Modal.Content = ModalContent;
Modal.Close = ModalClose;

export default Modal;
