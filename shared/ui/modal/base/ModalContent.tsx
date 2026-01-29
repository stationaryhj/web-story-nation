'use client';

import { type MotionProps, motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils/cn';

interface ModalContentProps extends MotionProps {
  className?: string;
  children: React.ReactNode;
}

const ModalContent: React.FC<ModalContentProps> = ({ className, children, ...props }) => {
  const modalContentCls = `absolute z-[2] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white pointer-events-auto rounded-[20px] py-[26px] px-[clamp(15px,2vw,32px)] shadow-md`;
  return (
    <motion.div className={cn(modalContentCls, className)} {...props}>
      {children}
    </motion.div>
  );
};

export default ModalContent;
