'use client';

import { type MotionProps, motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils/cn';
import useModalStore from '@/shared/model/stores/useModalStore';
import { useModalType } from './modalContexts';

interface ModalBackdropProps extends MotionProps {
  className?: string;
  disableClose?: boolean;
}

const ModalBackDrop: React.FC<ModalBackdropProps> = ({
  className,
  disableClose = false,
  ...props
}) => {
  const modalType = useModalType();
  const { closeModalByType } = useModalStore();

  const handleClose = () => {
    if (disableClose) return;
    if (modalType) {
      closeModalByType(modalType);
    }
  };

  const modalBackdropCls = `fixed inset-0 z-[9999] bg-overlay/50 pointer-events-auto touch-none`;
  return (
    <motion.div
      role='presentation'
      aria-hidden='true'
      className={cn(modalBackdropCls, className)}
      onClick={handleClose}
      {...props}
    />
  );
};

export default ModalBackDrop;
