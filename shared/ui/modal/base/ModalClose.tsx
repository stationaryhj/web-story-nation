'use client';

import { type MotionProps, motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils/cn';

interface ModalButtonProps extends MotionProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const ModalClose: React.FC<ModalButtonProps> = ({ className, children, onClick, ...rest }) => {
  const modalClosecls = `cursor-pointer`;
  return (
    <motion.button
      type='button'
      className={cn(modalClosecls, className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

export default ModalClose;
