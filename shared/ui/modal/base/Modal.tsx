'use client';

import type { FC, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils/cn';
import useModalStore from '@/shared/model/stores/useModalStore';
import ModalBackDrop from './ModalBackDrop';
import ModalClose from './ModalClose';
import ModalContent from './ModalContent';
import { ModalContext } from './modalContexts';

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

  const modalBaseCls = `fixed inset-0 z-[9999] pointer-events-auto touch-pan-y`;
  const contextValue = {
    openModal,
    closeModal,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      <div className={cn(modalBaseCls, className)} role='dialog' aria-modal='true'>
        {children}
      </div>
    </ModalContext.Provider>
  );
};

Modal.Backdrop = ModalBackDrop;
Modal.Content = ModalContent;
Modal.Close = ModalClose;

export default Modal;
